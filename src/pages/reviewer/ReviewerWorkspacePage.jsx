import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  TextField,
  MenuItem,
  Alert,
  Paper,
  Divider,
  CircularProgress,
  Snackbar,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from '@mui/material';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingState';
import BackButton from '../../components/common/BackButton';
import ConfirmModal from '../../components/common/ConfirmModal';
import api from '../../services/api';

const DECISION_OPTIONS = [
  { value: 'Strongly Accepted', label: 'Strongly Accepted', color: '#15803D' },
  { value: 'Accepted without Revision', label: 'Accepted without Revision', color: '#16A34A' },
  { value: 'Accepted with Minor Revision', label: 'Accepted with Minor Revision', color: '#C47D4C' },
  { value: 'Rejected', label: 'Rejected', color: '#DC2626' },
];

export default function ReviewerWorkspacePage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmLockOpen, setConfirmLockOpen] = useState(false);

  // 9 Microsoft CMT Standard Questions state
  const [qRelevance, setQRelevance] = useState('Relevant');
  const [qStructure, setQStructure] = useState('Good');
  const [qLanguage, setQLanguage] = useState('Good');
  const [qFiguresTables, setQFiguresTables] = useState('Well Defined');
  const [qDiscussionConclusions, setQDiscussionConclusions] = useState('Good');
  const [qReferencesCited, setQReferencesCited] = useState('Yes');
  const [qCommentsAuthors, setQCommentsAuthors] = useState('');
  const [qSpecialCommentsEditor, setQSpecialCommentsEditor] = useState('Yes');
  const [qReviewerDecision, setQReviewerDecision] = useState('Accepted with Minor Revision');
  const [isDraft, setIsDraft] = useState(false);

  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews/my-assignments');
      const items = res.data.assignments || [];
      setAssignments(items);

      if (items.length > 0) {
        handleSelectAssignment(items[0]);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleSelectAssignment = async (assign) => {
    setSelectedSubId(assign.submission_id);
    setSelectedAssignment(assign);

    try {
      const res = await api.get(`/reviews/submission/${assign.submission_id}`);
      const rev = res.data.review;
      if (rev) {
        setQRelevance(rev.q_relevance || 'Relevant');
        setQStructure(rev.q_structure || 'Good');
        setQLanguage(rev.q_language || 'Good');
        setQFiguresTables(rev.q_figures_tables || 'Well Defined');
        setQDiscussionConclusions(rev.q_discussion_conclusions || 'Good');
        setQReferencesCited(rev.q_references_cited || 'Yes');
        setQCommentsAuthors(rev.q_comments_authors || rev.comments_for_authors || '');
        setQSpecialCommentsEditor(rev.q_special_comments_editor || rev.confidential_chair_notes || 'Yes');
        setQReviewerDecision(rev.q_reviewer_decision || rev.recommendation || 'Accepted with Minor Revision');
        setIsDraft(rev.is_draft || false);
      } else {
        // Reset defaults
        setQRelevance('Relevant');
        setQStructure('Good');
        setQLanguage('Good');
        setQFiguresTables('Well Defined');
        setQDiscussionConclusions('Good');
        setQReferencesCited('Yes');
        setQCommentsAuthors('');
        setQSpecialCommentsEditor('Yes');
        setQReviewerDecision('Accepted with Minor Revision');
        setIsDraft(false);
      }
    } catch (err) {
      console.error('Failed to load review details:', err);
    }
  };

  const handleOpenFinalSubmitConfirmation = () => {
    if (!qCommentsAuthors.trim()) {
      setSnackbar({ open: true, message: 'Please provide reviewer comments to the authors (Question 7)', severity: 'warning' });
      return;
    }
    setConfirmLockOpen(true);
  };

  const handleSaveReview = async (asDraft = false) => {
    if (!asDraft && !qCommentsAuthors.trim()) {
      setSnackbar({ open: true, message: 'Please provide reviewer comments to the authors (Question 7)', severity: 'warning' });
      return;
    }

    setConfirmLockOpen(false);
    setSaving(true);
    try {
      await api.post(`/reviews/submission/${selectedSubId}`, {
        qRelevance,
        qStructure,
        qLanguage,
        qFiguresTables,
        qDiscussionConclusions,
        qReferencesCited,
        qCommentsAuthors,
        qSpecialCommentsEditor,
        qReviewerDecision,
        isDraft: asDraft,
      });

      setSnackbar({
        open: true,
        message: asDraft ? 'Review draft saved successfully!' : 'Review finalized & locked successfully!',
        severity: 'success',
      });

      fetchAssignments();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to save review', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadManuscript = async (file) => {
    try {
      const res = await api.get(`/submissions/files/${file.id}/download`);
      window.open(res.data.downloadUrl || res.data.publicUrl, '_blank');
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to download manuscript', severity: 'error' });
    }
  };

  if (loading) return <LoadingSpinner message="Loading assigned manuscripts queue..." />;

  if (assignments.length === 0) {
    return (
      <Box sx={{ pb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#0F2942' }}>
          Peer Reviewer Evaluation Workspace
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Access double-blind papers and submit structured evaluations
        </Typography>
        <EmptyState
          icon="bi-journal-check"
          title="No Papers Currently Assigned"
          description="You have completed all pending reviews or no new papers have been assigned to your committee profile."
        />
      </Box>
    );
  }

  const isLocked = selectedAssignment?.review_id && !selectedAssignment?.is_draft;

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3.5 }}>
        <BackButton fallbackUrl="/dashboard" />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F2942' }}>
            Peer Reviewer Evaluation Workspace
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Microsoft CMT standard 9-question evaluation form for double-blind academic review
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Side: Assigned Papers Queue */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F2942' }}>
                  Assigned Queue
                </Typography>
                <Chip label={`${assignments.length} Papers`} size="small" sx={{ fontWeight: 700, backgroundColor: '#E3F2FD', color: '#1565C0' }} />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {assignments.map((item) => {
                  const isSelected = item.submission_id === selectedSubId;
                  const hasFinalReview = item.review_id && !item.is_draft;
                  const hasDraft = item.review_id && item.is_draft;

                  return (
                    <Paper
                      key={item.assignment_id}
                      elevation={0}
                      onClick={() => handleSelectAssignment(item)}
                      sx={{
                        p: 2,
                        cursor: 'pointer',
                        borderRadius: 2,
                        border: isSelected ? '2px solid #1565C0' : '1px solid #E2E8F0',
                        backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                        transition: 'all 0.15s ease',
                        '&:hover': { borderColor: '#90CAF9', backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC' },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#1565C0', fontFamily: 'monospace' }}>
                          {item.submission_number}
                        </Typography>
                        {hasFinalReview ? (
                          <Chip label="Locked" size="small" color="success" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                        ) : hasDraft ? (
                          <Chip label="Draft" size="small" color="warning" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }} />
                        ) : (
                          <Chip label="Pending" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, backgroundColor: '#F1F5F9' }} />
                        )}
                      </Box>

                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F2942', mb: 0.5, lineHeight: 1.3 }}>
                        {item.title}
                      </Typography>

                      <Typography variant="caption" color="text.secondary" display="block">
                        Track: {item.track_name || 'General'}
                      </Typography>
                    </Paper>
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Microsoft CMT 9-Question Evaluation Form */}
        <Grid item xs={12} md={8}>
          {selectedAssignment ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Paper Metadata & Download Card */}
              <Paper elevation={0} sx={{ p: 3, border: '1px solid #E2E8F0', borderRadius: 2.5, backgroundColor: '#FFFFFF' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Chip label={selectedAssignment.submission_number} sx={{ fontWeight: 800, backgroundColor: '#E3F2FD', color: '#1565C0' }} />
                      <Chip label={selectedAssignment.conference_short_name} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F2942' }}>
                      {selectedAssignment.title}
                    </Typography>
                  </Box>

                  {/* Download Manuscript Button */}
                  {selectedAssignment.files && selectedAssignment.files.length > 0 && (
                    <Button
                      variant="contained"
                      onClick={() => handleDownloadManuscript(selectedAssignment.files[0])}
                      startIcon={<i className="bi bi-file-earmark-pdf-fill"></i>}
                      sx={{ fontWeight: 700 }}
                    >
                      Download Manuscript PDF
                    </Button>
                  )}
                </Box>

                <Typography variant="body2" sx={{ color: '#475569', lineHeight: 1.6, mt: 1 }}>
                  <strong>Abstract:</strong> {selectedAssignment.abstract}
                </Typography>
              </Paper>

              {/* Locked Notice Banner */}
              {isLocked && (
                <Alert severity="success" icon={<i className="bi bi-check2-circle"></i>} sx={{ borderRadius: 2 }}>
                  <strong>Review Finalized & Locked</strong> — This evaluation was submitted to the Program Committee.
                </Alert>
              )}

              {/* Questionnaire Form */}
              <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
                <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F2942', mb: 1 }}>
                    Review Questions
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
                    Please answer all 9 standard evaluation questions below:
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Q1 */}
                    <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2942', mb: 1.5 }}>
                        1. Relevance to the Conference
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        disabled={isLocked}
                        value={qRelevance}
                        onChange={(e) => setQRelevance(e.target.value)}
                      >
                        <MenuItem value="Highly Relevant">Highly Relevant</MenuItem>
                        <MenuItem value="Relevant">Relevant</MenuItem>
                        <MenuItem value="Marginally Relevant">Marginally Relevant</MenuItem>
                        <MenuItem value="Not Relevant">Not Relevant</MenuItem>
                      </TextField>
                    </Paper>

                    {/* Q2 */}
                    <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2942', mb: 1.5 }}>
                        2. Structure of the Paper
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        disabled={isLocked}
                        value={qStructure}
                        onChange={(e) => setQStructure(e.target.value)}
                      >
                        <MenuItem value="Excellent">Excellent</MenuItem>
                        <MenuItem value="Good">Good</MenuItem>
                        <MenuItem value="Average">Average</MenuItem>
                        <MenuItem value="Poor">Poor</MenuItem>
                      </TextField>
                    </Paper>

                    {/* Q3 */}
                    <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2942', mb: 1.5 }}>
                        3. Standard of Language
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        disabled={isLocked}
                        value={qLanguage}
                        onChange={(e) => setQLanguage(e.target.value)}
                      >
                        <MenuItem value="Excellent">Excellent</MenuItem>
                        <MenuItem value="Good">Good</MenuItem>
                        <MenuItem value="Acceptable">Acceptable</MenuItem>
                        <MenuItem value="Needs Improvement">Needs Improvement</MenuItem>
                      </TextField>
                    </Paper>

                    {/* Q4 */}
                    <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2942', mb: 1.5 }}>
                        4. Relevance and Clarity of Figures and Tables
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        disabled={isLocked}
                        value={qFiguresTables}
                        onChange={(e) => setQFiguresTables(e.target.value)}
                      >
                        <MenuItem value="Well Defined">Well Defined</MenuItem>
                        <MenuItem value="Adequate">Adequate</MenuItem>
                        <MenuItem value="Needs Improvement">Needs Improvement</MenuItem>
                        <MenuItem value="Poor">Poor</MenuItem>
                      </TextField>
                    </Paper>

                    {/* Q5 */}
                    <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2942', mb: 1.5 }}>
                        5. Discussion and Conclusions
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        disabled={isLocked}
                        value={qDiscussionConclusions}
                        onChange={(e) => setQDiscussionConclusions(e.target.value)}
                      >
                        <MenuItem value="Strong & Comprehensive">Strong & Comprehensive</MenuItem>
                        <MenuItem value="Good">Good</MenuItem>
                        <MenuItem value="Adequate">Adequate</MenuItem>
                        <MenuItem value="Weak">Weak</MenuItem>
                      </TextField>
                    </Paper>

                    {/* Q6 */}
                    <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2942', mb: 1.5 }}>
                        6. Adequate References and Correctly Cited
                      </Typography>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        disabled={isLocked}
                        value={qReferencesCited}
                        onChange={(e) => setQReferencesCited(e.target.value)}
                      >
                        <MenuItem value="Yes">Yes</MenuItem>
                        <MenuItem value="Partially">Partially</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </TextField>
                    </Paper>

                    {/* Q7 */}
                    <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2942', mb: 0.5 }}>
                        7. Reviewer's Comments to the Authors *
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        Provide clear, constructive remarks and suggestions (e.g. 1) Pages to be reduced, 2) Clarity of figures to be enhanced)
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={5}
                        disabled={isLocked}
                        placeholder="1) ...&#10;2) ..."
                        value={qCommentsAuthors}
                        onChange={(e) => setQCommentsAuthors(e.target.value)}
                      />
                    </Paper>

                    {/* Q8 */}
                    <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <i className="bi bi-shield-lock text-primary"></i>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2942' }}>
                          8. Special Comments to the Editor: Whether the Manuscript meets the standard of Conference Proceedings?
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                        Strictly confidential to the Program Chair / Editor (hidden from authors).
                      </Typography>
                      <TextField
                        fullWidth
                        disabled={isLocked}
                        value={qSpecialCommentsEditor}
                        onChange={(e) => setQSpecialCommentsEditor(e.target.value)}
                        placeholder="e.g. Yes / No / With revisions"
                        size="small"
                      />
                    </Paper>

                    {/* Q9 */}
                    <Paper elevation={0} sx={{ p: 2.5, backgroundColor: '#EFF6FF', border: '2px solid #BFDBFE', borderRadius: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1565C0', mb: 1.5 }}>
                        9. Reviewer's Decision *
                      </Typography>
                      <FormControl component="fieldset">
                        <RadioGroup
                          value={qReviewerDecision}
                          onChange={(e) => setQReviewerDecision(e.target.value)}
                        >
                          {DECISION_OPTIONS.map((opt) => (
                            <FormControlLabel
                              key={opt.value}
                              value={opt.value}
                              disabled={isLocked}
                              control={<Radio />}
                              label={
                                <Typography variant="body2" sx={{ fontWeight: 700, color: opt.color }}>
                                  {opt.label}
                                </Typography>
                              }
                            />
                          ))}
                        </RadioGroup>
                      </FormControl>
                    </Paper>

                    {/* Action Buttons */}
                    {!isLocked && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                        <Button
                          variant="outlined"
                          disabled={saving}
                          onClick={() => handleSaveReview(true)}
                          startIcon={<i className="bi bi-save"></i>}
                          sx={{
                            px: 3,
                            py: 1.25,
                            fontWeight: 700,
                            borderColor: '#527A68',
                            color: '#123B32',
                            '&:hover': { backgroundColor: '#F5F3EC', borderColor: '#123B32' },
                          }}
                        >
                          Save as Draft
                        </Button>
                        <Button
                          variant="contained"
                          disabled={saving}
                          onClick={handleOpenFinalSubmitConfirmation}
                          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <i className="bi bi-lock-fill"></i>}
                          sx={{
                            px: 4,
                            py: 1.25,
                            fontWeight: 700,
                            backgroundColor: '#123B32',
                            color: '#FFFFFF',
                            '&:hover': { backgroundColor: '#0B241E' },
                          }}
                        >
                          Submit Final Review
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <EmptyState title="Select a paper to review" description="Choose a manuscript from your assigned queue on the left." />
          )}
        </Grid>
      </Grid>

      {/* Final Review Submission Confirmation Modal */}
      <ConfirmModal
        open={confirmLockOpen}
        title="Finalize & Submit Peer Review"
        message={`Are you sure you want to submit your finalized evaluation scorecard for manuscript #${selectedAssignment?.submission_number}? Once locked, your review and recommendation ("${qReviewerDecision}") will be submitted to the Program Chair and cannot be edited.`}
        confirmText="Yes, Submit Final Review"
        cancelText="Review Evaluation Again"
        severity="info"
        loading={saving}
        onConfirm={() => handleSaveReview(false)}
        onCancel={() => setConfirmLockOpen(false)}
      />

      {/* Toast Feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
