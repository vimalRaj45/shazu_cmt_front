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
  Rating,
  Alert,
  Paper,
  Divider,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { LoadingSpinner, EmptyState } from '../../components/common/LoadingState';
import api from '../../services/api';

export default function ReviewerWorkspacePage() {
  const [assignments, setAssignments] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review Form state
  const [reviewData, setReviewData] = useState({
    technicalQuality: 4,
    originality: 4,
    relevance: 5,
    presentationQuality: 4,
    overallScore: 4,
    recommendation: 'accept',
    commentsForAuthors: '',
    confidentialChairNotes: '',
    isDraft: false,
  });

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
        setReviewData({
          technicalQuality: rev.technical_quality || 3,
          originality: rev.originality || 3,
          relevance: rev.relevance || 3,
          presentationQuality: rev.presentation_quality || 3,
          overallScore: rev.overall_score || 3,
          recommendation: rev.recommendation || 'accept',
          commentsForAuthors: rev.comments_for_authors || '',
          confidentialChairNotes: rev.confidential_chair_notes || '',
          isDraft: rev.is_draft,
        });
      } else {
        setReviewData({
          technicalQuality: 4,
          originality: 4,
          relevance: 4,
          presentationQuality: 4,
          overallScore: 4,
          recommendation: 'accept',
          commentsForAuthors: '',
          confidentialChairNotes: '',
          isDraft: true,
        });
      }
    } catch (err) {
      console.error('Failed to load review details:', err);
    }
  };

  const handleSaveReview = async (isDraftMode) => {
    if (!selectedSubId) return;
    setSaving(true);

    try {
      await api.post(`/reviews/submission/${selectedSubId}`, {
        ...reviewData,
        isDraft: isDraftMode,
      });

      setSnackbar({
        open: true,
        message: isDraftMode ? 'Review draft saved successfully!' : 'Final review submitted and locked!',
        severity: 'success',
      });

      fetchAssignments();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || 'Failed to submit review',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      const res = await api.get(`/submissions/files/${file.id}/download`);
      window.open(res.data.downloadUrl || res.data.publicUrl, '_blank');
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to download manuscript', severity: 'error' });
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F2942' }}>
          Reviewer Evaluation Workspace
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Download assigned manuscripts, conduct structured evaluations, and submit scores
        </Typography>
      </Box>

      {loading ? (
        <LoadingSpinner message="Loading assigned manuscripts..." minHeight={300} />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon="bi-journal-check"
          title="No Papers Assigned"
          description="You currently have no papers assigned for peer evaluation in this conference."
        />
      ) : (
        <Grid container spacing={3}>
          {/* Left Column: Assigned Papers Queue */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#0F2942' }}>
                  <i className="bi bi-journal-bookmark" style={{ color: '#1565C0' }}></i> Assigned Manuscripts ({assignments.length})
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {assignments.map((assign) => {
                    const isSelected = selectedSubId === assign.submission_id;
                    return (
                      <Paper
                        key={assign.assignment_id}
                        elevation={0}
                        onClick={() => handleSelectAssignment(assign)}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: `1.5px solid ${isSelected ? '#1565C0' : '#E2E8F0'}`,
                          backgroundColor: isSelected ? '#F0F7FF' : '#FFFFFF',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': { borderColor: '#90CAF9' },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#1565C0' }}>
                            {assign.submission_number}
                          </Typography>
                          <Chip
                            label={assign.review_id && !assign.is_draft ? 'COMPLETED' : assign.is_draft ? 'DRAFT' : 'PENDING'}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.675rem',
                              backgroundColor: assign.review_id && !assign.is_draft ? '#E3F2FD' : '#FEF3C7',
                              color: assign.review_id && !assign.is_draft ? '#1565C0' : '#92400E',
                            }}
                          />
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', color: '#0F2942' }}>
                          {assign.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                          Track: {assign.track_name || 'General'} • Due: {assign.review_deadline ? new Date(assign.review_deadline).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Review & Evaluation Form */}
          <Grid item xs={12} md={8}>
            {selectedAssignment && (
              <Card sx={{ p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
                <CardContent>
                  {/* Paper Summary & Manuscript Download */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Chip label={selectedAssignment.submission_number} sx={{ fontWeight: 800, color: '#1565C0', backgroundColor: '#E3F2FD', mb: 1 }} />
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F2942' }}>
                        {selectedAssignment.title}
                      </Typography>
                    </Box>

                    {selectedAssignment.files && selectedAssignment.files.length > 0 && (
                      <Button
                        variant="contained"
                        onClick={() => handleDownloadFile(selectedAssignment.files[0])}
                        startIcon={<i className="bi bi-file-earmark-pdf"></i>}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        Download PDF
                      </Button>
                    )}
                  </Box>

                  <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#1565C0', display: 'block', mb: 0.5 }}>
                      ABSTRACT:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6 }}>
                      {selectedAssignment.abstract}
                    </Typography>
                  </Paper>

                  <Divider sx={{ my: 3 }} />

                  {/* Structured 5-Point Evaluation Form */}
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#0F2942' }}>
                    <i className="bi bi-ui-checks" style={{ color: '#1565C0' }}></i> Structured Evaluation Criteria (Score 1 to 5)
                  </Typography>

                  <Grid container spacing={2.5}>
                    {[
                      { label: 'Technical Quality & Rigor', field: 'technicalQuality', desc: 'Methodological correctness and technical depth' },
                      { label: 'Originality & Novelty', field: 'originality', desc: 'Novel contributions and innovation level' },
                      { label: 'Relevance to Conference', field: 'relevance', desc: 'Alignment with conference tracks and topics' },
                      { label: 'Presentation & Clarity', field: 'presentationQuality', desc: 'Readability, organization, and visual quality' },
                      { label: 'Overall Evaluation Score', field: 'overallScore', desc: 'General assessment and acceptance recommendation' },
                    ].map((crit) => (
                      <Grid item xs={12} sm={6} key={crit.field}>
                        <Paper elevation={0} sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F2942' }}>
                            {crit.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                            {crit.desc}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Rating
                              value={reviewData[crit.field]}
                              onChange={(_, val) => setReviewData({ ...reviewData, [crit.field]: val })}
                              max={5}
                              sx={{ color: '#1565C0' }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#1565C0' }}>
                              ({reviewData[crit.field]} / 5)
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}

                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, border: '1px solid #E2E8F0', borderRadius: 2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#0F2942' }}>
                          Reviewer Recommendation
                        </Typography>
                        <TextField
                          fullWidth
                          select
                          size="small"
                          value={reviewData.recommendation}
                          onChange={(e) => setReviewData({ ...reviewData, recommendation: e.target.value })}
                        >
                          <MenuItem value="accept">Accept (Oral/Poster)</MenuItem>
                          <MenuItem value="minor_revision">Minor Revision</MenuItem>
                          <MenuItem value="major_revision">Major Revision</MenuItem>
                          <MenuItem value="reject">Reject</MenuItem>
                        </TextField>
                      </Paper>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#0F2942' }}>
                      Detailed Comments for Authors (Required)
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={reviewData.commentsForAuthors}
                      onChange={(e) => setReviewData({ ...reviewData, commentsForAuthors: e.target.value })}
                      placeholder="Provide constructive feedback, strengths, weaknesses, questions, and revision suggestions for authors..."
                    />
                  </Box>

                  <Box sx={{ mt: 2.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1565C0' }}>
                      🔒 Confidential Comments for Program Chairs (Optional)
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={reviewData.confidentialChairNotes}
                      onChange={(e) => setReviewData({ ...reviewData, confidentialChairNotes: e.target.value })}
                      placeholder="Private remarks for the conference chair (hidden from authors)..."
                      sx={{ backgroundColor: '#F0F7FF', borderRadius: 1 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3.5 }}>
                    <Button
                      variant="outlined"
                      disabled={saving}
                      onClick={() => handleSaveReview(true)}
                      startIcon={<i className="bi bi-save"></i>}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      variant="contained"
                      disabled={saving}
                      onClick={() => handleSaveReview(false)}
                      startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <i className="bi bi-lock-fill"></i>}
                    >
                      {saving ? 'Submitting...' : 'Submit Final Review'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      )}

      {/* Snackbar */}
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
