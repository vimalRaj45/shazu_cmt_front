import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Paper,
  Grid,
} from '@mui/material';
import { useConference } from '../../context/ConferenceContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function AnnouncementsPage() {
  const { selectedConference } = useConference();
  const { activeRole } = useAuth();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Post modal
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRole: 'all',
  });
  const [saving, setSaving] = useState(false);

  const fetchAnnouncements = async () => {
    if (!selectedConference?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/announcements/conference/${selectedConference.id}`);
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedConference]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/announcements', {
        conferenceId: selectedConference.id,
        ...formData,
      });
      setOpenModal(false);
      setFormData({ title: '', content: '', targetRole: 'all' });
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post announcement');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      alert('Failed to delete announcement');
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Conference Announcements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Official bulletins, schedule alerts, and deadline updates
          </Typography>
        </Box>
        {(activeRole === 'chair' || activeRole === 'admin') && (
          <Button
            variant="contained"
            onClick={() => setOpenModal(true)}
            startIcon={<i className="bi bi-megaphone-fill"></i>}
          >
            Post Announcement
          </Button>
        )}
      </Box>

      {announcements.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No announcements have been posted for this conference yet.</Typography>
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {announcements.map((ann) => (
            <Grid item xs={12} key={ann.id}>
              <Card sx={{ p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip
                          label={`Target: ${ann.target_role?.toUpperCase()}`}
                          size="small"
                          sx={{ fontWeight: 700, backgroundColor: '#EFF6FF', color: '#1E40AF' }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Posted on {new Date(ann.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        {ann.title}
                      </Typography>
                    </Box>

                    {(activeRole === 'chair' || activeRole === 'admin') && (
                      <Button size="small" color="error" onClick={() => handleDelete(ann.id)}>
                        Delete
                      </Button>
                    )}
                  </Box>

                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', color: '#334155', lineHeight: 1.7 }}>
                    {ann.content}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Post Announcement Dialog */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Publish Conference Announcement</DialogTitle>
        <Box component="form" onSubmit={handleCreate}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Announcement Headline"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Camera-Ready Deadline Extended by 3 Days"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Target Audience"
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                >
                  <MenuItem value="all">Everyone (All Participants, Authors, Reviewers)</MenuItem>
                  <MenuItem value="authors">Authors Only</MenuItem>
                  <MenuItem value="reviewers">Reviewers Only</MenuItem>
                  <MenuItem value="participants">Public / Attendees Only</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Announcement Content"
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Type the full announcement message here..."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Publishing...' : 'Publish Announcement'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
