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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useConference } from '../../context/ConferenceContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/common/BackButton';
import api from '../../services/api';

const STATUS_COLORS = {
  draft: { color: '#64748B', bg: '#F1F5F9', label: 'Draft / Setup' },
  open: { color: '#166534', bg: '#DCFCE7', label: 'Open for Submissions' },
  submission_closed: { color: '#991B1B', bg: '#FEE2E2', label: 'Submissions Closed' },
  under_review: { color: '#854D0E', bg: '#FEF9C3', label: 'Under Peer Review' },
  decision_phase: { color: '#5B21B6', bg: '#F3E8FF', label: 'Decision Phase' },
  camera_ready: { color: '#0F766E', bg: '#CCFBF1', label: 'Camera-Ready Phase' },
  completed: { color: '#334155', bg: '#E2E8F0', label: 'Completed' },
};

export default function ConferenceDetailPage() {
  const { selectedConference, setSelectedConference, selectConference, refreshConferences } = useConference();
  const { activeRole } = useAuth();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    shortName: '',
    description: '',
    venue: '',
    startDate: '',
    endDate: '',
    submissionDeadline: '',
    reviewDeadline: '',
    decisionDate: '',
    cameraReadyDeadline: '',
    status: 'open',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Create New Conference Modal State
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    shortName: '',
    description: '',
    venue: 'Shazu Soft Virtual & On-Site Auditorium',
    startDate: '',
    endDate: '',
    submissionDeadline: '',
    reviewDeadline: '',
    decisionDate: '',
    cameraReadyDeadline: '',
    status: 'open',
    tracksInput: 'Artificial Intelligence, Cloud Computing, Cyber Security, IoT',
  });
  const [savingCreate, setSavingCreate] = useState(false);

  // Add Track Modal State
  const [openAddTrackModal, setOpenAddTrackModal] = useState(false);
  const [newTrackData, setNewTrackData] = useState({ name: '', description: '' });
  const [savingTrack, setSavingTrack] = useState(false);

  // Delete / Deactivate Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDialogProps, setDeleteDialogProps] = useState({ hasSubmissions: false, submissionCount: 0 });
  const [deleting, setDeleting] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const isAdmin = activeRole === 'admin' || activeRole === 'chair';

  const fetchDetails = async () => {
    if (!selectedConference?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/conferences/${selectedConference.id}`);
      const conf = res.data.conference;
      setDetails(conf);
      setEditFormData({
        name: conf.name || '',
        shortName: conf.short_name || '',
        description: conf.description || '',
        venue: conf.venue || '',
        startDate: conf.start_date ? conf.start_date.split('T')[0] : '',
        endDate: conf.end_date ? conf.end_date.split('T')[0] : '',
        submissionDeadline: conf.submission_deadline ? conf.submission_deadline.split('T')[0] : '',
        reviewDeadline: conf.review_deadline ? conf.review_deadline.split('T')[0] : '',
        decisionDate: conf.decision_date ? conf.decision_date.split('T')[0] : '',
        cameraReadyDeadline: conf.camera_ready_deadline ? conf.camera_ready_deadline.split('T')[0] : '',
        status: conf.status || 'open',
      });
    } catch (err) {
      console.error('Failed to load conference details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [selectedConference]);

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!details?.id) return;
    setSavingEdit(true);
    try {
      await api.put(`/conferences/${details.id}`, {
        name: editFormData.name,
        shortName: editFormData.shortName,
        description: editFormData.description,
        venue: editFormData.venue,
        startDate: editFormData.startDate,
        endDate: editFormData.endDate,
        submissionDeadline: editFormData.submissionDeadline,
        reviewDeadline: editFormData.reviewDeadline,
        decisionDate: editFormData.decisionDate,
        cameraReadyDeadline: editFormData.cameraReadyDeadline,
        status: editFormData.status,
      });

      setSnackbar({ open: true, message: 'Conference details updated successfully!', severity: 'success' });
      setOpenEditModal(false);
      await fetchDetails();
      if (refreshConferences) await refreshConferences();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to update details', severity: 'error' });
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Create New Conference
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSavingCreate(true);
    try {
      const tracksArray = createFormData.tracksInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await api.post('/conferences', {
        name: createFormData.name,
        shortName: createFormData.shortName,
        description: createFormData.description,
        venue: createFormData.venue,
        startDate: createFormData.startDate,
        endDate: createFormData.endDate,
        submissionDeadline: createFormData.submissionDeadline,
        reviewDeadline: createFormData.reviewDeadline,
        decisionDate: createFormData.decisionDate,
        cameraReadyDeadline: createFormData.cameraReadyDeadline,
        status: createFormData.status,
        tracks: tracksArray,
      });

      setSnackbar({ open: true, message: 'New publication created successfully!', severity: 'success' });
      setOpenCreateModal(false);
      if (refreshConferences) await refreshConferences();
      if (selectConference) selectConference(res.data.conference);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to create conference', severity: 'error' });
    } finally {
      setSavingCreate(false);
    }
  };

  // Handle Add Track Submit
  const handleAddTrackSubmit = async (e) => {
    e.preventDefault();
    if (!details?.id || !newTrackData.name.trim()) return;
    setSavingTrack(true);
    try {
      await api.post('/tracks', {
        conferenceId: details.id,
        name: newTrackData.name.trim(),
        description: newTrackData.description.trim(),
      });

      setSnackbar({ open: true, message: `Track "${newTrackData.name}" added successfully!`, severity: 'success' });
      setNewTrackData({ name: '', description: '' });
      setOpenAddTrackModal(false);
      await fetchDetails();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to add track', severity: 'error' });
    } finally {
      setSavingTrack(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = () => {
    const subCount = parseInt(details?.submission_count, 10) || 0;
    setDeleteDialogProps({ hasSubmissions: subCount > 0, submissionCount: subCount });
    setDeleteDialogOpen(true);
  };

  // Handle Confirm Delete
  const handleConfirmDelete = async (force = false) => {
    if (!details?.id) return;
    setDeleting(true);
    try {
      await api.delete(`/conferences/${details.id}${force ? '?force=true' : ''}`);
      setDeleteDialogOpen(false);
      setSnackbar({ open: true, message: `Conference "${details.short_name}" deleted permanently.`, severity: 'success' });
      if (setSelectedConference) setSelectedConference(null);
      if (refreshConferences) await refreshConferences();
      setTimeout(() => {
        navigate('/conferences');
      }, 800);
    } catch (err) {
      const data = err.response?.data;
      if (data?.hasSubmissions) {
        setDeleteDialogProps({ hasSubmissions: true, submissionCount: data.submissionCount });
      } else {
        setSnackbar({ open: true, message: data?.error || 'Failed to delete conference', severity: 'error' });
      }
    } finally {
      setDeleting(false);
    }
  };

  // Toggle Hide from users
  const handleToggleDeactivate = async () => {
    if (!details?.id) return;
    try {
      const newStatus = details.status === 'completed' ? 'open' : 'completed';
      await api.put(`/conferences/${details.id}`, { status: newStatus });
      setSnackbar({ open: true, message: `Status updated to ${newStatus}`, severity: 'success' });
      setDeleteDialogOpen(false);
      await fetchDetails();
      if (refreshConferences) await refreshConferences();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to update status', severity: 'error' });
    }
  };

  if (loading && !details) {
    return (
      <Box sx={{ p: 6, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!details) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">No Conference / Journal Selected</Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" onClick={() => navigate('/conferences')}>
            Select Conference / Journal
          </Button>
          {isAdmin && (
            <Button variant="outlined" onClick={() => setOpenCreateModal(true)} startIcon={<i className="bi bi-plus-circle" />}>
              Create New
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  const currentStatusStyle = STATUS_COLORS[details.status] || STATUS_COLORS.open;

  return (
    <Box sx={{ pb: 4, maxWidth: 1300, mx: 'auto' }}>
      {/* Top Header Actions */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <BackButton fallbackUrl="/conferences" label="Back to Conferences & Journals" />
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => setOpenCreateModal(true)}
              startIcon={<i className="bi bi-plus-circle" />}
              sx={{ backgroundColor: '#1B5E20', '&:hover': { backgroundColor: '#144A18' }, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              + Add New Conference / Journal
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => setOpenEditModal(true)}
              startIcon={<i className="bi bi-pencil-square" />}
              sx={{ borderColor: '#CBD5E1', color: '#123B32', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              Manage Details
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={handleOpenDelete}
              startIcon={<i className="bi bi-trash" />}
              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
            >
              Delete Conference / Journal
            </Button>
          </Box>
        )}
      </Box>

      {/* Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          mb: 3.5,
          borderRadius: 2.5,
          background: 'linear-gradient(135deg, #123B32 0%, #2F5B4E 60%, #527A68 100%)',
          color: '#FFFFFF',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 24px rgba(18, 59, 50, 0.15)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ maxWidth: 800 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label={details.short_name}
                sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', fontWeight: 800, border: '1px solid rgba(255, 255, 255, 0.3)' }}
              />
              <Chip
                label={currentStatusStyle.label}
                sx={{ backgroundColor: currentStatusStyle.bg, color: currentStatusStyle.color, fontWeight: 700 }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#FFFFFF' }}>
              {details.name}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.92)', lineHeight: 1.6 }}>
              {details.description}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              onClick={() => navigate('/submit-paper')}
              sx={{
                backgroundColor: '#FFFFFF',
                color: '#123B32',
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                '&:hover': { backgroundColor: '#F5F3EC', color: '#0B241E' },
              }}
              startIcon={<i className="bi bi-file-earmark-plus"></i>}
            >
              Submit Paper
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/chair/submissions')}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    '&:hover': { borderColor: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.22)' },
                  }}
                  startIcon={<i className="bi bi-folder2-open"></i>}
                >
                  Submissions
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/chair/invitations')}
                  sx={{
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    '&:hover': { borderColor: '#FFFFFF', backgroundColor: 'rgba(255,255,255,0.22)' },
                  }}
                  startIcon={<i className="bi bi-envelope-paper-heart"></i>}
                >
                  Send Invites
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Details Grid */}
      <Grid container spacing={3}>
        {/* Conference Tracks */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%', p: 1, border: '1px solid #D3DDD7', borderRadius: 2.5 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1, color: '#123B32' }}>
                  <i className="bi bi-diagram-3" style={{ color: '#123B32' }}></i> Conference Tracks & Topics
                </Typography>
                {isAdmin && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setOpenAddTrackModal(true)}
                    startIcon={<i className="bi bi-plus-lg" />}
                    sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#CBD5E1', color: '#123B32', fontWeight: 700 }}
                  >
                    Add Track
                  </Button>
                )}
              </Box>

              <List disablePadding>
                {details.tracks && details.tracks.length > 0 ? (
                  details.tracks.map((track, idx) => {
                    const trackDisplayName = track.name?.toLowerCase().startsWith('track')
                      ? track.name
                      : `Track ${idx + 1}: ${track.name}`;

                    return (
                      <Paper key={track.id} elevation={0} sx={{ p: 2, mb: 1.5, border: '1px solid #D3DDD7', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#123B32' }}>
                            {trackDisplayName}
                          </Typography>
                          <Chip label={track.is_active ? 'Active' : 'Closed'} size="small" color={track.is_active ? 'success' : 'default'} />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {track.description || 'Papers covering research algorithms, implementations, evaluation, and empirical case studies.'}
                        </Typography>
                      </Paper>
                    );
                  })
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No specific tracks declared. All standard topic submissions are welcome.
                  </Typography>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Key Info & Chairs */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Vital Info */}
            <Card sx={{ p: 1, border: '1px solid #D3DDD7', borderRadius: 2.5 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#123B32' }}>
                  <i className="bi bi-info-circle" style={{ color: '#123B32' }}></i> Key Logistics & Deadlines
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Venue / Platform</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{details.venue || 'Online / Virtual Platform'}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#D3DDD7' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Conference Dates</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {details.start_date ? new Date(details.start_date).toLocaleDateString() : 'TBD'} to{' '}
                      {details.end_date ? new Date(details.end_date).toLocaleDateString() : 'TBD'}
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#D3DDD7' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Submission Deadline</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#DC2626' }}>
                      {details.submission_deadline ? new Date(details.submission_deadline).toLocaleDateString() : 'Open'}
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#D3DDD7' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Submissions Count</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#123B32' }}>{details.submission_count || 0} Papers</Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#D3DDD7' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Review Committee</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#2F5B4E' }}>{details.reviewer_count || 0} Reviewers</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Program Chairs */}
            <Card sx={{ p: 1, border: '1px solid #D3DDD7', borderRadius: 2.5 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#123B32' }}>
                  <i className="bi bi-person-badge" style={{ color: '#123B32' }}></i> Program Committee Chairs
                </Typography>
                {details.chairs && details.chairs.length > 0 ? (
                  details.chairs.map((chair) => (
                    <Box key={chair.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#E8EFEB', color: '#123B32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {chair.first_name?.charAt(0)}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {chair.first_name} {chair.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {chair.institution || 'Academic Institution'} • {chair.email}
                        </Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chaired by System Administration.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Edit Conference / Journal Modal */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', color: '#123B32' }}>
          Manage & Edit Conference / Journal Details
        </DialogTitle>
        <Box component="form" onSubmit={handleEditSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Conference / Journal Name"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Acronym / Short Name / ISSN"
                  required
                  value={editFormData.shortName}
                  onChange={(e) => setEditFormData({ ...editFormData, shortName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description & Scope"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Venue / Virtual Platform / Publisher"
                  value={editFormData.venue}
                  onChange={(e) => setEditFormData({ ...editFormData, venue: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Workflow Status Phase"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                >
                  <MenuItem value="draft">Draft / Setup</MenuItem>
                  <MenuItem value="open">Open for Submissions</MenuItem>
                  <MenuItem value="submission_closed">Submissions Closed</MenuItem>
                  <MenuItem value="under_review">Under Peer Review</MenuItem>
                  <MenuItem value="decision_phase">Decision Phase</MenuItem>
                  <MenuItem value="camera_ready">Camera-Ready Phase</MenuItem>
                  <MenuItem value="completed">Completed / Archived</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={editFormData.startDate}
                  onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Paper / Manuscript Submission Deadline"
                  InputLabelProps={{ shrink: true }}
                  value={editFormData.submissionDeadline}
                  onChange={(e) => setEditFormData({ ...editFormData, submissionDeadline: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Peer Review Evaluation Deadline"
                  InputLabelProps={{ shrink: true }}
                  value={editFormData.reviewDeadline}
                  onChange={(e) => setEditFormData({ ...editFormData, reviewDeadline: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setOpenEditModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={savingEdit} sx={{ backgroundColor: '#123B32', fontWeight: 700 }}>
              {savingEdit ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Create New Conference / Journal Modal */}
      <Dialog open={openCreateModal} onClose={() => setOpenCreateModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', color: '#123B32', display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="bi bi-plus-circle-fill" style={{ color: '#1B5E20' }} />
          Create New Conference or Journal
        </DialogTitle>
        <Box component="form" onSubmit={handleCreateSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Conference or Journal Name"
                  required
                  placeholder="e.g. International Conference on AI & Robotics 2027 OR Journal of Computer Systems"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Short Acronym / Code"
                  required
                  placeholder="e.g. ICAIR 2027 or JCS-2027"
                  value={createFormData.shortName}
                  onChange={(e) => setCreateFormData({ ...createFormData, shortName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description & Scope / Call for Papers"
                  placeholder="Describe the research topics, indexing goals, and submission guidelines..."
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Venue / Publisher / Platform"
                  placeholder="e.g. Virtual Auditorium, Bangalore OR Open Access Journal Issue"
                  value={createFormData.venue}
                  onChange={(e) => setCreateFormData({ ...createFormData, venue: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Initial Status"
                  value={createFormData.status}
                  onChange={(e) => setCreateFormData({ ...createFormData, status: e.target.value })}
                >
                  <MenuItem value="open">Open for Submissions</MenuItem>
                  <MenuItem value="draft">Draft / Setup</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date / Publication Launch"
                  InputLabelProps={{ shrink: true }}
                  required
                  value={createFormData.startDate}
                  onChange={(e) => setCreateFormData({ ...createFormData, startDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date / Issue Finalization"
                  InputLabelProps={{ shrink: true }}
                  required
                  value={createFormData.endDate}
                  onChange={(e) => setCreateFormData({ ...createFormData, endDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Paper Submission Deadline"
                  InputLabelProps={{ shrink: true }}
                  required
                  value={createFormData.submissionDeadline}
                  onChange={(e) => setCreateFormData({ ...createFormData, submissionDeadline: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Review Evaluation Deadline"
                  InputLabelProps={{ shrink: true }}
                  value={createFormData.reviewDeadline}
                  onChange={(e) => setCreateFormData({ ...createFormData, reviewDeadline: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Topics / Research Tracks (Comma-separated)"
                  helperText="Initial tracks e.g. Artificial Intelligence, Cloud Systems, Cybersecurity"
                  value={createFormData.tracksInput}
                  onChange={(e) => setCreateFormData({ ...createFormData, tracksInput: e.target.value })}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setOpenCreateModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={savingCreate} sx={{ backgroundColor: '#1B5E20', fontWeight: 700 }}>
              {savingCreate ? 'Creating...' : 'Create Conference / Journal'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Add Track Modal */}
      <Dialog open={openAddTrackModal} onClose={() => setOpenAddTrackModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', color: '#123B32' }}>
          Add New Conference / Journal Track
        </DialogTitle>
        <Box component="form" onSubmit={handleAddTrackSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <TextField
              fullWidth
              required
              label="Track Name / Topic"
              placeholder="e.g., Computer Vision & Pattern Recognition"
              value={newTrackData.name}
              onChange={(e) => setNewTrackData({ ...newTrackData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Track Description (Optional)"
              placeholder="Topics, keywords, and areas covered by this track..."
              value={newTrackData.description}
              onChange={(e) => setNewTrackData({ ...newTrackData, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setOpenAddTrackModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={savingTrack} sx={{ backgroundColor: '#123B32', fontWeight: 700 }}>
              {savingTrack ? 'Adding...' : 'Add Track'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete / Deactivate Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ color: '#DC2626' }} />
          Delete or Deactivate Conference / Journal
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 600, color: '#123B32' }}>
            Are you sure you want to remove <strong>"{details?.name}"</strong> ({details?.short_name})?
          </Typography>

          {deleteDialogProps.hasSubmissions ? (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              This conference / journal currently has <strong>{deleteDialogProps.submissionCount} submitted manuscripts</strong>.
              <br /><br />
              <strong>Recommended:</strong> Choose <strong>"Hide from Users / Deactivate"</strong> to keep scholar archives and reviews intact while hiding it from active dropdowns.
              <br /><br />
              Or select <strong>"Force Delete Everything"</strong> to permanently purge all associated tracks, papers, reviews, and logs.
            </Alert>
          ) : (
            <Typography variant="body2" color="text.secondary">
              This conference / journal has no active submissions. Deleting will erase all metadata, sessions, and tracks permanently.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>

          {deleteDialogProps.hasSubmissions && (
            <Button
              variant="contained"
              color="warning"
              onClick={handleToggleDeactivate}
              startIcon={<i className="bi bi-eye-slash" />}
              sx={{ fontWeight: 700 }}
              disabled={deleting}
            >
              Hide from Users
            </Button>
          )}

          <Button
            variant="contained"
            color="error"
            onClick={() => handleConfirmDelete(deleteDialogProps.hasSubmissions)}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <i className="bi bi-trash" />}
            sx={{ fontWeight: 700 }}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : deleteDialogProps.hasSubmissions ? 'Force Delete Everything' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
