import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
} from '@mui/material';
import { useConference } from '../../context/ConferenceContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function ConferenceSchedulePage() {
  const { selectedConference } = useConference();
  const { activeRole } = useAuth();

  const [sessions, setSessions] = useState([]);
  const [acceptedPapers, setAcceptedPapers] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Session Modal
  const [openSessionModal, setOpenSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({
    sessionName: '',
    trackId: '',
    sessionChairName: '',
    venueRoom: '',
    sessionDate: '',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
  });

  // Add presentation modal
  const [openPresentationModal, setOpenPresentationModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [presentationForm, setPresentationForm] = useState({
    submissionId: '',
    presentationOrder: 1,
    startTime: '10:00 AM',
    endTime: '10:20 AM',
    presentationNotes: 'Oral Presentation (15 mins + 5 mins Q&A)',
  });

  const fetchSessions = async () => {
    if (!selectedConference?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/sessions/conference/${selectedConference.id}`);
      setSessions(res.data.sessions || []);

      // Fetch tracks
      const tracksRes = await api.get(`/tracks/conference/${selectedConference.id}`);
      setTracks(tracksRes.data.tracks || []);

      // Fetch accepted papers for scheduling
      const subsRes = await api.get(`/submissions/conference/${selectedConference.id}`, {
        params: { status: 'accepted' },
      });
      setAcceptedPapers(subsRes.data.submissions || []);
    } catch (err) {
      console.error('Failed to load conference sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [selectedConference]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sessions', {
        conferenceId: selectedConference.id,
        ...sessionForm,
      });
      setOpenSessionModal(false);
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create session');
    }
  };

  const handleAddPresentation = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/sessions/${selectedSessionId}/presentations`, presentationForm);
      setOpenPresentationModal(false);
      fetchSessions();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add presentation');
    }
  };

  const handleRemovePresentation = async (sessionId, submissionId) => {
    try {
      await api.delete(`/sessions/${sessionId}/presentations/${submissionId}`);
      fetchSessions();
    } catch (err) {
      alert('Failed to remove presentation');
    }
  };

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Conference Program Schedule & Sessions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedConference?.name} ({selectedConference?.short_name})
          </Typography>
        </Box>
        {(activeRole === 'chair' || activeRole === 'admin') && (
          <Button
            variant="contained"
            onClick={() => setOpenSessionModal(true)}
            startIcon={<i className="bi bi-calendar-plus"></i>}
          >
            Create New Session
          </Button>
        )}
      </Box>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No technical sessions scheduled yet.</Typography>
          {(activeRole === 'chair' || activeRole === 'admin') && (
            <Button sx={{ mt: 2 }} variant="outlined" onClick={() => setOpenSessionModal(true)}>
              Schedule First Session
            </Button>
          )}
        </Card>
      ) : (
        <Grid container spacing={3}>
          {sessions.map((session) => (
            <Grid item xs={12} key={session.id}>
              <Card sx={{ p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', mb: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip label={session.track_name || 'General Track'} size="small" color="primary" sx={{ fontWeight: 700 }} />
                        <Chip label={`${session.start_time} - ${session.end_time}`} size="small" variant="outlined" />
                        <Chip label={new Date(session.session_date).toLocaleDateString()} size="small" sx={{ backgroundColor: '#F1F5F9' }} />
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: '#1E3A8A' }}>
                        {session.session_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        <strong>Room/Venue:</strong> {session.venue_room || 'TBD'} • <strong>Session Chair:</strong> {session.session_chair_name || 'TBD'}
                      </Typography>
                    </Box>

                    {(activeRole === 'chair' || activeRole === 'admin') && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setSelectedSessionId(session.id);
                          setOpenPresentationModal(true);
                        }}
                        startIcon={<i className="bi bi-plus-circle"></i>}
                      >
                        Add Presentation Slot
                      </Button>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Presentations in this session */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#475569' }}>
                    Scheduled Presentations ({session.presentations?.length || 0})
                  </Typography>

                  {session.presentations && session.presentations.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {session.presentations.map((p, idx) => (
                        <Paper
                          key={p.presentation_id || idx}
                          elevation={0}
                          sx={{
                            p: 2,
                            border: '1px solid #E2E8F0',
                            borderRadius: 2,
                            backgroundColor: '#F8FAFC',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                backgroundColor: '#EFF6FF',
                                color: '#1E40AF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                              }}
                            >
                              {p.presentation_order || idx + 1}
                            </Box>
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#1E3A8A' }}>
                                  {p.submission_number}
                                </Typography>
                                {p.start_time && (
                                  <Chip label={`${p.start_time} - ${p.end_time || ''}`} size="small" sx={{ fontSize: '0.675rem' }} />
                                )}
                              </Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                {p.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Authors: {p.authors?.map((a) => a.name).join(', ')}
                              </Typography>
                            </Box>
                          </Box>

                          {(activeRole === 'chair' || activeRole === 'admin') && (
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleRemovePresentation(session.id, p.submission_id)}
                            >
                              Remove
                            </Button>
                          )}
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No papers scheduled for presentation in this session yet.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Session Dialog */}
      <Dialog open={openSessionModal} onClose={() => setOpenSessionModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Conference Session</DialogTitle>
        <Box component="form" onSubmit={handleCreateSession}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Session Name"
                  required
                  value={sessionForm.sessionName}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionName: e.target.value })}
                  placeholder="e.g. Session A1: High-Performance AI Architectures"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Conference Track"
                  value={sessionForm.trackId}
                  onChange={(e) => setSessionForm({ ...sessionForm, trackId: e.target.value })}
                >
                  <MenuItem value="">General Track</MenuItem>
                  {tracks.map((t) => (
                    <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Session Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  required
                  value={sessionForm.sessionDate}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  required
                  value={sessionForm.startTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                  placeholder="e.g. 10:00 AM"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  required
                  value={sessionForm.endTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                  placeholder="e.g. 12:00 PM"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Venue Room / Hall"
                  value={sessionForm.venueRoom}
                  onChange={(e) => setSessionForm({ ...sessionForm, venueRoom: e.target.value })}
                  placeholder="e.g. Main Hall A"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Session Chair Name"
                  value={sessionForm.sessionChairName}
                  onChange={(e) => setSessionForm({ ...sessionForm, sessionChairName: e.target.value })}
                  placeholder="e.g. Dr. Rajesh Kumar"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenSessionModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create Session</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Add Presentation Dialog */}
      <Dialog open={openPresentationModal} onClose={() => setOpenPresentationModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Schedule Paper in Session</DialogTitle>
        <Box component="form" onSubmit={handleAddPresentation}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Accepted Paper"
                  required
                  value={presentationForm.submissionId}
                  onChange={(e) => setPresentationForm({ ...presentationForm, submissionId: e.target.value })}
                >
                  {acceptedPapers.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.submission_number} - {p.title}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Order"
                  type="number"
                  value={presentationForm.presentationOrder}
                  onChange={(e) => setPresentationForm({ ...presentationForm, presentationOrder: parseInt(e.target.value, 10) })}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Start Time"
                  value={presentationForm.startTime}
                  onChange={(e) => setPresentationForm({ ...presentationForm, startTime: e.target.value })}
                  placeholder="10:00 AM"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="End Time"
                  value={presentationForm.endTime}
                  onChange={(e) => setPresentationForm({ ...presentationForm, endTime: e.target.value })}
                  placeholder="10:20 AM"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenPresentationModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Add to Schedule</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
