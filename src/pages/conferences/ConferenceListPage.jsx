import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useConference } from '../../context/ConferenceContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const STATUS_COLORS = {
  draft: { color: '#64748B', bg: '#F1F5F9' },
  open: { color: '#166534', bg: '#DCFCE7' },
  submission_closed: { color: '#991B1B', bg: '#FEE2E2' },
  under_review: { color: '#854D0E', bg: '#FEF9C3' },
  decision_phase: { color: '#5B21B6', bg: '#F3E8FF' },
  camera_ready: { color: '#0F766E', bg: '#CCFBF1' },
  completed: { color: '#334155', bg: '#E2E8F0' },
};

export default function ConferenceListPage() {
  const { activeRole } = useAuth();
  const { conferences, selectConference, refreshConferences } = useConference();
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
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
    tracksInput: 'Artificial Intelligence, Cloud Computing, Cyber Security, IoT',
  });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tracksArray = formData.tracksInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await api.post('/conferences', {
        name: formData.name,
        shortName: formData.shortName,
        description: formData.description,
        venue: formData.venue,
        startDate: formData.startDate,
        endDate: formData.endDate,
        submissionDeadline: formData.submissionDeadline,
        reviewDeadline: formData.reviewDeadline,
        decisionDate: formData.decisionDate,
        cameraReadyDeadline: formData.cameraReadyDeadline,
        status: formData.status,
        tracks: tracksArray,
      });

      await refreshConferences();
      selectConference(res.data.conference);
      setOpenModal(false);
      setSnackbar({ open: true, message: 'Conference created successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to create conference', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDialogProps, setDeleteDialogProps] = useState({ open: false, hasSubmissions: false, submissionCount: 0 });
  const [filterTab, setFilterTab] = useState('all'); // 'all', 'active', 'inactive'

  const isAdmin = activeRole === 'admin' || activeRole === 'chair';

  const handleToggleActive = async (conf) => {
    try {
      const res = await api.patch(`/conferences/${conf.id}/toggle-active`);
      setSnackbar({ open: true, message: res.data.message, severity: 'success' });
      await refreshConferences();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to toggle conference status', severity: 'error' });
    }
  };

  const handleToggleComplete = async (conf) => {
    try {
      const newStatus = conf.status === 'completed' ? 'open' : 'completed';
      await api.put(`/conferences/${conf.id}`, { status: newStatus });
      setSnackbar({
        open: true,
        message: newStatus === 'completed'
          ? `"${conf.short_name}" marked as Completed (hidden from active submissions)`
          : `"${conf.short_name}" re-opened`,
        severity: 'success',
      });
      await refreshConferences();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to update status', severity: 'error' });
    }
  };

  const handleOpenDelete = (conf) => {
    setDeleteTarget(conf);
    const subCount = parseInt(conf.submission_count, 10) || 0;
    setDeleteDialogProps({ open: true, hasSubmissions: subCount > 0, submissionCount: subCount });
  };

  const handleConfirmDelete = async (force = false) => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/conferences/${deleteTarget.id}${force ? '?force=true' : ''}`);
      setSnackbar({ open: true, message: `Conference "${deleteTarget.short_name}" deleted successfully`, severity: 'success' });
      setDeleteDialogProps({ open: false, hasSubmissions: false, submissionCount: 0 });
      setDeleteTarget(null);
      await refreshConferences();
    } catch (err) {
      const data = err.response?.data;
      if (data?.hasSubmissions) {
        setDeleteDialogProps({ open: true, hasSubmissions: true, submissionCount: data.submissionCount });
      } else {
        setSnackbar({ open: true, message: data?.error || 'Failed to delete conference', severity: 'error' });
      }
    }
  };

  const filteredConferences = conferences.filter((conf) => {
    const isHidden = conf.is_active === false || conf.status === 'completed';
    if (filterTab === 'active') return !isHidden;
    if (filterTab === 'inactive') return isHidden;
    return true;
  });

  return (
    <Box sx={{ pb: 4, px: { xs: 0, sm: 1 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#123B32', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
            Conferences & Journals Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage academic conferences, journals, publication schedules, and active visibility
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            onClick={() => setOpenModal(true)}
            startIcon={<i className="bi bi-plus-circle-fill"></i>}
            sx={{
              backgroundColor: '#123B32',
              fontWeight: 700,
              '&:hover': { backgroundColor: '#1D4C40' },
            }}
          >
            Create New Conference / Journal
          </Button>
        )}
      </Box>

      {/* Admin Status Filter Tabs */}
      {isAdmin && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant={filterTab === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilterTab('all')}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            All Publications ({conferences.length})
          </Button>
          <Button
            size="small"
            variant={filterTab === 'active' ? 'contained' : 'outlined'}
            color="success"
            onClick={() => setFilterTab('active')}
            startIcon={<i className="bi bi-eye" />}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            Active (Visible to Users) ({conferences.filter((c) => c.is_active !== false && c.status !== 'completed').length})
          </Button>
          <Button
            size="small"
            variant={filterTab === 'inactive' ? 'contained' : 'outlined'}
            color="warning"
            onClick={() => setFilterTab('inactive')}
            startIcon={<i className="bi bi-eye-slash" />}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
          >
            Completed & Deactivated (Hidden) ({conferences.filter((c) => c.is_active === false || c.status === 'completed').length})
          </Button>
        </Box>
      )}

      {/* Conference Cards Grid */}
      <Grid container spacing={2.5}>
        {filteredConferences.map((conf) => {
          const statusStyle = STATUS_COLORS[conf.status] || STATUS_COLORS.open;
          const isDeactivated = conf.is_active === false;
          const isCompleted = conf.status === 'completed';

          return (
            <Grid item xs={12} md={6} key={conf.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2.5,
                  border: isDeactivated ? '2px dashed #EF4444' : isCompleted ? '1px solid #94A3B8' : '1px solid #D3DDD7',
                  backgroundColor: isDeactivated ? '#FFF5F5' : isCompleted ? '#F8FAFC' : '#FFFFFF',
                  boxShadow: '0 4px 16px rgba(18, 59, 50, 0.06)',
                  opacity: isDeactivated ? 0.88 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                <CardContent sx={{ p: 0, pb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={conf.short_name}
                        sx={{
                          fontWeight: 800,
                          backgroundColor: '#E8EFEB',
                          color: '#123B32',
                          fontSize: '0.85rem',
                        }}
                      />
                      {isDeactivated && (
                        <Chip
                          icon={<i className="bi bi-eye-slash-fill" style={{ fontSize: '0.75rem', color: '#991B1B' }} />}
                          label="HIDDEN FROM USERS"
                          size="small"
                          sx={{
                            fontWeight: 800,
                            backgroundColor: '#FEE2E2',
                            color: '#991B1B',
                            fontSize: '0.7rem',
                          }}
                        />
                      )}
                    </Box>
                    <Chip
                      label={conf.status?.toUpperCase()}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                      }}
                    />
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#123B32', mb: 1, fontSize: { xs: '1.05rem', sm: '1.2rem' } }}>
                    {conf.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {conf.description || 'Online academic publication portal for research papers, peer reviews, and scholarly proceedings / articles.'}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, backgroundColor: isDeactivated ? '#FEE2E2' : '#F5F3EC', p: 1.5, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="bi bi-globe2" style={{ color: '#527A68' }}></i>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#123B32' }}>
                        {conf.venue || 'Online / Virtual Platform'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="bi bi-calendar-event" style={{ color: '#527A68' }}></i>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: '#123B32' }}>
                        {conf.start_date} to {conf.end_date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="bi bi-clock" style={{ color: '#DC2626' }}></i>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#DC2626' }}>
                        Submission Due: {new Date(conf.submission_deadline).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="bi bi-file-earmark-text" style={{ color: '#123B32' }}></i>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#123B32' }}>
                        Total Submissions: {conf.submission_count || 0} papers
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                {/* Card Action Controls */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, pt: 1, borderTop: '1px solid #E2E8F0', alignItems: 'stretch' }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                      selectConference(conf);
                      navigate('/conference/details');
                    }}
                    sx={{
                      backgroundColor: '#123B32',
                      fontWeight: 700,
                      '&:hover': { backgroundColor: '#1D4C40' },
                    }}
                  >
                    Enter Portal
                  </Button>

                  {isAdmin && (
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      {/* Deactivate / Activate Button (Hide from users) */}
                      <Button
                        variant="outlined"
                        size="small"
                        color={isDeactivated ? 'success' : 'warning'}
                        onClick={() => handleToggleActive(conf)}
                        startIcon={<i className={`bi ${isDeactivated ? 'bi-eye' : 'bi-eye-slash'}`} />}
                        sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                      >
                        {isDeactivated ? 'Show to Users' : 'Hide from Users'}
                      </Button>

                      {/* Mark Completed Button */}
                      <Button
                        variant="outlined"
                        size="small"
                        color={isCompleted ? 'info' : 'secondary'}
                        onClick={() => handleToggleComplete(conf)}
                        startIcon={<i className={`bi ${isCompleted ? 'bi-arrow-clockwise' : 'bi-check2-circle'}`} />}
                        sx={{ fontWeight: 700, fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                      >
                        {isCompleted ? 'Re-open' : 'Mark Done'}
                      </Button>

                      {/* Delete Conference Button */}
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => handleOpenDelete(conf)}
                        sx={{ minWidth: 40, px: 1 }}
                      >
                        <i className="bi bi-trash" style={{ fontSize: '0.95rem' }} />
                      </Button>
                    </Box>
                  )}
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Delete / Deactivate Confirmation Dialog */}
      <Dialog open={deleteDialogProps.open} onClose={() => setDeleteDialogProps({ open: false, hasSubmissions: false, submissionCount: 0 })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 1 }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ color: '#DC2626' }} />
          Delete or Deactivate Conference
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 600, color: '#123B32' }}>
            Are you sure you want to remove <strong>"{deleteTarget?.name}"</strong> ({deleteTarget?.short_name})?
          </Typography>

          {deleteDialogProps.hasSubmissions ? (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              This publication currently has <strong>{deleteDialogProps.submissionCount} submitted manuscripts</strong>.
              <br /><br />
              <strong>Recommended:</strong> Click <strong>"Deactivate & Hide from Users"</strong> to remove it from user dropdowns and submission portals while preserving scholar records and reviews.
              <br /><br />
              Alternatively, choose <strong>"Force Delete Everything"</strong> to permanently erase all papers, reviews, and assignments.
            </Alert>
          ) : (
            <Typography variant="body2" color="text.secondary">
              This conference has no papers submitted. Deleting will remove it permanently from the system.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteDialogProps({ open: false, hasSubmissions: false, submissionCount: 0 })}
          >
            Cancel
          </Button>

          {deleteDialogProps.hasSubmissions && (
            <Button
              variant="contained"
              color="warning"
              onClick={async () => {
                await handleToggleActive(deleteTarget);
                setDeleteDialogProps({ open: false, hasSubmissions: false, submissionCount: 0 });
              }}
              startIcon={<i className="bi bi-eye-slash" />}
              sx={{ fontWeight: 700 }}
            >
              Deactivate & Hide from Users
            </Button>
          )}

          <Button
            variant="contained"
            color="error"
            onClick={() => handleConfirmDelete(deleteDialogProps.hasSubmissions)}
            startIcon={<i className="bi bi-trash" />}
            sx={{ fontWeight: 700 }}
          >
            {deleteDialogProps.hasSubmissions ? 'Force Delete Everything' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Conference Modal Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0' }}>
          Create New Academic Conference / Journal
        </DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Conference / Journal Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. International Conference on AI or Journal of Computing"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Short Name / Acronym"
                  required
                  value={formData.shortName}
                  onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                  placeholder="e.g. SS-AI 2026"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Online Platform / Publisher"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. Online Portal, Virtual via Zoom / MS Teams"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Initial Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="open">Open for Submissions</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="submission_closed">Submission Closed</MenuItem>
                  <MenuItem value="under_review">Under Review</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Submission Deadline"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  required
                  value={formData.submissionDeadline}
                  onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Review Deadline"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.reviewDeadline}
                  onChange={(e) => setFormData({ ...formData, reviewDeadline: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Decision Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.decisionDate}
                  onChange={(e) => setFormData({ ...formData, decisionDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Camera-Ready Deadline"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.cameraReadyDeadline}
                  onChange={(e) => setFormData({ ...formData, cameraReadyDeadline: e.target.value })}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Initial Tracks (comma-separated)"
                  value={formData.tracksInput}
                  onChange={(e) => setFormData({ ...formData, tracksInput: e.target.value })}
                  helperText="Enter track names separated by commas"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Creating...' : 'Create'}
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
