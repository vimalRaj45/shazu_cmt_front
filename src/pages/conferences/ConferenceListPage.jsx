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

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Conferences Directory
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and participate in Shazu Soft Technologies internal conferences
          </Typography>
        </Box>
        {(activeRole === 'chair' || activeRole === 'admin') && (
          <Button
            variant="contained"
            onClick={() => setOpenModal(true)}
            startIcon={<i className="bi bi-plus-circle-fill"></i>}
          >
            Create New Conference
          </Button>
        )}
      </Box>

      {/* Conference Cards Grid */}
      <Grid container spacing={3}>
        {conferences.map((conf) => {
          const statusStyle = STATUS_COLORS[conf.status] || STATUS_COLORS.open;
          return (
            <Grid item xs={12} md={6} key={conf.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Chip
                      label={conf.short_name}
                      sx={{
                        fontWeight: 800,
                        backgroundColor: '#EFF6FF',
                        color: '#1E40AF',
                        fontSize: '0.85rem',
                      }}
                    />
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

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {conf.name}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {conf.description || 'Annual Shazu Soft conference series for research papers, peer reviews, and technical sessions.'}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, backgroundColor: '#F8FAFC', p: 1.5, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="bi bi-geo-alt text-muted"></i>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {conf.venue || 'Virtual / Shazu Soft Campus'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="bi bi-calendar-event text-muted"></i>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {conf.start_date} to {conf.end_date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <i className="bi bi-clock text-danger"></i>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#DC2626' }}>
                        Submission Due: {new Date(conf.submission_deadline).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                      selectConference(conf);
                      navigate('/conference/details');
                    }}
                  >
                    Enter Conference
                  </Button>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Create Conference Modal Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0' }}>
          Create New Academic Conference
        </DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={8}>
                <TextField
                  fullWidth
                  label="Conference Name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Shazu Soft International Conference on AI"
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
                  label="Conference Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Venue / Location"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="e.g. Bangalore Auditorium & Online"
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
              {saving ? 'Creating...' : 'Create Conference'}
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
