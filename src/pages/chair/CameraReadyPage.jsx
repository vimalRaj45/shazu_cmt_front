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
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { useConference } from '../../context/ConferenceContext';
import { TableSkeleton, EmptyState } from '../../components/common/LoadingState';
import api from '../../services/api';

export default function CameraReadyPage() {
  const { selectedConference } = useConference();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchCameraReadyList = async () => {
    if (!selectedConference?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/camera-ready/conference/${selectedConference.id}`);
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error('Failed to load camera-ready submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameraReadyList();
  }, [selectedConference]);

  const handleUpdateStatus = async (submissionId, status) => {
    setActionId(`${submissionId}-${status}`);
    try {
      await api.post(`/camera-ready/${submissionId}/status`, { status });
      setSnackbar({
        open: true,
        message: status === 'camera_ready_approved' ? 'Camera-Ready approved and locked for proceedings!' : 'Revision requested from authors.',
        severity: 'success',
      });
      fetchCameraReadyList();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to update camera-ready status', severity: 'error' });
    } finally {
      setActionId(null);
    }
  };

  const handleDownload = async (file) => {
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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F2942' }}>
          Camera-Ready Papers Approval Desk
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Inspect final publication-ready manuscripts, verify formatting, and approve papers for proceedings
        </Typography>
      </Box>

      <Card sx={{ p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        {loading ? (
          <TableSkeleton rows={4} columns={6} />
        ) : submissions.length === 0 ? (
          <EmptyState
            icon="bi-award"
            title="No Accepted Papers Pending Approval"
            description="Accepted papers will appear here once authors upload their final camera-ready manuscripts."
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Paper ID</TableCell>
                  <TableCell>Title & Track</TableCell>
                  <TableCell>Corresponding Author</TableCell>
                  <TableCell>Camera-Ready File</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Approval Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((sub) => {
                  const cameraFile = sub.files?.find((f) => f.file_type === 'camera_ready');
                  const isApproving = actionId === `${sub.id}-camera_ready_approved`;
                  const isRejecting = actionId === `${sub.id}-revision_required`;

                  return (
                    <TableRow key={sub.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#1565C0' }}>
                          {sub.submission_number}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
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
                        <Typography variant="body2">{sub.author_first_name} {sub.author_last_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{sub.author_email}</Typography>
                      </TableCell>
                      <TableCell>
                        {cameraFile ? (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleDownload(cameraFile)}
                            startIcon={<i className="bi bi-file-earmark-pdf"></i>}
                            sx={{ textTransform: 'none' }}
                          >
                            PDF (v{cameraFile.version})
                          </Button>
                        ) : (
                          <Chip label="Awaiting Author Upload" size="small" sx={{ backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 600 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sub.status === 'camera_ready_approved' ? 'Approved & Locked' : sub.status === 'camera_ready_pending' ? 'Pending Approval' : sub.status.toUpperCase()}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            backgroundColor: sub.status === 'camera_ready_approved' ? '#E3F2FD' : '#FEF3C7',
                            color: sub.status === 'camera_ready_approved' ? '#1565C0' : '#92400E',
                            border: `1px solid ${sub.status === 'camera_ready_approved' ? '#BBDEFB' : '#FDE68A'}`,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          {cameraFile && sub.status !== 'camera_ready_approved' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                disabled={isApproving || isRejecting}
                                onClick={() => handleUpdateStatus(sub.id, 'camera_ready_approved')}
                                startIcon={isApproving ? <CircularProgress size={16} color="inherit" /> : <i className="bi bi-check2-circle"></i>}
                              >
                                {isApproving ? 'Approving...' : 'Approve'}
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={isApproving || isRejecting}
                                onClick={() => handleUpdateStatus(sub.id, 'revision_required')}
                                startIcon={isRejecting ? <CircularProgress size={16} color="inherit" /> : <i className="bi bi-arrow-counterclockwise"></i>}
                              >
                                {isRejecting ? 'Rejecting...' : 'Request Fix'}
                              </Button>
                            </>
                          )}
                          {sub.status === 'camera_ready_approved' && (
                            <Chip
                              label="✔ Ready for Proceedings"
                              size="small"
                              sx={{ fontWeight: 700, backgroundColor: '#E0F2FE', color: '#0369A1' }}
                            />
                          )}
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

      {/* Global Snackbar */}
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
