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
} from '@mui/material';
import { useConference } from '../../context/ConferenceContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/common/BackButton';
import api from '../../services/api';

export default function ConferenceDetailPage() {
  const { selectedConference } = useConference();
  const { activeRole } = useAuth();
  const navigate = useNavigate();

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedConference?.id) return;
      try {
        setLoading(true);
        const res = await api.get(`/conferences/${selectedConference.id}`);
        setDetails(res.data.conference);
      } catch (err) {
        console.error('Failed to load conference details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [selectedConference]);

  if (!details) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">No Conference / Journal Selected</Typography>
        <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate('/conferences')}>
          Select Conference / Journal
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Box sx={{ mb: 2 }}>
        <BackButton fallbackUrl="/conferences" label="Back to Conferences & Journals" />
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
          <Box>
            <Chip
              label={details.short_name}
              sx={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', color: '#FFFFFF', fontWeight: 800, mb: 1.5, border: '1px solid rgba(255, 255, 255, 0.3)' }}
            />
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#FFFFFF' }}>
              {details.name}
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.92)', maxWidth: 800 }}>
              {details.description}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
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
            {(activeRole === 'chair' || activeRole === 'admin') && (
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
              >
                Chair Console
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Details Grid */}
      <Grid container spacing={3}>
        {/* Conference Tracks */}
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%', p: 1, border: '1px solid #D3DDD7' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#123B32' }}>
                <i className="bi bi-diagram-3" style={{ color: '#123B32' }}></i> Conference Tracks & Topics
              </Typography>

              <List disablePadding>
                {details.tracks && details.tracks.map((track, idx) => (
                  <Paper key={track.id} elevation={0} sx={{ p: 2, mb: 1.5, border: '1px solid #D3DDD7', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#123B32' }}>
                        Track {idx + 1}: {track.name}
                      </Typography>
                      <Chip label={track.is_active ? 'Active' : 'Closed'} size="small" color={track.is_active ? 'success' : 'default'} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {track.description || 'Papers covering algorithms, implementations, evaluation, and case studies.'}
                    </Typography>
                  </Paper>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Key Info & Chairs */}
        <Grid item xs={12} md={5}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Vital Info */}
            <Card sx={{ p: 1, border: '1px solid #D3DDD7' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#123B32' }}>
                  <i className="bi bi-info-circle" style={{ color: '#123B32' }}></i> Key Logistics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Mode / Platform</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{details.venue || 'Online / Virtual Platform'}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#D3DDD7' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Dates</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{details.start_date} to {details.end_date}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#D3DDD7' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Submissions</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#123B32' }}>{details.submission_count} Total</Typography>
                  </Box>
                  <Divider sx={{ borderColor: '#D3DDD7' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Review Committee</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#2F5B4E' }}>{details.reviewer_count} Reviewers</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Program Chairs */}
            <Card sx={{ p: 1, border: '1px solid #D3DDD7' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#123B32' }}>
                  <i className="bi bi-person-badge" style={{ color: '#123B32' }}></i> Program Committee Chairs
                </Typography>
                {details.chairs && details.chairs.map((chair) => (
                  <Box key={chair.id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#E8EFEB', color: '#123B32', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                      {chair.first_name?.charAt(0)}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {chair.first_name} {chair.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {chair.institution} • {chair.email}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
