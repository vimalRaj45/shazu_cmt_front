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
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Tooltip,
  Autocomplete,
  Snackbar,
  Alert,
} from '@mui/material';
import { useConference } from '../../context/ConferenceContext';
import { useNavigate } from 'react-router-dom';
import { TableSkeleton, EmptyState } from '../../components/common/LoadingState';
import BackButton from '../../components/common/BackButton';
import api from '../../services/api';

const STATUS_CHIPS = {
  submitted: { label: 'Submitted', color: '#1565C0', bg: '#E3F2FD' },
  under_review: { label: 'Under Review', color: '#0288D1', bg: '#E1F5FE' },
  revision_required: { label: 'Revision Required', color: '#0284C7', bg: '#F0F9FF' },
  accepted: { label: 'Accepted', color: '#0D47A1', bg: '#E3F2FD' },
  rejected: { label: 'Rejected', color: '#64748B', bg: '#F1F5F9' },
  camera_ready_pending: { label: 'Camera-Ready Pending', color: '#1976D2', bg: '#E8F4FD' },
  camera_ready_approved: { label: 'Camera-Ready Approved', color: '#0D47A1', bg: '#BBDEFB' },
};

export default function ChairSubmissionsPage() {
  const { selectedConference } = useConference();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [trackFilter, setTrackFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const fetchSubmissions = async () => {
    if (!selectedConference?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/submissions/conference/${selectedConference.id}`, {
        params: {
          trackId: trackFilter || undefined,
          status: statusFilter || undefined,
          search: search || undefined,
        },
      });
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error('Failed to load conference submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedConference?.id) {
      api.get(`/tracks/conference/${selectedConference.id}`).then((res) => {
        setTracks(res.data.tracks || []);
      });
      fetchSubmissions();
    }
  }, [selectedConference, trackFilter, statusFilter]);

  const handleDownloadFile = async (file) => {
    try {
      const res = await api.get(`/submissions/files/${file.id}/download`);
      window.open(res.data.downloadUrl || res.data.publicUrl, '_blank');
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to download file', severity: 'error' });
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
              Conference Submissions Master Table
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedConference?.name} ({selectedConference?.short_name})
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="outlined" onClick={() => navigate('/chair/reviewers')} startIcon={<i className="bi bi-person-check"></i>}>
            Assign Reviewers
          </Button>
          <Button variant="contained" onClick={() => navigate('/chair/decisions')} startIcon={<i className="bi bi-check2-circle"></i>}>
            Decisions Desk
          </Button>
        </Box>
      </Box>

      {/* Filter Bar */}
      <Card sx={{ mb: 3, p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search Title or ID (e.g. CMT-2026-00101)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchSubmissions()}
                InputProps={{
                  startAdornment: <i className="bi bi-search text-muted" style={{ marginRight: 8, color: '#1565C0' }}></i>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Autocomplete
                size="small"
                options={tracks}
                getOptionLabel={(option) => option.name || ''}
                value={tracks.find((t) => String(t.id) === String(trackFilter)) || null}
                onChange={(_, newValue) => setTrackFilter(newValue ? newValue.id : '')}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Track Filter"
                    placeholder="Search track..."
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                select
                size="small"
                label="Status Filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="revision_required">Revision Required</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="camera_ready_pending">Camera-Ready Pending</MenuItem>
                <MenuItem value="camera_ready_approved">Camera-Ready Approved</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button fullWidth variant="contained" onClick={fetchSubmissions}>
                Filter
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card sx={{ p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        {loading ? (
          <TableSkeleton rows={5} columns={8} />
        ) : submissions.length === 0 ? (
          <EmptyState
            icon="bi-folder2-open"
            title="No Submissions Found"
            description="No paper submissions match the current search criteria or track filter."
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Paper ID</TableCell>
                  <TableCell>Title & Track</TableCell>
                  <TableCell>Corresponding Author</TableCell>
                  <TableCell>Reviewers</TableCell>
                  <TableCell>Avg Score</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Manuscript</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((sub) => {
                  const statusInfo = STATUS_CHIPS[sub.status] || STATUS_CHIPS.submitted;
                  const manuscriptFile = sub.files?.find((f) => f.file_type === 'manuscript' || f.file_type === 'revision');
                  return (
                    <TableRow key={sub.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#1565C0' }}>
                          {sub.submission_number}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F2942' }}>
                          {sub.title}
                        </Typography>
                        <Chip
                          label={sub.track_name || 'General Track'}
                          size="small"
                          sx={{ mt: 0.5, fontSize: '0.7rem', backgroundColor: '#F0F6FC', color: '#1565C0' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {sub.author_first_name} {sub.author_last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {sub.author_email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${sub.completed_reviews_count || 0} / ${sub.assigned_reviewers_count || 0} Done`}
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
                          <Typography variant="caption" color="text.secondary">Pending</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusInfo.label}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.color,
                            border: '1px solid #BBDEFB',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {manuscriptFile ? (
                          <Button
                            size="small"
                            onClick={() => handleDownloadFile(manuscriptFile)}
                            startIcon={<i className="bi bi-file-earmark-pdf text-primary"></i>}
                            sx={{ textTransform: 'none', color: '#1565C0' }}
                          >
                            PDF
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary">No file</Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => navigate(`/chair/reviewers?subId=${sub.id}`)}
                            title="Assign Reviewers"
                          >
                            Assign
                          </Button>
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/submission/${sub.id}`)}
                            title="View Details"
                            sx={{ color: '#1565C0' }}
                          >
                            <i className="bi bi-eye"></i>
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

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
