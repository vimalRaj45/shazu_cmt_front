import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Divider,
  Paper,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useConference } from '../../context/ConferenceContext';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner, CardsSkeleton } from '../../components/common/LoadingState';
import api from '../../services/api';

export default function DashboardPage() {
  const { user, activeRole } = useAuth();
  const { selectedConference, conferences } = useConference();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/overview', {
          params: { conferenceId: selectedConference?.id },
        });
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedConference, activeRole]);

  return (
    <Box sx={{ pb: 4 }}>
      {/* Executive Welcome Banner */}
      <Paper
        elevation={0}
        sx={{
          mb: 3.5,
          background: 'linear-gradient(135deg, #123B32 0%, #1D4C40 50%, #2F5B4E 100%)',
          color: '#FFFFFF',
          borderRadius: 3,
          p: { xs: 2.5, md: 3.5 },
          boxShadow: '0 8px 24px rgba(18, 59, 50, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Grid container alignItems="center" spacing={2}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.5 }}>
              <Chip
                label={activeRole?.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.725rem',
                  letterSpacing: '0.06em',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                }}
              />
              {selectedConference && (
                <Chip
                  label={selectedConference.short_name}
                  size="small"
                  sx={{
                    backgroundColor: '#FFFFFF',
                    color: '#123B32',
                    fontWeight: 700,
                    fontSize: '0.725rem',
                  }}
                />
              )}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', color: '#FFFFFF' }}>
              Welcome back, {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.92, maxWidth: 640, color: 'rgba(255, 255, 255, 0.9)', lineHeight: 1.6 }}>
              {selectedConference
                ? `Managing operations for ${selectedConference.name}.`
                : 'Select a conference from the topbar to inspect submissions and peer review workflows.'}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button
              variant="contained"
              onClick={() => {
                if (activeRole === 'chair' || activeRole === 'admin') navigate('/chair/submissions');
                else if (activeRole === 'reviewer') navigate('/reviewer/workspace');
                else navigate('/submit-paper');
              }}
              sx={{
                backgroundColor: '#FFFFFF',
                color: '#123B32',
                fontWeight: 700,
                px: 2.5,
                py: 1,
                borderRadius: 1.5,
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { backgroundColor: '#F5F3EC', color: '#0B241E' },
              }}
              endIcon={<i className="bi bi-arrow-right"></i>}
            >
              Open Workspace
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading Skeleton */}
      {loading ? (
        <Box sx={{ mb: 4 }}>
          <CardsSkeleton count={6} sm={6} md={2} />
        </Box>
      ) : (
        <>
          {/* Chair / Admin Metric Cards */}
          {(activeRole === 'chair' || activeRole === 'admin') && stats?.chair && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F2942' }}>
                  Conference Key Metrics
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => navigate('/chair/submissions')}
                  sx={{ color: '#1565C0', fontWeight: 700, fontSize: '0.8rem' }}
                >
                  View All Submissions →
                </Button>
              </Box>

              <Grid container spacing={2.5}>
                {[
                  {
                    title: 'Total Submissions',
                    value: stats.chair.totalSubmissions,
                    subtitle: 'Manuscripts received',
                    accentColor: '#1565C0',
                    icon: 'bi-file-earmark-text',
                  },
                  {
                    title: 'Under Review',
                    value: stats.chair.underReview,
                    subtitle: 'In peer evaluation',
                    accentColor: '#0288D1',
                    icon: 'bi-hourglass-split',
                  },
                  {
                    title: 'Accepted Papers',
                    value: stats.chair.accepted,
                    subtitle: 'Camera-ready eligible',
                    accentColor: '#0369A1',
                    icon: 'bi-check2-circle',
                  },
                  {
                    title: 'Revision Required',
                    value: stats.chair.revisionRequired,
                    subtitle: 'Awaiting author updates',
                    accentColor: '#D97706',
                    icon: 'bi-pencil-square',
                  },
                  {
                    title: 'Rejected Papers',
                    value: stats.chair.rejected,
                    subtitle: 'Unsuccessful submissions',
                    accentColor: '#64748B',
                    icon: 'bi-x-circle',
                  },
                  {
                    title: 'Review Progress',
                    value: `${stats.chair.completedReviews}/${stats.chair.totalAssignedReviews}`,
                    subtitle: 'Completed reviews',
                    accentColor: '#1976D2',
                    icon: 'bi-clipboard-check',
                  },
                ].map((card, idx) => (
                  <Grid item xs={12} sm={6} md={2} key={idx}>
                    <Card
                      sx={{
                        height: '100%',
                        position: 'relative',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: 2.5,
                        overflow: 'hidden',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 20px rgba(15, 41, 66, 0.08)',
                          borderColor: '#BFDBFE',
                        },
                      }}
                    >
                      {/* Top Accent Line */}
                      <Box sx={{ height: 3, backgroundColor: card.accentColor, width: '100%' }} />

                      <CardContent sx={{ p: 2.25, '&:last-child': { pb: 2.25 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              color: '#64748B',
                              fontSize: '0.7rem',
                            }}
                          >
                            {card.title}
                          </Typography>
                          <i className={`bi ${card.icon}`} style={{ color: card.accentColor, fontSize: '1rem', opacity: 0.85 }}></i>
                        </Box>

                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F2942', my: 0.5, letterSpacing: '-0.02em' }}>
                          {card.value}
                        </Typography>

                        <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.725rem', display: 'block' }}>
                          {card.subtitle}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Reviewer Metric Cards */}
          {activeRole === 'reviewer' && stats?.reviewer && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0F2942' }}>
                Review Workload Overview
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5, '&:hover': { borderColor: '#BFDBFE' } }}>
                    <Box sx={{ height: 3, backgroundColor: '#1565C0', width: '100%' }} />
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                        Assigned Manuscripts
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F2942', my: 1 }}>
                        {stats.reviewer.assignedPapers}
                      </Typography>
                      <Button size="small" variant="contained" onClick={() => navigate('/reviewer/workspace')} endIcon={<i className="bi bi-arrow-right"></i>}>
                        Open Review Workspace
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
                    <Box sx={{ height: 3, backgroundColor: '#0284C7', width: '100%' }} />
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                        Completed Reviews
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F2942', my: 1 }}>
                        {stats.reviewer.completedReviews}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Submitted and finalized
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
                    <Box sx={{ height: 3, backgroundColor: '#D97706', width: '100%' }} />
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                        Pending Evaluations
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F2942', my: 1 }}>
                        {stats.reviewer.pendingReviews}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Awaiting your assessment
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Author Metric Cards */}
          {activeRole === 'author' && stats?.author && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#0F2942' }}>
                My Paper Submissions
              </Typography>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={3}>
                  <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
                    <Box sx={{ height: 3, backgroundColor: '#1565C0', width: '100%' }} />
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                        Total Submissions
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F2942', my: 1 }}>
                        {stats.author.totalSubmissions}
                      </Typography>
                      <Button size="small" variant="outlined" onClick={() => navigate('/my-submissions')}>
                        View Submissions →
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
                    <Box sx={{ height: 3, backgroundColor: '#0284C7', width: '100%' }} />
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                        Under Review
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F2942', my: 1 }}>
                        {stats.author.underReview}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Peer review in progress</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
                    <Box sx={{ height: 3, backgroundColor: '#15803D', width: '100%' }} />
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                        Accepted Papers
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F2942', my: 1 }}>
                        {stats.author.accepted}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Camera-ready open</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Card sx={{ border: '1px solid #E2E8F0', borderRadius: 2.5 }}>
                    <Box sx={{ height: 3, backgroundColor: '#D97706', width: '100%' }} />
                    <CardContent sx={{ p: 2.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
                        Revision Required
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F2942', my: 1 }}>
                        {stats.author.revisionRequired}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">Upload revised version</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </>
      )}

      {/* Timeline Deadlines & Announcements */}
      <Grid container spacing={3}>
        {/* Important Deadlines Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5, color: '#0F2942' }}>
                Conference Key Dates & Deadlines
              </Typography>
              {selectedConference ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { label: 'Paper Submission Deadline', date: selectedConference.submission_deadline, icon: 'bi-upload', color: '#1565C0' },
                    { label: 'Peer Review Due Date', date: selectedConference.review_deadline, icon: 'bi-journal-check', color: '#0288D1' },
                    { label: 'Author Notification / Decisions', date: selectedConference.decision_date, icon: 'bi-bell', color: '#0D47A1' },
                    { label: 'Camera-Ready Paper Due', date: selectedConference.camera_ready_deadline, icon: 'bi-file-earmark-check', color: '#0284C7' },
                    { label: 'Conference Event Dates', date: `${selectedConference.start_date} to ${selectedConference.end_date}`, icon: 'bi-calendar-range', color: '#1565C0', isRange: true },
                  ].map((item, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 1.5,
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: 2,
                        '&:hover': { backgroundColor: '#F0F7FF', borderColor: '#BFDBFE' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <i className={`bi ${item.icon}`} style={{ color: item.color, fontSize: '1.1rem' }}></i>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0F2942' }}>
                          {item.label}
                        </Typography>
                      </Box>
                      <Chip
                        label={item.date ? (item.isRange ? item.date : new Date(item.date).toLocaleDateString()) : 'TBD'}
                        size="small"
                        sx={{ fontWeight: 700, backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F2942' }}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">No conference selected</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Announcements */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F2942' }}>
                  Latest Announcements
                </Typography>
                <Button size="small" variant="text" onClick={() => navigate('/announcements')} sx={{ color: '#1565C0', fontWeight: 700 }}>
                  View All →
                </Button>
              </Box>

              {stats?.recentAnnouncements && stats.recentAnnouncements.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {stats.recentAnnouncements.map((ann) => (
                    <Paper
                      key={ann.id}
                      elevation={0}
                      sx={{
                        p: 2,
                        border: '1px solid #E2E8F0',
                        borderRadius: 2,
                        backgroundColor: '#FFFFFF',
                        '&:hover': { borderColor: '#90CAF9', backgroundColor: '#F8FAFC' },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1565C0' }}>
                          {ann.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(ann.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        {ann.content}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No announcements published yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
