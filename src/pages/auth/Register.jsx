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

  // ORCID OAuth State
  const [orcidLoading, setOrcidLoading] = useState(false);
  const [orcidError, setOrcidError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (existingAccount) setExistingAccount(false);
  };

  const handleOrcidOAuthRegister = async () => {
    setOrcidLoading(true);
    setOrcidError('');
    try {
      const redirectUri = `${window.location.origin}/auth/orcid/callback`;
      console.log('[ORCID Register OAuth] Initiating registration with redirectUri:', redirectUri);
      
      let targetUrl = '';
      try {
        const res = await api.get(`/auth/orcid/url?redirectUri=${encodeURIComponent(redirectUri)}`);
        console.log('[ORCID Register OAuth] Received URL response from backend:', res.data);
        if (res.data?.authUrl && typeof res.data.authUrl === 'string' && res.data.authUrl.startsWith('http')) {
          targetUrl = res.data.authUrl;
        }
      } catch (apiErr) {
        console.warn('[ORCID Register OAuth] Backend endpoint error, generating direct authorization URL:', apiErr.message);
      }

      // If backend URL generation failed or returned non-JSON, construct direct ORCID OAuth URL
      if (!targetUrl) {
        const clientId = 'APP-NZ8CPXKBRG5YOW1S';
        targetUrl = `https://orcid.org/oauth/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&scope=/authenticate&redirect_uri=${encodeURIComponent(redirectUri)}`;
        console.log('[ORCID Register OAuth] Constructed direct ORCID URL:', targetUrl);
      }

      console.log('[ORCID Register OAuth] Navigating to ORCID register page:', targetUrl);
      window.location.href = targetUrl;
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
            background: 'linear-gradient(135deg, #123B32 0%, #1D4C40 50%, #2F5B4E 100%)',
            p: { xs: 3, sm: 3.5 },
            color: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              p: 1.25,
              borderRadius: 2,
              backgroundColor: '#FFFFFF',
              mb: 1.5,
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Shazu Soft Logo"
              sx={{
                height: 38,
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            Academic CMT Registration
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.92, color: 'rgba(255, 255, 255, 0.9)', mt: 0.5 }}>
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

          {/* Two Registration Methods: 1) One-Click ORCID OAuth or 2) Manual Form */}
          {activeStep === 0 && (
            <Box sx={{ mb: 3.5 }}>
              {orcidError && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 1 }}>
                  {orcidError}
                </Alert>
              )}

              {/* Way 1: One-Click ORCID OAuth Registration */}
              <Button
                fullWidth
                variant="outlined"
                onClick={handleOrcidOAuthRegister}
                disabled={orcidLoading || loading}
                startIcon={
                  orcidLoading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <Box
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: 1,
                        backgroundColor: '#A6CE39',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '0.75rem',
                      }}
                    >
                      iD
                    </Box>
                  )
                }
                sx={{
                  py: 1.3,
                  borderColor: '#86EFAC',
                  backgroundColor: '#F0FDF4',
                  color: '#166534',
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  borderRadius: 1.5,
                  boxShadow: '0 2px 6px rgba(22, 101, 52, 0.06)',
                  '&:hover': {
                    borderColor: '#4ADE80',
                    backgroundColor: '#DCFCE7',
                  },
                }}
              >
                {orcidLoading ? 'Connecting to ORCID...' : 'One-Click Sign Up with ORCID iD'}
              </Button>

              {/* Clean Divider */}
              <Box sx={{ display: 'flex', alignItems: 'center', my: 2.5 }}>
                <Divider sx={{ flexGrow: 1 }} />
                <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.05em' }}>
                  OR FILL REGISTRATION FORM MANUALLY
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
              </Box>
            </Box>
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
                  startIcon={loading ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <CheckCircleIcon />}
                  sx={{
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 800,
                    px: { xs: 2, sm: 3.5 },
                    py: 1.2,
                    color: '#FFFFFF',
                    background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                    boxShadow: '0 4px 14px rgba(21, 101, 192, 0.3)',
                    '&.Mui-disabled': {
                      background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                      color: '#FFFFFF',
                      opacity: 0.85,
                    },
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0D47A1 0%, #0A3880 100%)',
                    },
                  }}
                >
                  {loading ? 'Registering Account...' : 'Complete Registration & Enter Portal'}
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
