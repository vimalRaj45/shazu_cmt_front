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
  InputAdornment,
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  // Edit Submission Modal
  const [editModal, setEditModal] = useState({
    open: false,
    submission: null,
    title: '',
    abstract: '',
    keywords: '',
    saving: false,
  });

  // Delete / Withdraw Modal
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    submission: null,
    deleting: false,
  });

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

  // Open Edit Modal
  const handleOpenEdit = (sub) => {
    setEditModal({
      open: true,
      submission: sub,
      title: sub.title || '',
      abstract: sub.abstract || '',
      keywords: Array.isArray(sub.keywords) ? sub.keywords.join(', ') : '',
      saving: false,
    });
  };

  // Save Edit Submission
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editModal.submission) return;
    setEditModal((prev) => ({ ...prev, saving: true }));
    try {
      const keywordsArray = editModal.keywords
        ? editModal.keywords.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      await api.put(`/submissions/${editModal.submission.id}`, {
        title: editModal.title,
        abstract: editModal.abstract,
        keywords: keywordsArray,
      });

      setSnackbar({ open: true, message: 'Submission updated successfully!', severity: 'success' });
      setEditModal({ open: false, submission: null, title: '', abstract: '', keywords: '', saving: false });
      fetchSubmissions();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to update submission', severity: 'error' });
      setEditModal((prev) => ({ ...prev, saving: false }));
    }
  };

  // Delete / Withdraw Submission
  const handleDeleteSubmission = async () => {
    if (!deleteModal.submission) return;
    setDeleteModal((prev) => ({ ...prev, deleting: true }));
    try {
      await api.delete(`/submissions/${deleteModal.submission.id}`);
      setSnackbar({ open: true, message: `Submission ${deleteModal.submission.submission_number} withdrawn successfully.`, severity: 'success' });
      setDeleteModal({ open: false, submission: null, deleting: false });
      fetchSubmissions();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Failed to withdraw submission', severity: 'error' });
      setDeleteModal((prev) => ({ ...prev, deleting: false }));
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

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch = search
      ? sub.title?.toLowerCase().includes(search.toLowerCase()) ||
        sub.submission_number?.toLowerCase().includes(search.toLowerCase()) ||
        sub.conference_short_name?.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesStatus = statusFilter ? sub.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

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
              Manage your submitted manuscripts, track review progress, edit paper metadata, and submit revisions
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          onClick={() => navigate('/submit-paper')}
          startIcon={<i className="bi bi-file-earmark-plus"></i>}
          sx={{ fontWeight: 700, borderRadius: 2 }}
        >
          Submit New Paper
        </Button>
      </Box>

      {/* Filter Bar */}
      <Card sx={{ mb: 3, p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={7}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search paper by title, submission ID, or conference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="bi bi-search" style={{ color: '#1565C0' }}></i>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth
                select
                size="small"
                label="Filter by Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="submitted">Submitted</MenuItem>
                <MenuItem value="under_review">Under Review</MenuItem>
                <MenuItem value="revision_required">Revision Required</MenuItem>
                <MenuItem value="accepted">Accepted</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
                <MenuItem value="camera_ready_pending">Camera-Ready Under Review</MenuItem>
                <MenuItem value="camera_ready_approved">Camera-Ready Approved</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ p: 1, border: '1px solid #E2E8F0', borderRadius: 3 }}>
        {loading ? (
          <TableSkeleton rows={4} columns={6} />
        ) : filteredSubmissions.length === 0 ? (
          <EmptyState
            icon="bi-journal-plus"
            title="No Submissions Found"
            description={submissions.length === 0 ? "You have not submitted any manuscripts yet. Submit your research paper to begin the peer evaluation process." : "No papers matched your search or status filter."}
            action={
              submissions.length === 0 ? (
                <Button variant="contained" onClick={() => navigate('/submit-paper')}>
                  Submit Paper Now
                </Button>
              ) : null
            }
          />
        ) : (
          <TableContainer sx={{ width: '100%', overflowX: 'auto' }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 140 }}>Paper ID</TableCell>
                  <TableCell sx={{ minWidth: 240 }}>Title & Track</TableCell>
                  <TableCell sx={{ minWidth: 150 }}>Conference</TableCell>
                  <TableCell sx={{ minWidth: 130 }}>Status</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>Files</TableCell>
                  <TableCell align="right" sx={{ minWidth: 160 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubmissions.map((sub) => {
                  const statusInfo = STATUS_CONFIG[sub.status] || STATUS_CONFIG.submitted;
                  const isEditable = ['submitted', 'revision_required', 'draft'].includes(sub.status);
                  const isDeletable = !['accepted', 'camera_ready_approved'].includes(sub.status);

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
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5 }}>
                          {sub.status === 'revision_required' && (
                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              onClick={() => handleOpenUpload(sub, 'revision')}
                              startIcon={<i className="bi bi-arrow-repeat"></i>}
                            >
                              Revision
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

                          {isEditable && (
                            <Tooltip title="Edit Paper Details">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenEdit(sub)}
                              >
                                <i className="bi bi-pencil"></i>
                              </IconButton>
                            </Tooltip>
                          )}

                          <Tooltip title="View Paper Details">
                            <IconButton
                              size="small"
                              onClick={() => navigate(`/submission/${sub.id}`)}
                              sx={{ color: '#1565C0' }}
                            >
                              <i className="bi bi-eye"></i>
                            </IconButton>
                          </Tooltip>

                          {isDeletable && (
                            <Tooltip title="Withdraw / Delete Submission">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteModal({ open: true, submission: sub, deleting: false })}
                              >
                                <i className="bi bi-trash"></i>
                              </IconButton>
                            </Tooltip>
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

      {/* Edit Submission Modal */}
      <Dialog open={editModal.open} onClose={() => setEditModal({ ...editModal, open: false })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', color: '#0F2942' }}>
          Edit Paper Details ({editModal.submission?.submission_number})
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveEdit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Manuscript Title"
                  required
                  size="small"
                  value={editModal.title}
                  onChange={(e) => setEditModal({ ...editModal, title: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Abstract"
                  required
                  multiline
                  rows={4}
                  size="small"
                  value={editModal.abstract}
                  onChange={(e) => setEditModal({ ...editModal, abstract: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Keywords (comma-separated)"
                  size="small"
                  value={editModal.keywords}
                  onChange={(e) => setEditModal({ ...editModal, keywords: e.target.value })}
                  helperText="e.g. Distributed Systems, Cloud Computing, Consensus"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
            <Button onClick={() => setEditModal({ ...editModal, open: false })}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={editModal.saving || !editModal.title.trim()}
              startIcon={editModal.saving ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <i className="bi bi-check2" />}
              sx={{ fontWeight: 700 }}
            >
              {editModal.saving ? 'Saving...' : 'Save Paper Details'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

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
              <Typography variant="subtitle1" sx={{ mt: 1, fontWeight: 700, color: '#123B32' }}>
                {selectedFile ? selectedFile.name : 'Choose a PDF file to upload'}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                PDF only (Max 30MB)
              </Typography>

              <input
                type="file"
                accept="application/pdf"
                id="modal-file-upload-input"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    setError('');
                  }
                }}
              />
              <label htmlFor="modal-file-upload-input">
                <Button variant="outlined" component="span" startIcon={<i className="bi bi-folder2-open"></i>}>
                  Browse File
                </Button>
              </label>
            </Paper>

            {uploadModal.fileType === 'revision' && (
              <TextField
                fullWidth
                label="Author Response / Rebuttal Notes"
                multiline
                rows={3}
                sx={{ mt: 2.5 }}
                placeholder="Describe the modifications made in response to reviewers' comments..."
                value={modalRebuttalNotes}
                onChange={(e) => setModalRebuttalNotes(e.target.value)}
              />
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: '1px solid #D3DDD7' }}>
            <Button onClick={() => setUploadModal({ ...uploadModal, open: false })}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={uploading || !selectedFile}
              startIcon={uploading ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <i className="bi bi-upload"></i>}
              sx={{ fontWeight: 700 }}
            >
              {uploading ? 'Uploading...' : 'Confirm Upload'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete / Withdraw Confirmation Modal */}
      <ConfirmModal
        open={deleteModal.open}
        title="Withdraw Submission"
        message={`Are you sure you want to withdraw paper "${deleteModal.submission?.title}" (${deleteModal.submission?.submission_number})? All uploaded files will be permanently deleted and reviewers notified.`}
        confirmText={deleteModal.deleting ? 'Withdrawing...' : 'Withdraw Submission'}
        confirmColor="error"
        onConfirm={handleDeleteSubmission}
        onClose={() => setDeleteModal({ open: false, submission: null, deleting: false })}
      />

      {/* Confirmation Modal for File Upload */}
      <ConfirmModal
        open={confirmUploadOpen}
        title={`Confirm ${uploadModal.fileType === 'camera_ready' ? 'Camera-Ready' : 'Revision'} Upload`}
        message={`You are about to upload "${selectedFile?.name}" for paper ${uploadModal.submission?.submission_number}. Do you want to proceed?`}
        confirmText="Yes, Upload File"
        onConfirm={handleExecuteFileUpload}
        onClose={() => setConfirmUploadOpen(false)}
      />

      {/* Reviews View Modal */}
      <Dialog open={reviewsModal.open} onClose={() => setReviewsModal({ ...reviewsModal, open: false })} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, borderBottom: '1px solid #E2E8F0', color: '#0F2942' }}>
          Peer Review Evaluations ({reviewsModal.submission?.submission_number})
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {reviewsModal.reviews.length === 0 ? (
            <Alert severity="info">No completed reviews available yet for this submission.</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {reviewsModal.reviews.map((r, idx) => (
                <Paper key={r.id || idx} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F2942' }}>
                      Reviewer #{idx + 1}
                    </Typography>
                    <Chip
                      label={`Score: ${r.overall_score || 'N/A'}/5`}
                      color={r.overall_score >= 4 ? 'success' : r.overall_score >= 3 ? 'primary' : 'warning'}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', mb: 0.5 }}>
                    Comments for Authors:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', backgroundColor: '#F8FAFC', p: 1.5, borderRadius: 1.5 }}>
                    {r.comments_for_authors || 'No detailed comments provided.'}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #E2E8F0' }}>
          <Button variant="contained" onClick={() => setReviewsModal({ ...reviewsModal, open: false })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Feedback */}
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
