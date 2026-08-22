import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Autocomplete,
} from '@mui/material';
import { useConference } from '../../context/ConferenceContext';
import { useLocation } from 'react-router-dom';
import { TableSkeleton, EmptyState } from '../../components/common/LoadingState';
import api from '../../services/api';

export default function ReviewerAssignmentPage() {
  const { selectedConference } = useConference();
  const location = useLocation();

  const [submissions, setSubmissions] = useState([]);
  const [selectedSubId, setSelectedSubId] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewersWithConflicts, setReviewersWithConflicts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignedReviewerIds, setAssignedReviewerIds] = useState(new Set());

  // Action loading states
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Invite reviewer modal
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Toast Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Load submissions list
  useEffect(() => {
    if (!selectedConference?.id) return;
    const fetchSubs = async () => {
      try {
        const res = await api.get(`/submissions/conference/${selectedConference.id}`);
        const subs = res.data.submissions || [];
        setSubmissions(subs);

        const params = new URLSearchParams(location.search);
        const paramSubId = params.get('subId');
        if (paramSubId) {
          setSelectedSubId(paramSubId);
        } else if (subs.length > 0) {
          setSelectedSubId(subs[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch submissions:', err);
      }
    };
    fetchSubs();
  }, [selectedConference, location.search]);

  // When selected submission changes, load details & conflicts
  const loadConflictsAndAssignments = async () => {
    if (!selectedSubId) return;
    setLoading(true);
    try {
      // 1. Get submission details
      const subRes = await api.get(`/submissions/${selectedSubId}`);
      setSelectedSubmission(subRes.data.submission);

      // 2. Get conflict matrix
      const confRes = await api.get(`/reviewers/conflicts/submission/${selectedSubId}`);
      setReviewersWithConflicts(confRes.data.reviewersWithConflictStatus || []);

      // 3. Get currently assigned reviewers
      const reviewsRes = await api.get(`/reviews/submission/${selectedSubId}`);
      const assignedIds = new Set((reviewsRes.data.reviews || []).map((r) => r.reviewer_id));
      setAssignedReviewerIds(assignedIds);
    } catch (err) {
      console.error('Failed to analyze reviewer conflicts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConflictsAndAssignments();
  }, [selectedSubId]);

  const handleAssign = async (reviewerId) => {
    setActionLoadingId(`assign-${reviewerId}`);
    try {
      await api.post('/reviewers/assign', {
        submissionId: selectedSubId,
        reviewerId,
      });
      setSnackbar({ open: true, message: 'Reviewer assigned successfully!', severity: 'success' });
      await loadConflictsAndAssignments();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to assign reviewer', severity: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUnassign = async (reviewerId) => {
    setActionLoadingId(`unassign-${reviewerId}`);
    try {
      await api.delete('/reviewers/assign', {
        data: {
          submissionId: selectedSubId,
          reviewerId,
        },
      });
      setSnackbar({ open: true, message: 'Reviewer unassigned from paper.', severity: 'info' });
      await loadConflictsAndAssignments();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to unassign reviewer', severity: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleInviteReviewer = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setInviteError('');
    try {
      await api.post(`/reviewers/conference/${selectedConference.id}/invite`, {
        email: inviteEmail,
      });
      setSnackbar({ open: true, message: 'Reviewer added to Program Committee!', severity: 'success' });
      setOpenInviteModal(false);
      setInviteEmail('');
      loadConflictsAndAssignments();
    } catch (err) {
      setInviteError(err.response?.data?.error || 'Failed to invite reviewer');
    } finally {
      setInviting(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F2942' }}>
            Reviewer Assignment & Conflict Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ensure double-blind integrity and conflict-free reviewer assignments
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={() => { setOpenInviteModal(true); setInviteError(''); }}
          startIcon={<i className="bi bi-person-plus"></i>}
        >
          Add Committee Reviewer
        </Button>
      </Box>

      {/* Paper Selector */}
      <Card sx={{ mb: 3, p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Autocomplete
                size="small"
                options={submissions}
                getOptionLabel={(option) => `${option.submission_number || ''} — ${option.title || ''} (${option.track_name || 'General'})`}
                value={submissions.find((s) => s.id === selectedSubId) || null}
                onChange={(_, newValue) => setSelectedSubId(newValue ? newValue.id : '')}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                noOptionsText="No manuscripts submitted yet"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search & Select Manuscript to Assign"
                    placeholder="Search by paper code, title, or track..."
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.id} sx={{ fontSize: '0.85rem' }}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1565C0' }}>
                          {option.submission_number}
                        </Typography>
                        <Chip label={option.track_name || 'General'} size="small" sx={{ fontSize: '0.675rem', height: 20 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: '#0F2942', fontWeight: 600, display: 'block' }}>
                        {option.title}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">
                Assigned Reviewers: <strong>{assignedReviewerIds.size}</strong> / Minimum recommended: <strong>2</strong>
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Selected Paper Details Card */}
      {selectedSubmission && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Chip
                label={selectedSubmission.submission_number}
                size="small"
                sx={{ fontWeight: 800, backgroundColor: '#E3F2FD', color: '#1565C0', mb: 0.5 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F2942' }}>
                {selectedSubmission.title}
              </Typography>
            </Box>
            <Chip
              label={selectedSubmission.track_name || 'General Track'}
              sx={{ fontWeight: 600, backgroundColor: '#F0F7FF', color: '#1565C0' }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            <strong>Authors:</strong> {selectedSubmission.author_first_name} {selectedSubmission.author_last_name} ({selectedSubmission.author_institution || 'N/A'})
            {selectedSubmission.coAuthors?.length > 0 && (
              <span>, {selectedSubmission.coAuthors.map((ca) => `${ca.name} (${ca.institution || 'N/A'})`).join(', ')}</span>
            )}
          </Typography>
          <Typography variant="body2" sx={{ color: '#334155', backgroundColor: '#F8FAFC', p: 1.5, borderRadius: 2 }}>
            <strong>Abstract:</strong> {selectedSubmission.abstract}
          </Typography>
        </Paper>
      )}

      {/* Reviewers Pool Table with Conflict Matrix */}
      <Card sx={{ p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        {loading ? (
          <TableSkeleton rows={4} columns={6} />
        ) : reviewersWithConflicts.length === 0 ? (
          <EmptyState
            icon="bi-people"
            title="No Reviewers in Committee"
            description="Add reviewers to this conference program committee to begin assigning papers."
            action={
              <Button variant="contained" onClick={() => setOpenInviteModal(true)}>
                Add Committee Reviewer
              </Button>
            }
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reviewer Name</TableCell>
                  <TableCell>Institution & Email</TableCell>
                  <TableCell>Conflict Check</TableCell>
                  <TableCell>Current Load</TableCell>
                  <TableCell align="right">Assignment Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviewersWithConflicts.map((rev) => {
                  const isAssigned = assignedReviewerIds.has(rev.reviewer_id);
                  const isAssigning = actionLoadingId === `assign-${rev.reviewer_id}`;
                  const isUnassigning = actionLoadingId === `unassign-${rev.reviewer_id}`;

                  return (
                    <TableRow key={rev.reviewer_id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F2942' }}>
                          {rev.first_name} {rev.last_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{rev.institution || 'Independent'}</Typography>
                        <Typography variant="caption" color="text.secondary">{rev.email}</Typography>
                      </TableCell>
                      <TableCell>
                        {rev.hasConflict ? (
                          <Tooltip title={rev.conflictReason}>
                            <Chip
                              label={rev.conflictReason}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                backgroundColor: '#FEE2E2',
                                color: '#991B1B',
                                border: '1px solid #FCA5A5',
                              }}
                            />
                          </Tooltip>
                        ) : (
                          <Chip
                            label="Clear (No Conflict)"
                            size="small"
                            sx={{
                              fontWeight: 700,
                              backgroundColor: '#E0F2FE',
                              color: '#0369A1',
                              border: '1px solid #BAE6FD',
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {rev.active_assignments_count || 0} active papers
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {isAssigned ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={isUnassigning}
                            onClick={() => handleUnassign(rev.reviewer_id)}
                            startIcon={isUnassigning ? <CircularProgress size={16} color="inherit" /> : <i className="bi bi-x-circle"></i>}
                          >
                            {isUnassigning ? 'Removing...' : 'Unassign'}
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={rev.hasConflict || isAssigning}
                            onClick={() => handleAssign(rev.reviewer_id)}
                            startIcon={isAssigning ? <CircularProgress size={16} color="inherit" /> : <i className="bi bi-check2"></i>}
                          >
                            {isAssigning ? 'Assigning...' : rev.hasConflict ? 'Conflict Blocked' : 'Assign Paper'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Invite Committee Member Modal */}
      <Dialog open={openInviteModal} onClose={() => setOpenInviteModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', color: '#0F2942' }}>
          Add Reviewer to Committee
        </DialogTitle>
        <Box component="form" onSubmit={handleInviteReviewer}>
          <DialogContent sx={{ pt: 3 }}>
            {inviteError && <Alert severity="error" sx={{ mb: 2 }}>{inviteError}</Alert>}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Enter the registered email of the user to enroll them as a Peer Reviewer for this conference.
            </Typography>
            <TextField
              fullWidth
              label="Reviewer Account Email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              placeholder="e.g. reviewer1@shazusoft.com"
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setOpenInviteModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={inviting}>
              {inviting ? <CircularProgress size={20} color="inherit" /> : 'Add to Committee'}
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
