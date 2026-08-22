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
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TableSkeleton, EmptyState } from '../../components/common/LoadingState';
import api from '../../services/api';

const STATUS_CONFIG = {
  submitted: { label: 'Submitted', color: '#1565C0', bg: '#E3F2FD' },
  under_review: { label: 'Under Review', color: '#0288D1', bg: '#E1F5FE' },
  revision_required: { label: 'Revision Required', color: '#0284C7', bg: '#F0F9FF' },
  accepted: { label: 'Accepted', color: '#0D47A1', bg: '#E3F2FD' },
  rejected: { label: 'Rejected', color: '#64748B', bg: '#F1F5F9' },
  camera_ready_pending: { label: 'Camera-Ready Under Review', color: '#1976D2', bg: '#E8F4FD' },
  camera_ready_approved: { label: 'Camera-Ready Approved', color: '#0D47A1', bg: '#BBDEFB' },
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

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a PDF file');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('fileType', uploadModal.fileType);
      if (uploadModal.fileType === 'revision' && modalRebuttalNotes) {
        formData.append('rebuttalNotes', modalRebuttalNotes);
      }

      await api.post(`/submissions/${uploadModal.submission.id}/upload-file`, formData, {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F2942' }}>
            My Submissions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your submitted manuscripts, track review progress, and submit revisions
          </Typography>
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
            description="You have not submitted any manuscripts to this conference. Submit your research paper to begin the peer evaluation process."
            action={
              <Button variant="contained" onClick={() => navigate('/submit-paper')}>
                Submit Paper Now
              </Button>
            }
          />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Paper ID</TableCell>
                  <TableCell>Title & Track</TableCell>
                  <TableCell>Conference</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Files</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {submissions.map((sub) => {
                  const statusInfo = STATUS_CONFIG[sub.status] || STATUS_CONFIG.submitted;
                  return (
                    <TableRow key={sub.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#1565C0' }}>
                          {sub.submission_number}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ maxWidth: 320 }}>
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
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', color: '#0F2942' }}>
          {uploadModal.fileType === 'camera_ready' ? 'Upload Final Camera-Ready Paper' : 'Upload Revised Manuscript'}
        </DialogTitle>
        <Box component="form" onSubmit={handleFileUpload}>
          <DialogContent sx={{ pt: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Paper:</strong> {uploadModal.submission?.submission_number} - {uploadModal.submission?.title}
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: 'center',
                border: '2px dashed #90CAF9',
                backgroundColor: '#F8FAFC',
                borderRadius: 2,
              }}
            >
              <i className="bi bi-cloud-arrow-up" style={{ fontSize: '2.5rem', color: '#1565C0' }}></i>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mt: 1, color: '#0F2942' }}>
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
                <Button variant="outlined" component="span" sx={{ mt: 1.5 }}>
                  {selectedFile ? 'Change PDF File' : 'Browse File'}
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 1.5, fontWeight: 600, color: '#1565C0' }}>
                  ✓ {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              )}
            </Paper>

            {uploadModal.fileType === 'revision' && (
              <Box sx={{ mt: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#1565C0' }}>
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
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setUploadModal({ ...uploadModal, open: false })}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={uploading}>
              {uploading ? <CircularProgress size={22} color="inherit" /> : 'Confirm Upload'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Peer Reviews Viewer Modal */}
      <Dialog open={reviewsModal.open} onClose={() => setReviewsModal({ ...reviewsModal, open: false })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', color: '#0F2942' }}>
          Peer Review Evaluation Feedback: {reviewsModal.submission?.submission_number}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {reviewsModal.reviews.length === 0 ? (
            <Typography color="text.secondary">No finalized review comments available yet.</Typography>
          ) : (
            reviewsModal.reviews.map((rev, idx) => (
              <Paper key={idx} elevation={0} sx={{ p: 2.5, mb: 2, border: '1px solid #E2E8F0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1565C0' }}>
                    Reviewer #{idx + 1}
                  </Typography>
                  <Chip
                    label={`Recommendation: ${rev.recommendation?.toUpperCase() || 'N/A'}`}
                    size="small"
                    sx={{ fontWeight: 700, backgroundColor: '#E3F2FD', color: '#1565C0' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, backgroundColor: '#F8FAFC', p: 1.5, borderRadius: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Technical: {rev.technical_quality || '-'}/5</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Originality: {rev.originality || '-'}/5</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Relevance: {rev.relevance || '-'}/5</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>Presentation: {rev.presentation_quality || '-'}/5</Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#1565C0' }}>Overall: {rev.overall_score || '-'}/5</Typography>
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: '#0F2942' }}>Comments for Authors:</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', color: '#334155' }}>
                  {rev.comments_for_authors || 'No detailed comments provided.'}
                </Typography>
              </Paper>
            ))
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E2E8F0' }}>
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
