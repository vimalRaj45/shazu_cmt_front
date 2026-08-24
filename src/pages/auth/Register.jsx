import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  MenuItem,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  IconButton,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';

// Official MUI Icons
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import WorkIcon from '@mui/icons-material/Work';
import DomainIcon from '@mui/icons-material/Domain';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RateReviewIcon from '@mui/icons-material/RateReview';
import LinkIcon from '@mui/icons-material/Link';
import BadgeIcon from '@mui/icons-material/Badge';
import PsychologyIcon from '@mui/icons-material/Psychology';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const POPULAR_DOMAINS = [
  'Artificial Intelligence & Machine Learning',
  'Computer Science & Engineering',
  'Cybersecurity & Cryptography',
  'Data Science & Big Data Analytics',
  'Internet of Things & Embedded Systems',
  'Cloud & High-Performance Distributed Systems',
  'Software Engineering & DevOps',
  'Electronics & Communication Engineering',
  'Robotics & Autonomous Systems',
  'Information Systems & Management',
];

const SUGGESTED_INTEREST_TAGS = [
  'Natural Language Processing',
  'Large Language Models (LLMs)',
  'Computer Vision',
  'Deep Learning',
  'Cybersecurity',
  'Cloud Systems',
  'Edge Computing',
  'IoT Protocols',
  'Applied Cryptography',
  'Blockchain',
  'Reinforcement Learning',
  'Bioinformatics',
  'Quantum Computing',
];

const STEPS = ['Account & Credentials', 'Academic Affiliation', 'Research & Review Profile'];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Multi-step Active Index (0, 1, 2)
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    country: 'India',
    role: 'author',
    qualification: 'Ph.D. / Doctorate',
    designation: 'Assistant Professor',
    institution: '',
    department: 'Computer Science & Engineering',
    domain: 'Artificial Intelligence & Machine Learning',
    areasOfInterest: ['Deep Learning', 'Natural Language Processing'],
    interestInput: '',
    maxReviewLimit: 3,
    orcidId: '',
    googleScholarUrl: '',
    bio: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [existingAccount, setExistingAccount] = useState(false);

  // ORCID Auto-Fill & OAuth State
  const [orcidInput, setOrcidInput] = useState('');
  const [fetchingOrcid, setFetchingOrcid] = useState(false);
  const [orcidLoading, setOrcidLoading] = useState(false);
  const [orcidSuccess, setOrcidSuccess] = useState('');
  const [orcidError, setOrcidError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (existingAccount) setExistingAccount(false);
  };

  const handleFetchOrcid = async () => {
    if (!orcidInput.trim()) return;
    setFetchingOrcid(true);
    setOrcidError('');
    setOrcidSuccess('');
    console.log('[ORCID Lookup] Fetching profile for input:', orcidInput);
    try {
      const res = await api.post('/auth/orcid/lookup', { orcidId: orcidInput });
      console.log('[ORCID Lookup] Retrieved profile:', res.data);
      const p = res.data.profile;
      setFormData((prev) => ({
        ...prev,
        firstName: p.firstName || prev.firstName,
        lastName: p.lastName || prev.lastName,
        institution: p.institution || prev.institution,
        department: p.department || prev.department,
        designation: p.designation || prev.designation,
        qualification: p.qualification || prev.qualification,
        domain: p.domain || prev.domain,
        areasOfInterest: p.areasOfInterest?.length > 0 ? Array.from(new Set([...prev.areasOfInterest, ...p.areasOfInterest])) : prev.areasOfInterest,
        orcidId: p.orcidId,
        bio: p.bio || prev.bio,
      }));
      setOrcidSuccess(`Verified & loaded academic profile for ORCID: ${p.orcidId}`);
    } catch (err) {
      console.error('[ORCID Lookup] Error fetching profile:', err);
      setOrcidError(err.response?.data?.error || 'Failed to fetch public profile from ORCID');
    } finally {
      setFetchingOrcid(false);
    }
  };

  const handleOrcidOAuthRegister = async () => {
    setOrcidLoading(true);
    setOrcidError('');
    try {
      const redirectUri = `${window.location.origin}/auth/orcid/callback`;
      console.log('[ORCID Register OAuth] Requesting authorization URL for redirectUri:', redirectUri);
      const res = await api.get(`/auth/orcid/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      console.log('[ORCID Register OAuth] Received URL response:', res.data);
      
      const targetUrl = res.data?.authUrl;
      if (targetUrl && typeof targetUrl === 'string' && targetUrl.startsWith('http')) {
        console.log('[ORCID Register OAuth] Navigating to ORCID register page:', targetUrl);
        window.location.href = targetUrl;
      } else {
        console.error('[ORCID Register OAuth] Invalid or undefined authUrl received:', res.data);
        setOrcidError('Unable to load ORCID authentication URL. Please use standard registration form.');
        setOrcidLoading(false);
      }
    } catch (err) {
      console.error('[ORCID Register OAuth] Error initiating OAuth:', err);
      setOrcidError('Failed to initiate ORCID OAuth: ' + (err.response?.data?.error || err.message));
      setOrcidLoading(false);
    }
  };

  const handleAddInterest = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && formData.interestInput.trim()) {
      e.preventDefault();
      const tag = formData.interestInput.trim().replace(/,$/, '');
      if (!formData.areasOfInterest.includes(tag)) {
        setFormData({
          ...formData,
          areasOfInterest: [...formData.areasOfInterest, tag],
          interestInput: '',
        });
      }
    }
  };

  const handleToggleSuggestedTag = (tag) => {
    if (formData.areasOfInterest.includes(tag)) {
      setFormData({
        ...formData,
        areasOfInterest: formData.areasOfInterest.filter((t) => t !== tag),
      });
    } else {
      setFormData({
        ...formData,
        areasOfInterest: [...formData.areasOfInterest, tag],
      });
    }
  };

  const handleRemoveInterest = (tagToRemove) => {
    setFormData({
      ...formData,
      areasOfInterest: formData.areasOfInterest.filter((t) => t !== tagToRemove),
    });
  };

  // Step Validation & Navigation
  const handleNext = () => {
    setError('');
    if (activeStep === 0) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError('Please enter your full name (First and Last Name).');
        return;
      }
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setError('Please enter a valid official email address.');
        return;
      }
      if (!formData.password || formData.password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (!formData.country.trim()) {
        setError('Please enter your country.');
        return;
      }
    } else if (activeStep === 1) {
      if (!formData.institution.trim()) {
        setError('Please enter your University, Institution, or Organization.');
        return;
      }
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.areasOfInterest.length === 0) {
      setError('Please add at least one Area of Interest or Research Topic.');
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        institution: formData.institution,
        department: formData.department,
        country: formData.country,
        role: formData.role,
        qualification: formData.qualification,
        designation: formData.designation,
        domain: formData.domain,
        areasOfInterest: formData.areasOfInterest,
        expertiseKeywords: formData.areasOfInterest,
        maxReviewLimit: parseInt(formData.maxReviewLimit, 10) || 3,
        orcidId: formData.orcidId,
        googleScholarUrl: formData.googleScholarUrl,
        bio: formData.bio,
      });
      navigate('/dashboard');
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Registration failed. Please check form details.';
      setError(errMsg);
      if (err.response?.status === 409 || err.response?.data?.accountExists || errMsg.toLowerCase().includes('already exists') || errMsg.toLowerCase().includes('already registered')) {
        setExistingAccount(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(21, 101, 192, 0.07) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(2, 136, 209, 0.05) 0, transparent 50%)',
        py: { xs: 3, sm: 5 },
        px: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 780,
          width: '100%',
          borderRadius: 1.5,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 60%, #1976D2 100%)',
            p: { xs: 3, sm: 3.5 },
            color: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              p: 1.25,
              borderRadius: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              mb: 1.25,
            }}
          >
            <SchoolIcon sx={{ fontSize: 30, color: '#FFFFFF' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            Academic CMT Registration
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, color: '#E3F2FD', mt: 0.5 }}>
            Join Shazu Soft Conference Management Portal • Step {activeStep + 1} of 3
          </Typography>
        </Box>

        {/* Stepper Header */}
        <Box sx={{ px: { xs: 2, sm: 4 }, pt: 3, pb: 1, backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label, index) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      '&.Mui-active': { color: '#1565C0' },
                      '&.Mui-completed': { color: '#16A34A' },
                    },
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: activeStep === index ? 800 : 500, color: activeStep === index ? '#0F2942' : '#64748B' }}>
                    {label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {error && (
            <Alert
              severity={existingAccount ? 'warning' : 'error'}
              sx={{ mb: 3, borderRadius: 1 }}
              action={
                existingAccount ? (
                  <Button
                    color="primary"
                    size="small"
                    variant="contained"
                    component={Link}
                    to="/login"
                    sx={{
                      fontWeight: 800,
                      textTransform: 'none',
                      fontSize: '0.8rem',
                      borderRadius: 1,
                      backgroundColor: '#1565C0',
                      '&:hover': { backgroundColor: '#0D47A1' },
                    }}
                  >
                    Sign In Now ➔
                  </Button>
                ) : null
              }
            >
              {error}
            </Alert>
          )}

          {/* ORCID Fast Auto-Fill Banner (Visible on Step 1 or 2) */}
          {activeStep === 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3.5,
                backgroundColor: '#F0FDF4',
                border: '1.5px solid #86EFAC',
                borderRadius: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: 1,
                      backgroundColor: '#A6CE39',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: '0.8rem',
                    }}
                  >
                    iD
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#166534', fontSize: '0.9rem' }}>
                      Fast Track: Auto-Fill All 3 Steps via ORCID iD
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#15803D' }}>
                      Pull name, university affiliation & research keywords directly from ORCID
                    </Typography>
                  </Box>
                </Box>
                {formData.orcidId && (
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: '0.9rem !important', color: '#166534 !important' }} />}
                    label={`Verified: ${formData.orcidId}`}
                    color="success"
                    size="small"
                    sx={{ fontWeight: 700, fontSize: '0.75rem', borderRadius: 1 }}
                  />
                )}
              </Box>

              <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Enter ORCID iD (e.g. 0000-0002-1825-0097)"
                    value={orcidInput}
                    onChange={(e) => setOrcidInput(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon sx={{ color: '#16A34A', fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ backgroundColor: '#FFFFFF', borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    disabled={fetchingOrcid || !orcidInput.trim()}
                    onClick={handleFetchOrcid}
                    startIcon={fetchingOrcid ? <CircularProgress size={14} color="inherit" /> : <CloudDownloadIcon />}
                    sx={{
                      backgroundColor: '#16A34A',
                      '&:hover': { backgroundColor: '#15803D' },
                      fontWeight: 700,
                      textTransform: 'none',
                      py: 0.9,
                      borderRadius: 1,
                    }}
                  >
                    {fetchingOrcid ? 'Fetching...' : 'Fetch from ORCID'}
                  </Button>
                </Grid>
              </Grid>

              {orcidSuccess && (
                <Alert severity="success" sx={{ mt: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.8rem' }}>
                  {orcidSuccess}
                </Alert>
              )}

              {orcidError && (
                <Alert severity="warning" sx={{ mt: 1.5, py: 0.5, borderRadius: 1, fontSize: '0.8rem' }}>
                  {orcidError}
                </Alert>
              )}

              <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed #86EFAC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                  Skip registration form entirely?
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleOrcidOAuthRegister}
                  disabled={orcidLoading}
                  startIcon={orcidLoading ? <CircularProgress size={12} color="inherit" /> : <OpenInNewIcon sx={{ fontSize: 14 }} />}
                  sx={{
                    borderColor: '#16A34A',
                    color: '#166534',
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.775rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 1,
                    py: 0.4,
                  }}
                >
                  {orcidLoading ? 'Connecting...' : 'One-Click Sign Up with ORCID OAuth'}
                </Button>
              </Box>
            </Paper>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* STEP 1: Account Credentials */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F2942', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon sx={{ color: '#1565C0', fontSize: 20 }} /> Step 1: Account & Credentials
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Josiah"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Carberry"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Official Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="scholar@university.edu"
                      helperText="Used for review notifications & paper submissions"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••••••"
                      helperText="Minimum 6 characters"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      placeholder="e.g. India, United States"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PublicIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Primary Role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WorkIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="author">Author (Submit Papers & Track Reviews)</MenuItem>
                      <MenuItem value="reviewer">Reviewer (Evaluate Papers in Field)</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* STEP 2: Academic Qualifications & Affiliation */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F2942', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SchoolIcon sx={{ color: '#1565C0', fontSize: 20 }} /> Step 2: Academic Qualifications & Affiliation
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      label="Highest Qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      helperText="Used by AI to balance review assignments"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SchoolIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value="Ph.D. / Doctorate">Ph.D. / Doctorate</MenuItem>
                      <MenuItem value="Post-Doctorate / D.Sc.">Post-Doctorate / D.Sc.</MenuItem>
                      <MenuItem value="Master of Technology (M.Tech / M.E.)">Master of Technology (M.Tech / M.E.)</MenuItem>
                      <MenuItem value="Master of Science (M.S. / M.Sc.)">Master of Science (M.S. / M.Sc.)</MenuItem>
                      <MenuItem value="Bachelor of Technology (B.Tech / B.E.)">Bachelor of Technology (B.Tech / B.E.)</MenuItem>
                      <MenuItem value="Industry Specialist / Corporate Researcher">Industry Specialist / Corporate Researcher</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Academic Title / Designation"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="e.g. Professor, Research Scientist, Lead Engineer"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="University / Institution / Organization"
                      name="institution"
                      value={formData.institution}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Wesleyan University / IIT Madras"
                      helperText="Used for automated Conflict-of-Interest (COI) prevention"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DomainIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department / Faculty"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science & Engineering"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccountTreeIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      select
                      label="Primary Research Discipline / Domain"
                      name="domain"
                      value={formData.domain}
                      onChange={handleChange}
                      helperText="Primary track category used for intelligent reviewer matching"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PsychologyIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    >
                      {POPULAR_DOMAINS.map((dom) => (
                        <MenuItem key={dom} value={dom}>
                          {dom}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* STEP 3: Research Expertise & Review Profile */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F2942', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AutoAwesomeIcon sx={{ color: '#1565C0', fontSize: 20 }} /> Step 3: Research Interests & AI Review Profile
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add your research topics. Our AI auto-assigner matches papers based on keyword & domain overlap.
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Add Research Topic / Area of Interest"
                      placeholder="Type a keyword and press Enter or comma (e.g. Large Language Models, Cybersecurity)"
                      name="interestInput"
                      value={formData.interestInput}
                      onChange={handleChange}
                      onKeyDown={handleAddInterest}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MenuBookIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                if (formData.interestInput.trim()) {
                                  const tag = formData.interestInput.trim().replace(/,$/, '');
                                  if (!formData.areasOfInterest.includes(tag)) {
                                    setFormData({
                                      ...formData,
                                      areasOfInterest: [...formData.areasOfInterest, tag],
                                      interestInput: '',
                                    });
                                  }
                                }
                              }}
                            >
                              <AddCircleIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    {/* Selected Tags Display */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1.5, minHeight: 32 }}>
                      {formData.areasOfInterest.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          onDelete={() => handleRemoveInterest(tag)}
                          color="primary"
                          variant="filled"
                          sx={{
                            fontWeight: 700,
                            backgroundColor: '#1565C0',
                            color: '#FFFFFF',
                            borderRadius: 1,
                            fontSize: '0.8rem',
                          }}
                        />
                      ))}
                    </Box>

                    {/* Quick-Pick Popular Suggestions */}
                    <Box sx={{ mt: 1.5, p: 1.5, backgroundColor: '#F8FAFC', borderRadius: 1.5, border: '1px dashed #CBD5E1' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.8 }}>
                        Quick Select Suggestions:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                        {SUGGESTED_INTEREST_TAGS.map((tag) => {
                          const isSelected = formData.areasOfInterest.includes(tag);
                          return (
                            <Chip
                              key={tag}
                              label={tag}
                              clickable
                              size="small"
                              onClick={() => handleToggleSuggestedTag(tag)}
                              variant={isSelected ? 'filled' : 'outlined'}
                              color={isSelected ? 'primary' : 'default'}
                              sx={{
                                fontWeight: isSelected ? 700 : 500,
                                borderRadius: 1,
                                fontSize: '0.725rem',
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      select
                      size="small"
                      label="Max Review Capacity"
                      name="maxReviewLimit"
                      value={formData.maxReviewLimit}
                      onChange={handleChange}
                      helperText="Target workload limit per conference"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <RateReviewIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    >
                      <MenuItem value={1}>1 Paper (Light)</MenuItem>
                      <MenuItem value={2}>2 Papers (Standard)</MenuItem>
                      <MenuItem value={3}>3 Papers (Recommended)</MenuItem>
                      <MenuItem value={4}>4 Papers (Active)</MenuItem>
                      <MenuItem value={5}>5 Papers (Heavy Workload)</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="ORCID iD (Optional)"
                      name="orcidId"
                      value={formData.orcidId}
                      onChange={handleChange}
                      placeholder="0000-0002-1825-0097"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkIcon sx={{ color: '#16A34A', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Google Scholar / Research Profile URL (Optional)"
                      name="googleScholarUrl"
                      value={formData.googleScholarUrl}
                      onChange={handleChange}
                      placeholder="https://scholar.google.com/citations?user=..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LinkIcon sx={{ color: '#64748B', fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Stepper Navigation Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 2, borderTop: '1px solid #E2E8F0' }}>
              {activeStep > 0 ? (
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 700,
                    color: '#475569',
                    borderColor: '#CBD5E1',
                    '&:hover': { borderColor: '#94A3B8', backgroundColor: '#F8FAFC' },
                  }}
                >
                  Back
                </Button>
              ) : (
                <Box />
              )}

              {activeStep < STEPS.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 800,
                    px: 3,
                    py: 1.2,
                    background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                    boxShadow: '0 4px 12px rgba(21, 101, 192, 0.25)',
                  }}
                >
                  Continue to {STEPS[activeStep + 1]}
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={!loading && <CheckCircleIcon />}
                  sx={{
                    borderRadius: 1,
                    textTransform: 'none',
                    fontWeight: 800,
                    px: 3.5,
                    py: 1.2,
                    background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                    boxShadow: '0 4px 14px rgba(21, 101, 192, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0D47A1 0%, #0A3880 100%)',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Complete Registration & Enter Portal'}
                </Button>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already registered?{' '}
                <Link to="/login" style={{ color: '#1565C0', fontWeight: 800, textDecoration: 'none' }}>
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
