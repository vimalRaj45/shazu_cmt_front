import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Paper,
  Divider,
  Grid,
  Snackbar,
} from '@mui/material';
import { useConference } from '../../context/ConferenceContext';
import { TableSkeleton, EmptyState } from '../../components/common/LoadingState';
import BackButton from '../../components/common/BackButton';
import api from '../../services/api';

export default function DecisionsPage() {
  const { selectedConference } = useConference();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Decision Modal State
  const [decisionModal, setDecisionModal] = useState({
    open: false,
    submission: null,
    reviews: [],
  });
  const [decisionValue, setDecisionValue] = useState('accept');
  const [decisionNotes, setDecisionNotes] = useState('');
  const [notifyAuthor, setNotifyAuthor] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [modalError, setModalError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const fetchSubmissions = async () => {
    if (!selectedConference?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/submissions/conference/${selectedConference.id}`);
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error('Failed to load submissions for decisions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [selectedConference]);

  const handleOpenDecisionModal = async (sub) => {
    try {
      const revRes = await api.get(`/reviews/submission/${sub.id}`);
      const decRes = await api.get(`/decisions/submission/${sub.id}`);

      setDecisionModal({
        open: true,
        submission: sub,
        reviews: revRes.data.reviews || [],
      });

      if (decRes.data.decision) {
        setDecisionValue(decRes.data.decision.decision);
        setDecisionNotes(decRes.data.decision.decision_notes || '');
      } else {
        setDecisionValue('accept');
        setDecisionNotes('');
      }
      setFeedbackMsg('');
      setModalError('');
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to load submission review details', severity: 'error' });
    }
  };

  const handleSaveDecision = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalError('');
    try {
      await api.post(`/decisions/submission/${decisionModal.submission.id}`, {
        decision: decisionValue,
        decisionNotes,
        notifyAuthor,
      });

      setFeedbackMsg(`Decision successfully saved! ${notifyAuthor ? 'Author notification email sent via Brevo.' : ''}`);
      setTimeout(() => {
        setDecisionModal({ open: false, submission: null, reviews: [] });
        fetchSubmissions();
      }, 1500);
    } catch (err) {
      setModalError(err.response?.data?.error || 'Failed to save decision');
    } finally {
      setSaving(false);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    const matchesSearch =
      !search ||
      s.title?.toLowerCase().includes(search.toLowerCase()) ||
      s.submission_number?.toLowerCase().includes(search.toLowerCase()) ||
      s.author_first_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.author_last_name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'decided' && s.decision) ||
      (statusFilter === 'pending' && !s.decision) ||
      (statusFilter === s.decision);

    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BackButton fallbackUrl="/dashboard" />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F2942' }}>
            Paper Decisions Desk
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review peer evaluations, calibrate scores, and finalize accept/reject/revision outcomes
          </Typography>
        </Box>
      </Box>

      {/* Search & Filter Bar */}
      <Card sx={{ mb: 3, p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search manuscripts by paper ID, title, or author name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <i className="bi bi-search" style={{ marginRight: 8, color: '#1565C0' }}></i>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                size="small"
                label="Decision Status Filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Submissions</MenuItem>
                <MenuItem value="pending">Pending Decision</MenuItem>
                <MenuItem value="decided">Decision Published</MenuItem>
                <MenuItem value="accept">Accepted Only</MenuItem>
                <MenuItem value="revision_required">Revision Required</MenuItem>
                <MenuItem value="reject">Rejected Only</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        {loading ? (
          <TableSkeleton rows={4} columns={6} />
        ) : filteredSubmissions.length === 0 ? (
          <EmptyState
            icon="bi-check2-circle"
            title="No Submissions Match"
            description="No paper submissions matched your search criteria."
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Paper ID</TableCell>
                  <TableCell>Title & Author</TableCell>
                  <TableCell>Completed Reviews</TableCell>
                  <TableCell>Avg Score</TableCell>
                  <TableCell>Current Decision</TableCell>
                  <TableCell align="right">Decision Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubmissions.map((sub) => (
                  <TableRow key={sub.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#1565C0' }}>
                        {sub.submission_number}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F2942' }}>
                        {sub.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sub.author_first_name} {sub.author_last_name} ({sub.author_email})
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${sub.completed_reviews_count || 0} / ${sub.assigned_reviewers_count || 0} Reviews`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          backgroundColor: sub.completed_reviews_count > 0 ? '#E3F2FD' : '#F1F5F9',
                          color: sub.completed_reviews_count > 0 ? '#1565C0' : '#64748B',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {sub.average_score ? (
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1565C0' }}>
                          {sub.average_score} / 5
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">No scores</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {sub.decision ? (
                        <Chip
                          label={sub.decision.toUpperCase()}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            backgroundColor: sub.decision === 'accept' ? '#E3F2FD' : sub.decision === 'reject' ? '#FEE2E2' : '#FEF3C7',
                            color: sub.decision === 'accept' ? '#1565C0' : sub.decision === 'reject' ? '#991B1B' : '#92400E',
                            border: `1px solid ${sub.decision === 'accept' ? '#BBDEFB' : sub.decision === 'reject' ? '#FCA5A5' : '#FCD34D'}`,
                          }}
                        />
                      ) : (
                        <Chip label="PENDING" size="small" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenDecisionModal(sub)}
                        startIcon={<i className="bi bi-pencil-square"></i>}
                      >
                        {sub.decision ? 'Edit Decision' : 'Make Decision'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Make Decision Dialog */}
      <Dialog open={decisionModal.open} onClose={() => setDecisionModal({ open: false, submission: null, reviews: [] })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', color: '#0F2942' }}>
          Paper Decision: {decisionModal.submission?.submission_number}
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveDecision}>
          <DialogContent sx={{ pt: 3 }}>
            {feedbackMsg && <Alert severity="success" sx={{ mb: 2 }}>{feedbackMsg}</Alert>}
            {modalError && <Alert severity="error" sx={{ mb: 2 }}>{modalError}</Alert>}

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: '#1565C0' }}>
              {decisionModal.submission?.title}
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Peer Reviews List */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1, color: '#0F2942' }}>
              <i className="bi bi-journal-check" style={{ color: '#1565C0' }}></i> Peer Review Scorecards ({decisionModal.reviews.length})
            </Typography>

            {decisionModal.reviews.length === 0 ? (
              <Alert severity="warning" sx={{ mb: 3 }}>
                No completed reviews have been submitted for this paper yet.
              </Alert>
            ) : (
              decisionModal.reviews.map((rev, idx) => (
                <Paper key={rev.id || idx} elevation={0} sx={{ p: 2.5, mb: 2.5, border: '1px solid #CBD5E1', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1565C0' }}>
                      Reviewer #{idx + 1}: {rev.reviewer_first_name} {rev.reviewer_last_name} ({rev.reviewer_institution || 'PC Member'})
                    </Typography>
                    <Chip
                      label={rev.q_reviewer_decision || rev.recommendation || 'Evaluated'}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        backgroundColor: '#DCFCE7',
                        color: '#166534',
                      }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ color: '#334155', mb: 1 }}>
                    <strong>Review Score:</strong> {rev.overall_score} / 5
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic', backgroundColor: '#F8FAFC', p: 1.5, borderRadius: 1.5 }}>
                    "{rev.comments_for_authors || rev.q_comments_authors || 'No comments provided'}"
                  </Typography>
                </Paper>
              ))
            )}

            <Divider sx={{ my: 2.5 }} />

            {/* Decision Controls */}
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0F2942' }}>
              Final Program Chair Decision
            </Typography>

            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Decision Outcome *"
                  value={decisionValue}
                  onChange={(e) => setDecisionValue(e.target.value)}
                  required
                >
                  <MenuItem value="accept">Accept (Proceed to Camera-Ready)</MenuItem>
                  <MenuItem value="revision_required">Revision Required (Author must re-submit)</MenuItem>
                  <MenuItem value="reject">Reject</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Switch checked={notifyAuthor} onChange={(e) => setNotifyAuthor(e.target.checked)} color="primary" />}
                  label="Notify Authors via Email Broadcast"
                  sx={{ mt: 1 }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Decision Remarks / Feedback for Authors"
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Provide feedback and instructions for camera-ready submission or revisions..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setDecisionModal({ open: false, submission: null, reviews: [] })}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Record & Publish Decision'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Global Toast Feedback */}
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
