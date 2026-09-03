import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TableSkeleton, EmptyState } from '../../components/common/LoadingState';
import BackButton from '../../components/common/BackButton';
import ConfirmModal from '../../components/common/ConfirmModal';
import api from '../../services/api';

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: '#123B32', bg: '#E8EFEB' },
  under_review: { label: 'Under Review', color: '#2F5B4E', bg: '#E8EFEB' },
  revision_required: { label: 'Revision Required', color: '#C47D4C', bg: '#FBEFE7' },
  accepted: { label: 'Accepted', color: '#15803D', bg: '#DCFCE7' },
  rejected: { label: 'Rejected', color: '#DC2626', bg: '#FEE2E2' },
  camera_ready_pending: { label: 'Camera-Ready Under Review', color: '#2F5B4E', bg: '#E8EFEB' },
  camera_ready_approved: { label: 'Camera-Ready Approved', color: '#15803D', bg: '#DCFCE7' },
};

export default function AuthorSubmissionsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload modal state (revision or camera ready)
  const [uploadModal, setUploadModal] = useState({
    open: false,
    submission: null,
    fileType: 'revision',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [modalRebuttalNotes, setModalRebuttalNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [confirmUploadOpen, setConfirmUploadOpen] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Reviews modal
  const [reviewsModal, setReviewsModal] = useState({
    open: false,
    submission: null,
    reviews: [],
  });

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/submissions/my');
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error('Failed to load my submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleOpenUpload = (sub, fileType) => {
    setUploadModal({
      open: true,
      submission: sub,
      fileType,
    });
    setSelectedFile(null);
    setError('');
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }
    setConfirmUploadOpen(true);
  };

  const handleExecuteFileUpload = async () => {
    setConfirmUploadOpen(false);
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('fileType', uploadModal.fileType);
      if (uploadModal.fileType === 'revision' && modalRebuttalNotes) {
        formData.append('rebuttalNotes', modalRebuttalNotes);
      }
      formData.append('file', selectedFile);

      await api.post(`/submissions/${uploadModal.submission.id}/upload-file?fileType=${uploadModal.fileType}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSnackbar({
        open: true,
        message: `${uploadModal.fileType === 'camera_ready' ? 'Camera-Ready paper' : 'Revised manuscript and rebuttal'} uploaded successfully!`,
        severity: 'success',
      });
      setUploadModal({ open: false, submission: null, fileType: 'revision' });
      setModalRebuttalNotes('');
      fetchSubmissions();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleViewReviews = async (sub) => {
    try {
      const res = await api.get(`/reviews/submission/${sub.id}`);
      setReviewsModal({
        open: true,
        submission: sub,
        reviews: res.data.reviews || [],
      });
    } catch (err) {
      setSnackbar({ open: true, message: 'Peer reviews are not available yet.', severity: 'info' });
    }
  };

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <BackButton fallbackUrl="/dashboard" />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F2942' }}>
              My Submissions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your submitted manuscripts, track review progress, and submit revisions
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/submit-paper')}
          startIcon={<i className="bi bi-file-earmark-plus"></i>}
        >
          Submit New Paper
        </Button>
      </Box>

      <Card sx={{ p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        {loading ? (
          <TableSkeleton rows={4} columns={6} />
        ) : submissions.length === 0 ? (
          <EmptyState
            icon="bi-journal-plus"
            title="No Submissions Yet"
            description="You have not submitted any manuscripts yet. Submit your research paper to begin the peer evaluation process."
            action={
              <Button variant="contained" onClick={() => navigate('/submit-paper')}>
                Submit Paper Now
              </Button>
            }
          />
        ) : (
          <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 140 }}>Paper ID</TableCell>
                  <TableCell sx={{ minWidth: 220 }}>Title & Track</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>Conference / Journal</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>Status</TableCell>
                  <TableCell sx={{ minWidth: 110 }}>Files</TableCell>
                  <TableCell align="right" sx={{ minWidth: 120 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((sub) => {
                  const statusInfo = STATUS_CONFIG[sub.status] || STATUS_CONFIG.submitted;
                  return (
                    <TableRow key={sub.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#123B32' }}>
                          {sub.submission_number}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#123B32', whiteSpace: 'normal' }}>
                          {sub.title}
                        </Typography>
                        <Chip
                          label={sub.track_name || 'General Track'}
                          size="small"
                          sx={{ mt: 0.5, fontSize: '0.7rem', backgroundColor: '#E8EFEB', color: '#123B32', fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {sub.conference_short_name}
                        </Typography>
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
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {sub.files && sub.files.map((f) => (
                            <Button
                              key={f.id}
                              size="small"
                              variant="text"
                              onClick={() => handleDownloadFile(f)}
                              sx={{ p: 0, justifyContent: 'flex-start', fontSize: '0.75rem', textTransform: 'none', color: '#1565C0' }}
                              startIcon={<i className="bi bi-file-earmark-arrow-down"></i>}
                            >
                              {f.file_type} (v{f.version})
                            </Button>
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          {sub.status === 'revision_required' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              onClick={() => handleOpenUpload(sub, 'revision')}
                              startIcon={<i className="bi bi-arrow-repeat"></i>}
                            >
                              Upload Revision
                            </Button>
                          )}

                          {sub.status === 'accepted' && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleOpenUpload(sub, 'camera_ready')}
                              startIcon={<i className="bi bi-award"></i>}
                            >
                              Camera-Ready
                            </Button>
                          )}

                          {(sub.decision || sub.status === 'accepted' || sub.status === 'rejected' || sub.status === 'revision_required') && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleViewReviews(sub)}
                              startIcon={<i className="bi bi-chat-left-quote"></i>}
                            >
                              Reviews
                            </Button>
                          )}

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

      {/* Upload Revision / Camera-Ready Modal */}
      <Dialog open={uploadModal.open} onClose={() => setUploadModal({ ...uploadModal, open: false })} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #D3DDD7', color: '#123B32' }}>
          {uploadModal.fileType === 'camera_ready' ? 'Upload Final Camera-Ready Paper' : 'Upload Revised Manuscript'}
        </DialogTitle>
        <Box component="form" onSubmit={handleUploadSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Typography variant="body2" sx={{ mb: 1.5, color: '#334E43' }}>
              <strong>Paper:</strong> {uploadModal.submission?.submission_number} - {uploadModal.submission?.title}
            </Typography>

            {/* Standardized File Naming Recommendation Box */}
            <Box
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 2,
                backgroundColor: '#E8EFEB',
                border: '1px solid #B8CEC2',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <i className="bi bi-file-earmark-check" style={{ color: '#123B32', fontSize: '1.1rem' }}></i>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#123B32', fontSize: '0.82rem' }}>
                  Recommended File Naming Format
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#123B32',
                  backgroundColor: '#FFFFFF',
                  px: 1.2,
                  py: 0.6,
                  borderRadius: 1,
                  display: 'inline-block',
                  border: '1px dashed #527A68',
                }}
              >
                {(uploadModal.submission?.conference_short_name || 'CONF').replace(/\s+/g, '_')}_{uploadModal.submission?.submission_number}_{uploadModal.fileType === 'camera_ready' ? 'CameraReady' : 'Revision'}.pdf
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: '#334E43', fontSize: '0.75rem' }}>
                💡 <em>Avoid spaces or special symbols in your filename for seamless tracking across all reviewer systems.</em>
              </Typography>
            </Box>

            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: 'center',
                border: '2px dashed #527A68',
                backgroundColor: '#F5F3EC',
                borderRadius: 2,
              }}
            >
              <i className="bi bi-cloud-arrow-up" style={{ fontSize: '2.5rem', color: '#123B32' }}></i>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1, color: '#123B32' }}>
                Select {uploadModal.fileType === 'camera_ready' ? 'Camera-Ready PDF' : 'Revised PDF'}
              </Typography>
              <input
                type="file"
                accept=".pdf,application/pdf"
                id="modal-file-upload"
                style={{ display: 'none' }}
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <label htmlFor="modal-file-upload">
                <Button variant="outlined" component="span" sx={{ mt: 1.5, borderColor: '#527A68', color: '#123B32' }}>
                  {selectedFile ? 'Change PDF File' : 'Browse File'}
                </Button>
              </label>
              {selectedFile && (
                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#123B32' }}>
                    ✓ Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </Typography>
                  {/\s/.test(selectedFile.name) && (
                    <Typography variant="caption" sx={{ color: '#92400E', fontWeight: 600, display: 'block', mt: 0.5 }}>
                      ℹ Note: Spaces in filename will be automatically sanitized to underscores (<code>_</code>) upon upload.
                    </Typography>
                  )}
                </Box>
              )}
            </Paper>

            {uploadModal.fileType === 'revision' && (
              <Box sx={{ mt: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#123B32' }}>
                  Response to Reviewers / Rebuttal Notes (Optional)
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Summarize how you addressed the reviewers' feedback in this revised draft..."
                  value={modalRebuttalNotes}
                  onChange={(e) => setModalRebuttalNotes(e.target.value)}
                  helperText="These notes will accompany your revised PDF for Program Committee re-evaluation."
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #D3DDD7' }}>
            <Button onClick={() => setUploadModal({ ...uploadModal, open: false })}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={uploading || !selectedFile}
              startIcon={uploading ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <i className="bi bi-cloud-arrow-up" />}
              sx={{
                fontWeight: 700,
                borderRadius: 1.5,
                backgroundColor: '#123B32',
                color: '#FFFFFF',
                '&:hover': { backgroundColor: '#0B241E' },
              }}
            >
              {uploading ? 'Uploading File...' : 'Upload File'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Upload Confirmation Modal */}
      <ConfirmModal
        open={confirmUploadOpen}
        title="Confirm Manuscript Upload"
        message={`Are you sure you want to upload "${selectedFile?.name}" as the official ${uploadModal.fileType === 'camera_ready' ? 'Final Camera-Ready Paper' : 'Revised Manuscript'} for submission #${uploadModal.submission?.submission_number}?`}
        confirmText="Yes, Upload File"
        cancelText="Review Selection"
        severity="info"
        loading={uploading}
        onConfirm={handleExecuteFileUpload}
        onCancel={() => setConfirmUploadOpen(false)}
      />

      {/* Peer Reviews Viewer Modal */}
      <Dialog open={reviewsModal.open} onClose={() => setReviewsModal({ ...reviewsModal, open: false })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #D3DDD7', color: '#123B32' }}>
          Peer Review Evaluation Feedback: {reviewsModal.submission?.submission_number}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {reviewsModal.reviews.length === 0 ? (
            <Typography color="text.secondary">No finalized review comments available yet.</Typography>
          ) : (
            reviewsModal.reviews.map((rev, idx) => (
              <Paper key={idx} elevation={0} sx={{ p: 2.5, mb: 2, border: '1px solid #D3DDD7', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#123B32' }}>
                    Reviewer #{idx + 1}
                  </Typography>
                  <Chip
                    label={`Recommendation: ${rev.recommendation?.toUpperCase() || 'N/A'}`}
                    size="small"
                    sx={{ fontWeight: 700, backgroundColor: '#E8EFEB', color: '#123B32' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, backgroundColor: '#F5F3EC', p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Technical: {rev.technical_quality || '-'}/5</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Originality: {rev.originality || '-'}/5</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Relevance: {rev.relevance || '-'}/5</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Presentation: {rev.presentation_quality || '-'}/5</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#123B32' }}>Overall: {rev.overall_score || '-'}/5</Typography>
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#123B32' }}>Comments for Authors:</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#334E43' }}>
                  {rev.comments_for_authors || 'No detailed comments provided.'}
                </Typography>
              </Paper>
            ))
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #D3DDD7' }}>
          <Button onClick={() => setReviewsModal({ ...reviewsModal, open: false })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Global Feedback Snackbar */}
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
