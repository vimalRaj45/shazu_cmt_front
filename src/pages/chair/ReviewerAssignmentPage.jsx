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
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useConference } from '../../context/ConferenceContext';
import { useLocation } from 'react-router-dom';
import { TableSkeleton, EmptyState } from '../../components/common/LoadingState';
import BackButton from '../../components/common/BackButton';
import ConfirmModal from '../../components/common/ConfirmModal';
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
  const [confirmUnassign, setConfirmUnassign] = useState({ open: false, reviewerId: null, reviewerName: '' });

  // Action loading states
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Invite reviewer modal
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // AI Auto-Assign Modal states
  const [openAiModal, setOpenAiModal] = useState(false);
  const [aiConfig, setAiConfig] = useState({
    targetReviewsPerPaper: 1,
    maxReviewsPerReviewer: 3,
    onlyUnassigned: true,
  });
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiApplying, setAiApplying] = useState(false);
  const [aiPlanResult, setAiPlanResult] = useState(null);
  const [selectedAiAssignments, setSelectedAiAssignments] = useState(new Set());

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

      // 2. Get conflict matrix & AI match scores
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
      setSnackbar({ open: true, message: 'Reviewer assigned and notified successfully!', severity: 'success' });
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

  // Generate AI Auto-Assignment Simulation
  const handleGenerateAiPlan = async () => {
    if (!selectedConference?.id) return;
    setAiGenerating(true);
    setAiPlanResult(null);
    try {
      const res = await api.post(`/reviewers/conference/${selectedConference.id}/ai-assign/preview`, {
        targetReviewsPerPaper: aiConfig.targetReviewsPerPaper,
        maxReviewsPerReviewer: aiConfig.maxReviewsPerReviewer,
        onlyUnassigned: aiConfig.onlyUnassigned,
      });

      const planData = res.data;
      setAiPlanResult(planData);

      // By default, select all proposed assignments
      const allSelected = new Set();
      (planData.plan || []).forEach((p) => {
        p.proposedReviewers.forEach((r) => {
          allSelected.add(`${p.submissionId}-${r.reviewerId}`);
        });
      });
      setSelectedAiAssignments(allSelected);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to generate AI auto-assignments', severity: 'error' });
    } finally {
      setAiGenerating(false);
    }
  };

  // Toggle individual assignment in AI plan
  const handleToggleAiAssignment = (subId, revId) => {
    const key = `${subId}-${revId}`;
    const next = new Set(selectedAiAssignments);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setSelectedAiAssignments(next);
  };

  // Apply AI Auto-Assignments
  const handleApplyAiPlan = async () => {
    if (!aiPlanResult || selectedAiAssignments.size === 0) return;
    setAiApplying(true);
    try {
      const assignmentsToApply = [];
      (aiPlanResult.plan || []).forEach((p) => {
        p.proposedReviewers.forEach((r) => {
          if (selectedAiAssignments.has(`${p.submissionId}-${r.reviewerId}`)) {
            assignmentsToApply.push({
              submissionId: p.submissionId,
              reviewerId: r.reviewerId,
            });
          }
        });
      });

      const res = await api.post(`/reviewers/conference/${selectedConference.id}/ai-assign/apply`, {
        assignments: assignmentsToApply,
      });

      setSnackbar({
        open: true,
        message: res.data.message || `Successfully applied ${assignmentsToApply.length} AI assignments!`,
        severity: 'success',
      });

      setOpenAiModal(false);
      setAiPlanResult(null);
      await loadConflictsAndAssignments();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to apply AI assignments', severity: 'error' });
    } finally {
      setAiApplying(false);
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BackButton fallbackUrl="/dashboard" />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F2942' }}>
              Reviewer Assignment & AI Matching
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Profile-based smart matching, automated Conflict of Interest (COI) prevention & balanced workload distribution
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => { setOpenInviteModal(true); setInviteError(''); }}
            startIcon={<i className="bi bi-person-plus"></i>}
          >
            Add Committee Reviewer
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenAiModal(true);
              if (!aiPlanResult) handleGenerateAiPlan();
            }}
            startIcon={<i className="bi bi-stars"></i>}
            sx={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
              color: '#FFFFFF',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #6D28D9 0%, #4338CA 100%)',
              },
            }}
          >
            ✨ AI Auto-Assign Reviewers
          </Button>
        </Box>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Assigned: <strong>{assignedReviewerIds.size}</strong> / Minimum recommended: <strong>2</strong>
                </Typography>
                {assignedReviewerIds.size >= 2 ? (
                  <Chip label="Ready" color="success" size="small" sx={{ height: 22, fontWeight: 700 }} />
                ) : (
                  <Chip label="Needs Reviewers" color="warning" size="small" sx={{ height: 22, fontWeight: 700 }} />
                )}
              </Box>
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
          {selectedSubmission.keywords?.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5, alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748B' }}>
                Manuscript Keywords:
              </Typography>
              {selectedSubmission.keywords.map((kw, i) => (
                <Chip key={i} label={kw} size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
              ))}
            </Box>
          )}

          {/* Currently Assigned Reviewers for this Paper */}
          <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px dashed #CBD5E1' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2942', display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="bi bi-people-fill text-primary"></i> Currently Assigned Reviewers ({reviewersWithConflicts.filter((r) => assignedReviewerIds.has(r.id || r.reviewer_id)).length})
              </Typography>
              {reviewersWithConflicts.filter((r) => assignedReviewerIds.has(r.id || r.reviewer_id)).length < 2 && (
                <Chip label="Requires at least 2 reviewers" size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
              )}
            </Box>

            {reviewersWithConflicts.filter((r) => assignedReviewerIds.has(r.id || r.reviewer_id)).length === 0 ? (
              <Alert severity="info" sx={{ py: 0.5, borderRadius: 1.5, fontSize: '0.85rem' }}>
                No reviewers are assigned to this manuscript yet. Select reviewers from the pool below or use <strong>AI Auto-Assign</strong>.
              </Alert>
            ) : (
              <Grid container spacing={1.5}>
                {reviewersWithConflicts
                  .filter((r) => assignedReviewerIds.has(r.id || r.reviewer_id))
                  .map((rev) => {
                    const revId = rev.id || rev.reviewer_id;
                    const isUnassigning = actionLoadingId === `unassign-${revId}`;
                    return (
                      <Grid item xs={12} sm={6} key={revId}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.75,
                            backgroundColor: '#F8FAFC',
                            border: '1.5px solid #BFDBFE',
                            borderRadius: 1.5,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%',
                          }}
                        >
                          <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1565C0' }}>
                                {rev.first_name} {rev.last_name}
                              </Typography>
                              {rev.matchScore && (
                                <Chip
                                  label={`${rev.matchScore}% Match`}
                                  size="small"
                                  color="success"
                                  sx={{ height: 20, fontSize: '0.7rem', fontWeight: 800 }}
                                />
                              )}
                            </Box>

                            <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontWeight: 600 }}>
                              {rev.designation || 'Academic Reviewer'} • {rev.qualification || 'Doctorate'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.75 }}>
                              {rev.institution} {rev.department ? `(${rev.department})` : ''} • {rev.email}
                            </Typography>

                            {rev.areas_of_interest?.length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                                {rev.areas_of_interest.slice(0, 3).map((topic, i) => (
                                  <Chip key={i} label={topic} size="small" sx={{ fontSize: '0.675rem', height: 18, backgroundColor: '#E2E8F0' }} />
                                ))}
                              </Box>
                            )}
                          </Box>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid #E2E8F0', mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {rev.orcid_id && (
                                <Chip
                                  label={`iD ${rev.orcid_id}`}
                                  size="small"
                                  sx={{ height: 18, fontSize: '0.65rem', backgroundColor: '#F0FDF4', color: '#166534', fontWeight: 700 }}
                                />
                              )}
                            </Box>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              disabled={isUnassigning}
                              onClick={() =>
                                setConfirmUnassign({
                                  open: true,
                                  reviewerId: revId,
                                  reviewerName: `${rev.first_name} ${rev.last_name}`,
                                })
                              }
                              sx={{
                                fontSize: '0.75rem',
                                py: 0.25,
                                px: 1,
                                borderRadius: 1,
                                textTransform: 'none',
                                fontWeight: 700,
                              }}
                            >
                              {isUnassigning ? 'Removing...' : 'Unassign'}
                            </Button>
                          </Box>
                        </Paper>
                      </Grid>
                    );
                  })}
              </Grid>
            )}
          </Box>
        </Paper>
      )}

      {/* Reviewers Pool Table with Conflict Matrix & AI Match */}
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
                  <TableCell>Reviewer & Qualification</TableCell>
                  <TableCell>AI Match & Rationale</TableCell>
                  <TableCell>Conflict Check</TableCell>
                  <TableCell>Current Load</TableCell>
                  <TableCell align="right">Assignment Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviewersWithConflicts.map((rev) => {
                  const revId = rev.id || rev.reviewer_id;
                  const isAssigned = assignedReviewerIds.has(revId);
                  const isAssigning = actionLoadingId === `assign-${revId}`;
                  const isUnassigning = actionLoadingId === `unassign-${revId}`;

                  // Badge color for match score
                  const matchScore = rev.matchScore || 50;
                  let matchColor = '#10B981'; // Green
                  if (matchScore < 60) matchColor = '#F59E0B'; // Amber
                  else if (matchScore < 80) matchColor = '#3B82F6'; // Blue

                  return (
                    <TableRow key={revId} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F2942' }}>
                          {rev.first_name} {rev.last_name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                          {rev.qualification || rev.designation || 'Reviewer'} • {rev.institution || 'Independent'}
                        </Typography>
                        {rev.domain && (
                          <Typography variant="caption" sx={{ color: '#1565C0', fontWeight: 600 }}>
                            {rev.domain}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Chip
                            label={`${matchScore}% Match (${rev.confidence || 'Good'})`}
                            size="small"
                            sx={{
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              backgroundColor: `${matchColor}15`,
                              color: matchColor,
                              border: `1px solid ${matchColor}40`,
                            }}
                          />
                        </Box>
                        {rev.rationale && (
                          <Tooltip title={rev.rationale}>
                            <Typography variant="caption" sx={{ color: '#475569', display: 'block', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              <i className="bi bi-info-circle" style={{ marginRight: 4 }}></i>
                              {rev.rationale}
                            </Typography>
                          </Tooltip>
                        )}
                        {rev.matchedTopics?.length > 0 && (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {rev.matchedTopics.slice(0, 2).map((t, idx) => (
                              <Chip key={idx} label={t} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                            ))}
                          </Box>
                        )}
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
                          {rev.assigned_papers_count || 0} / {rev.max_review_limit || 3} papers
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        {isAssigned ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={isUnassigning}
                            onClick={() => handleUnassign(revId)}
                            startIcon={isUnassigning ? <CircularProgress size={16} color="inherit" /> : <i className="bi bi-x-circle"></i>}
                          >
                            {isUnassigning ? 'Removing...' : 'Unassign'}
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={rev.hasConflict || isAssigning}
                            onClick={() => handleAssign(revId)}
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

      {/* ✨ AI Auto-Assignment Wizard Dialog */}
      <Dialog open={openAiModal} onClose={() => setOpenAiModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ p: 2.5, background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)', color: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <i className="bi bi-stars" style={{ fontSize: '1.4rem' }}></i>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.2 }}>
                AI Reviewer Auto-Assignment Engine
              </Typography>
              <Typography variant="caption" sx={{ color: '#E0E7FF' }}>
                Profile-based semantic matching, conflict elimination & workload balancer
              </Typography>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Configuration Controls */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1E293B' }}>
              1. Auto-Assignment Parameters
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Target Reviews Per Paper"
                  value={aiConfig.targetReviewsPerPaper}
                  onChange={(e) => setAiConfig({ ...aiConfig, targetReviewsPerPaper: parseInt(e.target.value, 10) })}
                >
                  <MenuItem value={1}>1 Reviewer (Default)</MenuItem>
                  <MenuItem value={2}>2 Reviewers</MenuItem>
                  <MenuItem value={3}>3 Reviewers (Rigorous)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  select
                  label="Max Papers Per Reviewer"
                  value={aiConfig.maxReviewsPerReviewer}
                  onChange={(e) => setAiConfig({ ...aiConfig, maxReviewsPerReviewer: parseInt(e.target.value, 10) })}
                >
                  <MenuItem value={2}>2 Papers Max</MenuItem>
                  <MenuItem value={3}>3 Papers Max (Recommended)</MenuItem>
                  <MenuItem value={4}>4 Papers Max</MenuItem>
                  <MenuItem value={5}>5 Papers Max</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleGenerateAiPlan}
                  disabled={aiGenerating}
                  startIcon={aiGenerating ? <CircularProgress size={16} color="inherit" /> : <i className="bi bi-arrow-repeat"></i>}
                  sx={{
                    background: '#4F46E5',
                    '&:hover': { background: '#4338CA' },
                    py: 1,
                  }}
                >
                  {aiGenerating ? 'Generating Simulation...' : 'Re-Run AI Matching'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Loading state */}
          {aiGenerating && (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <CircularProgress size={36} sx={{ color: '#7C3AED', mb: 2 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                Analyzing Semantic Match Scores & Checking Conflicts...
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Evaluating topic embeddings, researcher qualifications, and track alignments
              </Typography>
            </Box>
          )}

          {/* Results Display */}
          {!aiGenerating && aiPlanResult && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F2942' }}>
                  2. AI Proposed Assignments ({selectedAiAssignments.size} Selected to Apply)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={`Submissions: ${aiPlanResult.totalSubmissionsEvaluated}`} size="small" />
                  <Chip label={`Reviewer Pool: ${aiPlanResult.reviewerPoolSize}`} size="small" />
                </Box>
              </Box>

              {aiPlanResult.warnings?.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                  {aiPlanResult.warnings.map((w, i) => (
                    <Typography key={i} variant="caption" sx={{ display: 'block' }}>
                      • {w}
                    </Typography>
                  ))}
                </Alert>
              )}

              {aiPlanResult.plan?.length === 0 ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  All eligible papers already have the target number of reviewers assigned, or no submissions are pending.
                </Alert>
              ) : (
                <Box sx={{ maxHeight: 380, overflowY: 'auto', pr: 0.5 }}>
                  {aiPlanResult.plan.map((p) => (
                    <Paper
                      key={p.submissionId}
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 1.5,
                        border: '1px solid #E2E8F0',
                        borderRadius: 2,
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box>
                          <Chip label={p.submissionNumber} size="small" sx={{ fontWeight: 800, mr: 1, backgroundColor: '#EEF2FF', color: '#4338CA' }} />
                          <Typography variant="subtitle2" component="span" sx={{ fontWeight: 700, color: '#0F2942' }}>
                            {p.title}
                          </Typography>
                        </Box>
                        <Chip label={p.trackName || 'General Track'} size="small" variant="outlined" />
                      </Box>

                      {p.proposedReviewers.length === 0 ? (
                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          No additional reviewer needed or eligible pool reached capacity.
                        </Typography>
                      ) : (
                        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                          {p.proposedReviewers.map((r) => {
                            const isSelected = selectedAiAssignments.has(`${p.submissionId}-${r.reviewerId}`);
                            return (
                              <Grid item xs={12} sm={6} key={r.reviewerId}>
                                <Paper
                                  elevation={0}
                                  onClick={() => handleToggleAiAssignment(p.submissionId, r.reviewerId)}
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    border: `1.5px solid ${isSelected ? '#7C3AED' : '#E2E8F0'}`,
                                    backgroundColor: isSelected ? '#FAF5FF' : '#F8FAFC',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                      <i className={isSelected ? 'bi bi-check-circle-fill' : 'bi bi-circle'} style={{ color: isSelected ? '#7C3AED' : '#94A3B8' }}></i>
                                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                                        {r.reviewerName}
                                      </Typography>
                                    </Box>
                                    <Chip
                                      label={`${r.matchScore}% Match`}
                                      size="small"
                                      sx={{ fontWeight: 800, fontSize: '0.7rem', height: 20, bgcolor: '#EDE9FE', color: '#6D28D9' }}
                                    />
                                  </Box>
                                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                                    {r.qualification || r.designation || 'Reviewer'} • {r.institution || 'Independent'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#4F46E5', fontWeight: 600, display: 'block', mt: 0.25 }}>
                                    ✨ {r.aiRationale}
                                  </Typography>
                                </Paper>
                              </Grid>
                            );
                          })}
                        </Grid>
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Button onClick={() => setOpenAiModal(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={aiApplying || !aiPlanResult || selectedAiAssignments.size === 0}
            onClick={handleApplyAiPlan}
            sx={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
              fontWeight: 700,
              px: 3,
            }}
          >
            {aiApplying ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                <span>Applying Assignments...</span>
              </Box>
            ) : (
              `Confirm & Apply ${selectedAiAssignments.size} Assignment(s)`
            )}
          </Button>
        </DialogActions>
      </Dialog>

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
            <Button
              type="submit"
              variant="contained"
              disabled={inviting}
              startIcon={inviting ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <i className="bi bi-person-plus" />}
              sx={{
                fontWeight: 700,
                borderRadius: 1.5,
                '&.Mui-disabled': { backgroundColor: '#1565C0', color: '#FFFFFF', opacity: 0.85 },
              }}
            >
              {inviting ? 'Adding to Committee...' : 'Add to Committee'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Confirmation Modal for Unassigning Reviewer */}
      <ConfirmModal
        open={confirmUnassign.open}
        title="Unassign Reviewer"
        message={`Are you sure you want to unassign ${confirmUnassign.reviewerName} from manuscript ${selectedSubmission?.submission_number}?`}
        confirmText="Yes, Unassign"
        cancelText="Keep Assigned"
        confirmColor="error"
        onCancel={() => setConfirmUnassign({ open: false, reviewerId: null, reviewerName: '' })}
        onConfirm={async () => {
          const revId = confirmUnassign.reviewerId;
          setConfirmUnassign({ open: false, reviewerId: null, reviewerName: '' });
          if (revId) {
            await handleUnassign(revId);
          }
        }}
      />

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

