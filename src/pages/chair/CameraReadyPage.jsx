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
import BackButton from '../../components/common/BackButton';
import ConfirmModal from '../../components/common/ConfirmModal';
import api from '../../services/api';

export default function CameraReadyPage() {
  const { selectedConference } = useConference();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ open: false, submissionId: null, subNumber: '', status: '', title: '', message: '', confirmText: '', severity: 'info' });
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

  const handleOpenConfirmModal = (sub, status) => {
    if (status === 'camera_ready_approved') {
      setConfirmModal({
        open: true,
        submissionId: sub.id,
        subNumber: sub.submission_number,
        status,
        title: 'Approve Camera-Ready Manuscript',
        message: `Are you sure you want to approve manuscript #${sub.submission_number} ("${sub.title}") for final publication and session proceedings?`,
        confirmText: 'Yes, Approve Camera-Ready',
        severity: 'success',
      });
    } else {
      setConfirmModal({
        open: true,
        submissionId: sub.id,
        subNumber: sub.submission_number,
        status,
        title: 'Request Camera-Ready Correction',
        message: `Request authors of manuscript #${sub.submission_number} to fix formatting issues and upload a corrected camera-ready PDF?`,
        confirmText: 'Request Fix from Author',
        severity: 'warning',
      });
    }
  };

  const handleExecuteStatusUpdate = async () => {
    const { submissionId, status } = confirmModal;
    setConfirmModal({ ...confirmModal, open: false });
    setActionId(`${submissionId}-${status}`);
    try {
      await api.post(`/camera-ready/${submissionId}/status`, { status });
      setSnackbar({
        open: true,
        message: status === 'camera_ready_approved' ? 'Camera-Ready approved and locked for proceedings!' : 'Correction requested from authors.',
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
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BackButton fallbackUrl="/dashboard" />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#123B32' }}>
            Camera-Ready Papers Approval Desk
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Inspect final publication-ready manuscripts, verify formatting, and approve papers for proceedings
          </Typography>
        </Box>
      </Box>

      <Card sx={{ p: 1, border: '1px solid #D3DDD7', borderRadius: 3, backgroundColor: '#FFFFFF' }}>
        {loading ? (
          <TableSkeleton rows={4} columns={6} />
        ) : submissions.length === 0 ? (
          <EmptyState
            icon="bi-award"
            title="No Accepted Papers Pending Approval"
            description="Accepted papers will appear here once authors upload their final camera-ready manuscripts."
          />
        ) : (
          <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
            <Table sx={{ minWidth: 950 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 140, width: 140 }}>Paper ID</TableCell>
                  <TableCell sx={{ minWidth: 260, maxWidth: 340 }}>Title & Track</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>Corresponding Author</TableCell>
                  <TableCell sx={{ minWidth: 180 }}>Camera-Ready File</TableCell>
                  <TableCell sx={{ minWidth: 140 }}>Status</TableCell>
                  <TableCell align="right" sx={{ minWidth: 180 }}>Approval Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((sub) => {
                  const cameraFile =
                    sub.camera_ready_files?.[0] ||
                    sub.files?.find((f) => f.file_type === 'camera_ready') ||
                    (sub.files && sub.files.length > 0 ? sub.files[0] : null);

                  const isApproving = actionId === `${sub.id}-camera_ready_approved`;
                  const isRejecting = actionId === `${sub.id}-revision_required`;

                  return (
                    <TableRow key={sub.id} hover>
                      <TableCell sx={{ minWidth: 140 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#123B32' }}>
                          {sub.submission_number}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 260, maxWidth: 340 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#123B32', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                          {sub.title}
                        </Typography>
                        <Chip
                          label={sub.track_name || 'General Track'}
                          size="small"
                          sx={{ mt: 0.5, fontSize: '0.7rem', backgroundColor: '#E8EFEB', color: '#123B32', fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#26322E' }}>{sub.author_first_name} {sub.author_last_name}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', wordBreak: 'break-all' }}>{sub.author_email}</Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: 180 }}>
                        {cameraFile ? (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleDownload(cameraFile)}
                            startIcon={<i className="bi bi-file-earmark-pdf"></i>}
                            sx={{ textTransform: 'none', borderColor: '#527A68', color: '#123B32', fontWeight: 700, '&:hover': { backgroundColor: '#E8EFEB' } }}
                          >
                            PDF ({cameraFile.file_type === 'camera_ready' ? `Camera-Ready v${cameraFile.version || 1}` : `v${cameraFile.version || 1}`})
                          </Button>
                        ) : (
                          <Chip label="Awaiting Author Upload" size="small" sx={{ backgroundColor: '#FBEFE7', color: '#C47D4C', fontWeight: 700 }} />
                        )}
                      </TableCell>
                      <TableCell sx={{ minWidth: 140 }}>
                        <Chip
                          label={sub.status === 'camera_ready_approved' ? 'Approved & Locked' : sub.status === 'camera_ready_pending' ? 'Pending Approval' : sub.status.toUpperCase()}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            backgroundColor: sub.status === 'camera_ready_approved' ? '#E8EFEB' : sub.status === 'camera_ready_pending' ? '#E0F2FE' : '#FEF3C7',
                            color: sub.status === 'camera_ready_approved' ? '#123B32' : sub.status === 'camera_ready_pending' ? '#0369A1' : '#92400E',
                            border: `1px solid ${sub.status === 'camera_ready_approved' ? '#527A68' : '#BAE6FD'}`,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ minWidth: 180 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          {cameraFile && sub.status !== 'camera_ready_approved' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                disabled={isApproving || isRejecting}
                                onClick={() => handleOpenConfirmModal(sub, 'camera_ready_approved')}
                                startIcon={isApproving ? <CircularProgress size={16} color="inherit" /> : <i className="bi bi-check2-circle"></i>}
                                sx={{ backgroundColor: '#123B32', fontWeight: 700, '&:hover': { backgroundColor: '#0B241E' } }}
                              >
                                {isApproving ? 'Approving...' : 'Approve'}
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                disabled={isApproving || isRejecting}
                                onClick={() => handleOpenConfirmModal(sub, 'revision_required')}
                                startIcon={isRejecting ? <CircularProgress size={16} color="inherit" /> : <i className="bi bi-arrow-counterclockwise"></i>}
                                sx={{ fontWeight: 700 }}
                              >
                                {isRejecting ? 'Rejecting...' : 'Request Fix'}
                              </Button>
                            </>
                          )}
                          {sub.status === 'camera_ready_approved' && (
                            <Chip
                              label="✔ Ready for Proceedings"
                              size="small"
                              sx={{ fontWeight: 700, backgroundColor: '#E8EFEB', color: '#123B32', border: '1px solid #527A68' }}
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

      {/* Confirmation Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        severity={confirmModal.severity}
        onConfirm={handleExecuteStatusUpdate}
        onCancel={() => setConfirmModal({ ...confirmModal, open: false })}
      />

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
