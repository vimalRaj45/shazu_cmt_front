import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Rating,
  Snackbar,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { TableSkeleton, EmptyState } from '../../components/common/LoadingState';
import BackButton from '../../components/common/BackButton';
import api from '../../services/api';

const STATUS_CHIPS = {
  submitted: { label: 'Submitted', color: '#1565C0', bg: '#E3F2FD' },
  under_review: { label: 'Under Review', color: '#0288D1', bg: '#E1F5FE' },
  revision_required: { label: 'Revision Required', color: '#B45309', bg: '#FEF3C7' },
  accepted: { label: 'Accepted', color: '#15803D', bg: '#DCFCE7' },
  rejected: { label: 'Rejected', color: '#64748B', bg: '#F1F5F9' },
  camera_ready_pending: { label: 'Camera-Ready Pending', color: '#1D4ED8', bg: '#DBEAFE' },
  camera_ready_approved: { label: 'Camera-Ready Approved', color: '#047857', bg: '#D1FAE5' },
};

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submission, setSubmission] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Revision Modal State
  const [openRevisionModal, setOpenRevisionModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editAbstract, setEditAbstract] = useState('');
  const [editKeywords, setEditKeywords] = useState([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [rebuttalNotes, setRebuttalNotes] = useState('');
  const [revisionFile, setRevisionFile] = useState(null);
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [revisionError, setRevisionError] = useState('');

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/submissions/${id}`);
      const subData = res.data.submission;
      setSubmission(subData);
      setEditTitle(subData.title || '');
      setEditAbstract(subData.abstract || '');
      setEditKeywords(subData.keywords || []);
    } catch (err) {
      console.error('Failed to load submission:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await api.get(`/reviews/submission/${id}`);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
    fetchReviews();
  }, [id]);

  const handleDownload = async (file) => {
    try {
      const res = await api.get(`/submissions/files/${file.id}/download`);
      window.open(res.data.downloadUrl || res.data.publicUrl, '_blank');
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to download file', severity: 'error' });
    }
  };

  const handleAddKeyword = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && keywordInput.trim()) {
      e.preventDefault();
      const kw = keywordInput.trim().replace(/,$/, '');
      if (!editKeywords.includes(kw)) {
        setEditKeywords([...editKeywords, kw]);
        setKeywordInput('');
      }
    }
  };

  const handleRemoveKeyword = (kwToRemove) => {
    setEditKeywords(editKeywords.filter((k) => k !== kwToRemove));
  };

  const handleSubmitRevision = async (e) => {
    e.preventDefault();
    if (!revisionFile) {
      setRevisionError('Please select a revised manuscript PDF file');
      return;
    }
    setRevisionError('');
    setSubmittingRevision(true);

    try {
      // 1. Update metadata if changed
      await api.put(`/submissions/${id}`, {
        title: editTitle,
        abstract: editAbstract,
        keywords: editKeywords,
      });

      // 2. Upload revised manuscript PDF + rebuttal notes
      const formData = new FormData();
      formData.append('file', revisionFile);
      formData.append('fileType', 'revision');
      formData.append('rebuttalNotes', rebuttalNotes);

      await api.post(`/submissions/${id}/upload-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSnackbar({ open: true, message: 'Revised manuscript and rebuttal submitted successfully!', severity: 'success' });
      setOpenRevisionModal(false);
      setRevisionFile(null);
      setRebuttalNotes('');
      fetchSubmission();
      fetchReviews();
    } catch (err) {
      setRevisionError(err.response?.data?.error || 'Failed to submit revision. Please try again.');
    } finally {
      setSubmittingRevision(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <TableSkeleton rows={4} columns={4} />
      </Box>
    );
  }

  if (!submission) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Submission not found</Typography>
        <Button sx={{ mt: 2 }} variant="outlined" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Box>
    );
  }

  const statusInfo = STATUS_CHIPS[submission.status] || { label: submission.status, color: '#1565C0', bg: '#E3F2FD' };
  const isAuthor = submission.corresponding_author_id === user?.id || user?.role === 'admin';
  const isRevisionRequired = submission.status === 'revision_required';

  return (
    <Box sx={{ pb: 6 }}>
      {/* Header Info */}
      <Box sx={{ mb: 2.5 }}>
        <BackButton fallbackUrl="/my-submissions" label="Back to Submissions" />
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          mb: 3.5,
          border: '1px solid #E2E8F0',
          borderRadius: 1.5,
          backgroundColor: '#FFFFFF',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ maxWidth: 780 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={submission.submission_number}
                sx={{ fontWeight: 800, backgroundColor: '#EFF6FF', color: '#1565C0', border: '1px solid #BFDBFE' }}
              />
              <Chip
                label={statusInfo.label}
                sx={{ fontWeight: 700, backgroundColor: statusInfo.bg, color: statusInfo.color }}
              />
              <Chip label={submission.track_name || 'General Track'} size="small" variant="outlined" />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#0F2942' }}>
              {submission.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Conference: <strong>{submission.conference_name} ({submission.conference_short_name})</strong>
            </Typography>
          </Box>

          {/* Action Button for Revision */}
          {isAuthor && isRevisionRequired && (
            <Button
              variant="contained"
              color="warning"
              onClick={() => setOpenRevisionModal(true)}
              startIcon={<i className="bi bi-arrow-repeat"></i>}
              sx={{ fontWeight: 700, px: 3, py: 1.25, backgroundColor: '#D97706', '&:hover': { backgroundColor: '#B45309' } }}
            >
              Submit Revised Paper
            </Button>
          )}
        </Box>
      </Paper>

      {/* Revision Required Callout Alert */}
      {isRevisionRequired && (
        <Alert
          severity="warning"
          sx={{ mb: 3.5, borderRadius: 2.5, border: '1px solid #FDE68A', backgroundColor: '#FEF3C7' }}
          action={
            <Button color="inherit" size="small" sx={{ fontWeight: 700 }} onClick={() => setOpenRevisionModal(true)}>
              Edit & Submit Revision →
            </Button>
          }
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E' }}>
            Action Required: Program Committee Requested Revision
          </Typography>
          <Typography variant="body2" sx={{ color: '#78350F', mt: 0.25 }}>
            Please inspect the peer review suggestions and comments below, update your manuscript, and submit your revised PDF along with a point-by-point rebuttal letter.
          </Typography>
          {submission.decision_notes && (
            <Box sx={{ mt: 1, p: 1.5, backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#92400E', display: 'block' }}>
                Chair Decision Notes:
              </Typography>
              <Typography variant="body2" sx={{ color: '#78350F' }}>
                {submission.decision_notes}
              </Typography>
            </Box>
          )}
        </Alert>
      )}

      {/* Author Response / Rebuttal Notice (If already submitted) */}
      {submission.rebuttal_notes && (
        <Paper elevation={0} sx={{ p: 2.5, mb: 3.5, border: '1px solid #BBF7D0', backgroundColor: '#F0FDF4', borderRadius: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <i className="bi bi-chat-left-text-fill text-success"></i>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534' }}>
              Author Rebuttal / Response to Reviewers
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#14532D', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {submission.rebuttal_notes}
          </Typography>
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Abstract, Keywords & Reviewer Feedback */}
        <Grid item xs={12} md={8}>
          {/* Abstract */}
          <Card sx={{ mb: 3, border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: '#0F2942' }}>
                Abstract
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap' }}>
                {submission.abstract}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#0F2942' }}>
                Keywords:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {submission.keywords &&
                  submission.keywords.map((kw, i) => (
                    <Chip key={i} label={kw} size="small" sx={{ backgroundColor: '#F1F5F9', fontWeight: 600 }} />
                  ))}
              </Box>
            </CardContent>
          </Card>

              {/* Microsoft CMT Standard "View Reviews" Questionnaire Section */}
              <Card sx={{ mb: 3, border: '1px solid #E2E8F0', borderRadius: 2.5, overflow: 'hidden' }}>
                {/* CMT Header Bar */}
                <Box sx={{ backgroundColor: '#0F2942', color: '#FFFFFF', px: 3, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, letterSpacing: '0.02em', textTransform: 'uppercase', fontSize: '0.8rem', color: '#90CAF9' }}>
                    Conference Management Toolkit — View Reviews
                  </Typography>
                  <Chip
                    label={`${reviews.length} Review${reviews.length === 1 ? '' : 's'} Completed`}
                    size="small"
                    sx={{ fontWeight: 700, backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#FFFFFF' }}
                  />
                </Box>

                <CardContent sx={{ p: 3 }}>
                  {reviewsLoading ? (
                    <TableSkeleton rows={2} columns={3} />
                  ) : reviews.length === 0 ? (
                    <EmptyState
                      icon="bi-hourglass-split"
                      title="Evaluation in Progress"
                      description="Peer reviews are currently in progress by the Program Committee. Once finalized, suggestions will appear here."
                    />
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                      {reviews.map((rev, idx) => (
                        <Paper
                          key={rev.id || idx}
                          elevation={0}
                          sx={{
                            p: 3,
                            border: '1px solid #CBD5E1',
                            borderRadius: 2,
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          {/* Reviewer Header */}
                          <Box sx={{ borderBottom: '2px solid #E2E8F0', pb: 1.5, mb: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1565C0' }}>
                              Reviewer #{idx + 1}
                            </Typography>
                            <Chip
                              label={rev.q_reviewer_decision || rev.recommendation || 'Evaluation Completed'}
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                backgroundColor:
                                  (rev.q_reviewer_decision || rev.recommendation)?.includes('Strongly') || (rev.q_reviewer_decision || rev.recommendation)?.includes('without')
                                    ? '#DCFCE7'
                                    : (rev.q_reviewer_decision || rev.recommendation)?.includes('Reject')
                                    ? '#FEE2E2'
                                    : '#FEF3C7',
                                color:
                                  (rev.q_reviewer_decision || rev.recommendation)?.includes('Strongly') || (rev.q_reviewer_decision || rev.recommendation)?.includes('without')
                                    ? '#166534'
                                    : (rev.q_reviewer_decision || rev.recommendation)?.includes('Reject')
                                    ? '#991B1B'
                                    : '#92400E',
                              }}
                            />
                          </Box>

                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2942', mb: 2, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                            Questions & Evaluation Criteria
                          </Typography>

                          {/* 9 CMT Questions List */}
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Q1 */}
                            <Box sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.25 }}>
                                1. Relevance to the Conference
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1565C0' }}>
                                {rev.q_relevance || 'Relevant'}
                              </Typography>
                            </Box>

                            {/* Q2 */}
                            <Box sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.25 }}>
                                2. Structure of the Paper
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1565C0' }}>
                                {rev.q_structure || 'Good'}
                              </Typography>
                            </Box>

                            {/* Q3 */}
                            <Box sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.25 }}>
                                3. Standard of Language
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1565C0' }}>
                                {rev.q_language || 'Good'}
                              </Typography>
                            </Box>

                            {/* Q4 */}
                            <Box sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.25 }}>
                                4. Relevance and Clarity of Figures and Tables
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1565C0' }}>
                                {rev.q_figures_tables || 'Well Defined'}
                              </Typography>
                            </Box>

                            {/* Q5 */}
                            <Box sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.25 }}>
                                5. Discussion and Conclusions
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1565C0' }}>
                                {rev.q_discussion_conclusions || 'Good'}
                              </Typography>
                            </Box>

                            {/* Q6 */}
                            <Box sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.25 }}>
                                6. Adequate References and Correctly Cited
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1565C0' }}>
                                {rev.q_references_cited || 'Yes'}
                              </Typography>
                            </Box>

                            {/* Q7: Reviewer Comments */}
                            <Box sx={{ p: 2, backgroundColor: '#EFF6FF', borderRadius: 1.5, border: '1px solid #BFDBFE' }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E40AF', display: 'block', mb: 0.5 }}>
                                7. Reviewer's Comments to the Authors
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#1E3A8A', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontWeight: 500 }}>
                                {rev.q_comments_authors || rev.comments_for_authors || 'No comments provided.'}
                              </Typography>
                            </Box>

                            {/* Q8: Editor Notes (Admin only) */}
                            {user?.role === 'admin' && rev.q_special_comments_editor && (
                              <Box sx={{ p: 2, backgroundColor: '#FEF3C7', borderRadius: 1.5, border: '1px solid #FDE68A' }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#92400E', display: 'block', mb: 0.5 }}>
                                  8. Special Comments to the Editor (Confidential to Chair/Admin)
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#78350F', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                  {rev.q_special_comments_editor || rev.confidential_chair_notes}
                                </Typography>
                              </Box>
                            )}

                            {/* Q9: Decision */}
                            <Box sx={{ p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
                              <Typography variant="caption" sx={{ fontWeight: 800, color: '#475569', display: 'block', mb: 0.25 }}>
                                9. Reviewer's Decision
                              </Typography>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: '#1565C0' }}>
                                {rev.q_reviewer_decision || rev.recommendation || 'Accepted with Minor Revision'}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
        </Grid>

        {/* Right Column: Files & Authors */}
        <Grid item xs={12} md={4}>
          {/* Files List */}
          <Card sx={{ mb: 3, border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: '#0F2942', display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="bi bi-folder2-open text-primary"></i> Manuscripts & Artifacts
              </Typography>

              <List disablePadding>
                {submission.files &&
                  submission.files.map((file) => (
                    <Paper
                      key={file.id}
                      elevation={0}
                      sx={{
                        p: 1.5,
                        mb: 1.5,
                        border: '1px solid #E2E8F0',
                        borderRadius: 2,
                        backgroundColor: '#F8FAFC',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ overflow: 'hidden', mr: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }} noWrap>
                            {file.file_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {file.file_type?.toUpperCase()} • v{file.version} • {(file.file_size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                        </Box>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleDownload(file)}
                          startIcon={<i className="bi bi-download"></i>}
                        >
                          PDF
                        </Button>
                      </Box>
                    </Paper>
                  ))}
              </List>

              {isAuthor && isRevisionRequired && (
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  onClick={() => setOpenRevisionModal(true)}
                  startIcon={<i className="bi bi-upload"></i>}
                  sx={{ mt: 1, fontWeight: 700 }}
                >
                  Upload Revised Version
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Authors List */}
          <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5, mb: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: '#0F2942', display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="bi bi-people text-primary"></i> Authors List
              </Typography>

              <List disablePadding>
                {submission.authors &&
                  submission.authors.map((author, idx) => (
                    <Paper key={author.id || idx} elevation={0} sx={{ p: 1.5, mb: 1, border: '1px solid #E2E8F0', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {author.name}
                        </Typography>
                        {author.is_primary && <Chip label="Primary" size="small" color="primary" sx={{ height: 20, fontSize: '0.65rem' }} />}
                      </Box>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {author.email}
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {author.institution} {author.department ? `(${author.department})` : ''}
                      </Typography>
                    </Paper>
                  ))}
              </List>
            </CardContent>
          </Card>

          {/* Assigned Reviewers Panel (Visible to Chair & Admin) */}
          {(user?.role === 'admin' || user?.activeRole === 'chair') && (
            <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F2942', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <i className="bi bi-person-check-fill text-primary"></i> Assigned Reviewers
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/chair/reviewers?subId=${submission.id}`)}
                    sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, borderRadius: 1 }}
                  >
                    Manage
                  </Button>
                </Box>

                {reviews.length === 0 ? (
                  <Box sx={{ p: 2, textAlign: 'center', backgroundColor: '#F8FAFC', borderRadius: 1.5, border: '1px dashed #CBD5E1' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      No reviewers assigned yet
                    </Typography>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => navigate(`/chair/reviewers?subId=${submission.id}`)}
                      sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 700, borderRadius: 1 }}
                    >
                      Assign Reviewers Now
                    </Button>
                  </Box>
                ) : (
                  <List disablePadding>
                    {reviews.map((rev, idx) => (
                      <Paper key={rev.id || idx} elevation={0} sx={{ p: 1.5, mb: 1, border: '1.5px solid #BFDBFE', backgroundColor: '#F8FAFC', borderRadius: 1.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1565C0' }}>
                            {rev.reviewer_first_name} {rev.reviewer_last_name}
                          </Typography>
                          <Chip
                            label={rev.q_reviewer_decision ? 'Evaluated' : 'Pending'}
                            size="small"
                            color={rev.q_reviewer_decision ? 'success' : 'default'}
                            sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                          />
                        </Box>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {rev.reviewer_email}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {rev.reviewer_institution}
                        </Typography>
                        {rev.overall_score && (
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#166534', mt: 0.5, display: 'block' }}>
                            Score: {rev.overall_score} / 5
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Revision Submission Dialog */}
      <Dialog open={openRevisionModal} onClose={() => setOpenRevisionModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', color: '#0F2942' }}>
          Submit Revised Paper & Rebuttal
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmitRevision}>
          <DialogContent sx={{ pt: 3 }}>
            {revisionError && (
              <Alert severity="error" sx={{ mb: 2.5 }}>
                {revisionError}
              </Alert>
            )}

            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0', mb: 2 }}>
              1. Edit Paper Metadata (If Modified)
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Paper Title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Abstract"
                  value={editAbstract}
                  onChange={(e) => setEditAbstract(e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Keywords"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder="Type keyword and press Enter..."
                />
                {editKeywords.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {editKeywords.map((kw, i) => (
                      <Chip key={i} label={kw} size="small" onDelete={() => handleRemoveKeyword(kw)} />
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0', mb: 2 }}>
              2. Upload Revised Manuscript PDF (Cloudflare R2)
            </Typography>

            <Box
              sx={{
                border: '2px dashed #90CAF9',
                borderRadius: 2.5,
                p: 3,
                textAlign: 'center',
                backgroundColor: '#F8FAFC',
                mb: 3,
              }}
            >
              <input
                type="file"
                accept=".pdf"
                id="revision-pdf-upload"
                style={{ display: 'none' }}
                onChange={(e) => setRevisionFile(e.target.files[0])}
              />
              <label htmlFor="revision-pdf-upload">
                <Button variant="outlined" component="span" startIcon={<i className="bi bi-file-earmark-pdf"></i>}>
                  Select Revised PDF File
                </Button>
              </label>
              {revisionFile && (
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1565C0', mt: 1.5 }}>
                  Selected: {revisionFile.name} ({(revisionFile.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              )}
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0', mb: 1 }}>
              3. Response to Reviewers & Rebuttal Letter
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Explain how you addressed reviewer suggestions point-by-point in this revised draft..."
              value={rebuttalNotes}
              onChange={(e) => setRebuttalNotes(e.target.value)}
              helperText="This response will be reviewed by the Program Committee alongside your revised PDF."
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
            <Button
              type="submit"
              variant="contained"
              color="warning"
              disabled={submittingRevision}
              startIcon={submittingRevision ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <i className="bi bi-cloud-arrow-up" />}
              sx={{
                fontWeight: 700,
                borderRadius: 1.5,
                '&.Mui-disabled': { backgroundColor: '#D97706', color: '#FFFFFF', opacity: 0.85 },
              }}
            >
              {submittingRevision ? 'Submitting Revision...' : 'Confirm & Submit Revision'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Feedback Toast */}
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
