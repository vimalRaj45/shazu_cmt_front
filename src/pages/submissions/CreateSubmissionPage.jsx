import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Chip,
  Alert,
  IconButton,
  Divider,
  Paper,
  LinearProgress,
  CircularProgress,
  Autocomplete,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useConference } from '../../context/ConferenceContext';
import { useNavigate } from 'react-router-dom';
import BackButton from '../../components/common/BackButton';
import api from '../../services/api';

export default function CreateSubmissionPage() {
  const { user } = useAuth();
  const { selectedConference, conferences } = useConference();
  const navigate = useNavigate();

  const [conferenceId, setConferenceId] = useState(selectedConference?.id || '');
  const [tracks, setTracks] = useState([]);
  const [trackId, setTrackId] = useState('');
  const [title, setTitle] = useState('');
  const [abstract, setAbstract] = useState('');
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState([]);

  // Authors list (at least primary author)
  const [authors, setAuthors] = useState([
    {
      name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
      email: user?.email || '',
      institution: user?.institution || '',
      department: user?.department || '',
      country: user?.country || 'India',
      is_primary: true,
      is_corresponding: true,
    },
  ]);

  // Files
  const [manuscriptFile, setManuscriptFile] = useState(null);
  const [supplementaryFile, setSupplementaryFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch tracks whenever conferenceId changes
  useEffect(() => {
    if (selectedConference?.id && !conferenceId) {
      setConferenceId(selectedConference.id);
    }
  }, [selectedConference]);

  useEffect(() => {
    if (!conferenceId) return;
    const fetchTracks = async () => {
      try {
        const res = await api.get(`/tracks/conference/${conferenceId}`);
        setTracks(res.data.tracks || []);
        if (res.data.tracks && res.data.tracks.length > 0) {
          setTrackId(res.data.tracks[0].id);
        }
      } catch (err) {
        console.error('Failed to load tracks:', err);
      }
    };
    fetchTracks();
  }, [conferenceId]);

  const handleAddKeyword = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && keywordInput.trim()) {
      e.preventDefault();
      const kw = keywordInput.trim().replace(/,$/, '');
      if (!keywords.includes(kw)) {
        setKeywords([...keywords, kw]);
        setKeywordInput('');
      }
    }
  };

  const handleRemoveKeyword = (kw) => {
    setKeywords(keywords.filter((k) => k !== kw));
  };

  const handleAddAuthor = () => {
    setAuthors([
      ...authors,
      {
        name: '',
        email: '',
        institution: '',
        department: '',
        country: 'India',
        is_primary: false,
        is_corresponding: false,
      },
    ]);
  };

  const handleAuthorChange = (index, field, value) => {
    const updated = [...authors];
    updated[index][field] = value;
    setAuthors(updated);
  };

  const handleRemoveAuthor = (index) => {
    if (authors.length <= 1) return;
    setAuthors(authors.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!manuscriptFile) {
      setError('Please select a Manuscript PDF file to upload.');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);
    setUploadProgress(20);

    try {
      // 1. Create Paper Submission record
      const subRes = await api.post('/submissions', {
        conferenceId,
        trackId,
        title,
        abstract,
        keywords,
        authors,
      });

      const newSubmission = subRes.data.submission;
      setUploadProgress(50);

      // 2. Upload Manuscript file to Cloudflare R2
      const manuscriptFormData = new FormData();
      manuscriptFormData.append('file', manuscriptFile);
      manuscriptFormData.append('fileType', 'manuscript');

      await api.post(`/submissions/${newSubmission.id}/upload-file`, manuscriptFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadProgress(80);

      // 3. Upload Supplementary file if selected
      if (supplementaryFile) {
        const suppFormData = new FormData();
        suppFormData.append('file', supplementaryFile);
        suppFormData.append('fileType', 'supplementary');
        await api.post(`/submissions/${newSubmission.id}/upload-file`, suppFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setUploadProgress(100);
      setSuccess(`Paper ${newSubmission.submission_number} submitted successfully! A confirmation email has been dispatched.`);

      setTimeout(() => {
        navigate('/my-submissions');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit paper. Please verify form details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ pb: 6, maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BackButton fallbackUrl="/my-submissions" />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Submit New Manuscript
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload your academic research paper to the conference peer review pipeline
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
      {loading && <LinearProgress variant="determinate" value={uploadProgress} sx={{ mb: 3, borderRadius: 1 }} />}

      <Box component="form" onSubmit={handleSubmit}>
        {/* Step 1: Conference & Track */}
        <Card sx={{ mb: 3, p: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="bi bi-calendar3 text-primary"></i> 1. Conference & Track Selection
            </Typography>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={conferences}
                  getOptionLabel={(option) => `${option.short_name || ''} - ${option.name || ''}`}
                  value={conferences.find((c) => String(c.id) === String(conferenceId)) || null}
                  onChange={(_, newValue) => setConferenceId(newValue ? newValue.id : '')}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Target Conference *"
                      placeholder="Search conference name or code..."
                      required={!conferenceId}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.id} sx={{ fontSize: '0.875rem' }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F2942' }}>
                          {option.short_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.name}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  options={tracks}
                  getOptionLabel={(option) => option.name || ''}
                  value={tracks.find((t) => String(t.id) === String(trackId)) || null}
                  onChange={(_, newValue) => setTrackId(newValue ? newValue.id : '')}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  noOptionsText={conferenceId ? 'No tracks defined' : 'Select a conference first'}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Research Track *"
                      placeholder="Search track topic..."
                      required={!trackId}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Step 2: Paper Details */}
        <Card sx={{ mb: 3, p: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="bi bi-file-text text-primary"></i> 2. Paper Title & Abstract
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Paper Title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Scalable Machine Learning Architectures for High-Throughput Stream Processing"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  label="Abstract"
                  required
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Provide a comprehensive abstract outlining motivation, methodology, experiments, and results..."
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Keywords (Press Enter to add)"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={handleAddKeyword}
                  placeholder="e.g. Deep Learning, Distributed Systems"
                />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                  {keywords.map((kw) => (
                    <Chip key={kw} label={kw} onDelete={() => handleRemoveKeyword(kw)} size="small" color="primary" variant="outlined" />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Step 3: Authors */}
        <Card sx={{ mb: 3, p: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <i className="bi bi-people text-primary"></i> 3. Authors & Affiliations
              </Typography>
              <Button size="small" variant="outlined" onClick={handleAddAuthor} startIcon={<i className="bi bi-plus-lg"></i>}>
                Add Co-Author
              </Button>
            </Box>

            {authors.map((author, index) => (
              <Paper key={index} elevation={0} sx={{ p: 2, mb: 2, border: '1px solid #E2E8F0', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E3A8A' }}>
                    Author #{index + 1} {index === 0 && '(Primary / Submitter)'}
                  </Typography>
                  {index > 0 && (
                    <IconButton size="small" color="error" onClick={() => handleRemoveAuthor(index)}>
                      <i className="bi bi-trash"></i>
                    </IconButton>
                  )}
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Full Name"
                      required
                      value={author.name}
                      onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Email"
                      type="email"
                      required
                      value={author.email}
                      onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Institution / Company"
                      required
                      value={author.institution}
                      onChange={(e) => handleAuthorChange(index, 'institution', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Department"
                      value={author.department}
                      onChange={(e) => handleAuthorChange(index, 'department', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </CardContent>
        </Card>

        {/* Step 4: Files Upload to Cloudflare R2 */}
        <Card sx={{ mb: 3, p: 1 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <i className="bi bi-cloud-arrow-up text-primary"></i> 4. Upload Manuscript & Files (Cloudflare R2)
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    textAlign: 'center',
                    border: '1.5px dashed #527A68',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 2,
                  }}
                >
                  <i className="bi bi-file-earmark-pdf" style={{ fontSize: '1.8rem', color: '#123B32' }}></i>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 0.75, color: '#123B32' }}>
                    Manuscript File (PDF) *
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                    Max 50MB. PDF format required.
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    id="manuscript-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => setManuscriptFile(e.target.files[0])}
                  />
                  <label htmlFor="manuscript-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      size="small"
                      startIcon={<i className="bi bi-upload"></i>}
                      sx={{
                        borderRadius: 1.5,
                        fontWeight: 700,
                        borderColor: '#2F5B4E',
                        color: '#123B32',
                        textTransform: 'none',
                        px: 2,
                        py: 0.6,
                      }}
                    >
                      {manuscriptFile ? 'Change PDF File' : 'Select PDF File'}
                    </Button>
                  </label>
                  {manuscriptFile && (
                    <Typography variant="caption" sx={{ mt: 1, fontWeight: 700, color: '#123B32', display: 'block' }}>
                      ✓ {manuscriptFile.name} ({(manuscriptFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    textAlign: 'center',
                    border: '1.5px dashed #D3DDD7',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 2,
                  }}
                >
                  <i className="bi bi-folder-symlink" style={{ fontSize: '1.8rem', color: '#527A68' }}></i>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 0.75, color: '#123B32' }}>
                    Supplementary Materials (Optional)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                    ZIP, PDF, dataset, or code appendix.
                  </Typography>
                  <input
                    type="file"
                    id="supplementary-upload"
                    style={{ display: 'none' }}
                    onChange={(e) => setSupplementaryFile(e.target.files[0])}
                  />
                  <label htmlFor="supplementary-upload">
                    <Button
                      variant="outlined"
                      color="inherit"
                      component="span"
                      size="small"
                      startIcon={<i className="bi bi-upload"></i>}
                      sx={{
                        borderRadius: 1.5,
                        fontWeight: 600,
                        borderColor: '#D3DDD7',
                        color: '#334E43',
                        textTransform: 'none',
                        px: 2,
                        py: 0.6,
                      }}
                    >
                      {supplementaryFile ? 'Change File' : 'Select File'}
                    </Button>
                  </label>
                  {supplementaryFile && (
                    <Typography variant="caption" sx={{ mt: 1, fontWeight: 700, color: '#2F5B4E', display: 'block' }}>
                      ✓ {supplementaryFile.name} ({(supplementaryFile.size / 1024 / 1024).toFixed(2)} MB)
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Compact Responsive Bottom Action Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            justifyContent: 'flex-end',
            alignItems: 'stretch',
            gap: 1.5,
            mt: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => navigate('/my-submissions')}
            sx={{
              borderRadius: 1.5,
              fontWeight: 700,
              color: '#334E43',
              borderColor: '#D3DDD7',
              textTransform: 'none',
              px: 3,
              py: 1,
              height: 42,
              '&:hover': { borderColor: '#123B32', backgroundColor: '#E8EFEB' },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <i className="bi bi-check2-circle"></i>}
            sx={{
              px: 3.5,
              py: 1,
              height: 42,
              fontWeight: 700,
              fontSize: '0.875rem',
              textTransform: 'none',
              borderRadius: 1.5,
              color: '#FFFFFF',
              background: 'linear-gradient(135deg, #123B32 0%, #2F5B4E 100%)',
              boxShadow: '0 2px 8px rgba(18, 59, 50, 0.2)',
              '&.Mui-disabled': {
                background: '#123B32',
                color: '#FFFFFF',
                opacity: 0.85,
              },
              '&:hover': {
                background: '#0B241E',
              },
            }}
          >
            {loading ? 'Submitting to R2 Storage...' : 'Complete Paper Submission'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
