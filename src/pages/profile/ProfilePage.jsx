import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  Avatar,
  Chip,
  Divider,
  Alert,
  Snackbar,
  CircularProgress,
  Stack,
  Paper,
  InputAdornment,
  Tooltip,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/common/ConfirmModal';
import api from '../../services/api';

const ROLE_BADGES = {
  admin: { label: 'Administrator', bg: '#E8EFEB', color: '#123B32', border: '#527A68', icon: 'bi-shield-lock-fill' },
  reviewer: { label: 'Peer Reviewer', bg: '#E8EFEB', color: '#2F5B4E', border: '#527A68', icon: 'bi-journal-check' },
  author: { label: 'Author', bg: '#FBEFE7', color: '#C47D4C', border: '#C47D4C', icon: 'bi-file-earmark-text' },
};

export default function ProfilePage() {
  const { user: authUser, setUser: setAuthUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingOrcid, setSyncingOrcid] = useState(false);
  const [connectingOrcid, setConnectingOrcid] = useState(false);
  const [showCancelEditConfirm, setShowCancelEditConfirm] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    institution: '',
    department: '',
    country: '',
    qualification: '',
    designation: '',
    domain: '',
    areasOfInterest: [],
    expertiseKeywords: [],
    maxReviewLimit: 3,
    orcidId: '',
    googleScholarUrl: '',
    bio: '',
    newInterest: '',
  });

  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Fetch full user profile from backend
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/me');
      const u = res.data.user;
      setProfile(u);
      setFormData({
        firstName: u.first_name || '',
        lastName: u.last_name || '',
        institution: u.institution || '',
        department: u.department || '',
        country: u.country || '',
        qualification: u.qualification || '',
        designation: u.designation || '',
        domain: u.domain || '',
        areasOfInterest: Array.isArray(u.areas_of_interest) ? u.areas_of_interest : [],
        expertiseKeywords: Array.isArray(u.expertise_keywords) ? u.expertise_keywords : [],
        maxReviewLimit: u.max_review_limit || 3,
        orcidId: u.orcid_id || '',
        googleScholarUrl: u.google_scholar_url || '',
        bio: u.bio || '',
        newInterest: '',
      });
    } catch (err) {
      console.error('[ProfilePage] Error fetching user profile:', err);
      if (authUser) {
        setProfile(authUser);
        setFormData({
          firstName: authUser.first_name || '',
          lastName: authUser.last_name || '',
          institution: authUser.institution || '',
          department: authUser.department || '',
          country: authUser.country || '',
          qualification: authUser.qualification || '',
          designation: authUser.designation || '',
          domain: authUser.domain || '',
          areasOfInterest: Array.isArray(authUser.areas_of_interest) ? authUser.areas_of_interest : [],
          expertiseKeywords: Array.isArray(authUser.expertise_keywords) ? authUser.expertise_keywords : [],
          maxReviewLimit: authUser.max_review_limit || 3,
          orcidId: authUser.orcid_id || '',
          googleScholarUrl: authUser.google_scholar_url || '',
          bio: authUser.bio || '',
          newInterest: '',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleCancelClick = () => {
    const isDirty =
      formData.firstName !== (profile?.first_name || '') ||
      formData.lastName !== (profile?.last_name || '') ||
      formData.institution !== (profile?.institution || '') ||
      formData.department !== (profile?.department || '') ||
      formData.country !== (profile?.country || '') ||
      formData.qualification !== (profile?.qualification || '') ||
      formData.designation !== (profile?.designation || '') ||
      formData.domain !== (profile?.domain || '') ||
      formData.bio !== (profile?.bio || '') ||
      formData.orcidId !== (profile?.orcid_id || '') ||
      formData.googleScholarUrl !== (profile?.google_scholar_url || '');

    if (isDirty) {
      setShowCancelEditConfirm(true);
    } else {
      setEditMode(false);
    }
  };

  const handleConfirmDiscard = () => {
    setShowCancelEditConfirm(false);
    setEditMode(false);
    fetchUserProfile();
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddInterest = (e) => {
    if ((e.key === 'Enter' || e.type === 'click') && formData.newInterest.trim()) {
      e.preventDefault();
      const val = formData.newInterest.trim();
      if (!formData.areasOfInterest.includes(val)) {
        setFormData({
          ...formData,
          areasOfInterest: [...formData.areasOfInterest, val],
          newInterest: '',
        });
      }
    }
  };

  const handleRemoveInterest = (tag) => {
    setFormData({
      ...formData,
      areasOfInterest: formData.areasOfInterest.filter((t) => t !== tag),
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        institution: formData.institution,
        department: formData.department,
        country: formData.country,
        qualification: formData.qualification,
        designation: formData.designation,
        domain: formData.domain,
        areasOfInterest: formData.areasOfInterest,
        expertiseKeywords: formData.areasOfInterest,
        maxReviewLimit: parseInt(formData.maxReviewLimit, 10) || 3,
        orcidId: formData.orcidId,
        googleScholarUrl: formData.googleScholarUrl,
        bio: formData.bio,
      };

      const res = await api.put('/auth/profile', payload);
      const updatedUser = res.data.user;

      setProfile(updatedUser);
      if (setAuthUser) {
        setAuthUser(updatedUser);
      }
      localStorage.setItem('cmt_user', JSON.stringify(updatedUser));

      setEditMode(false);
      setNotification({
        open: true,
        message: 'Profile updated successfully!',
        severity: 'success',
      });
    } catch (err) {
      console.error('[ProfilePage] Failed to save profile:', err);
      setNotification({
        open: true,
        message: err.response?.data?.error || 'Failed to update profile. Please try again.',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSyncOrcid = async () => {
    if (!formData.orcidId) return;
    setSyncingOrcid(true);
    try {
      const res = await api.post('/auth/orcid/lookup', { orcidId: formData.orcidId });
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
        bio: p.bio || prev.bio,
      }));
      setNotification({
        open: true,
        message: 'Synchronized latest academic credentials from ORCID public record!',
        severity: 'success',
      });
    } catch (err) {
      setNotification({
        open: true,
        message: err.response?.data?.error || 'Failed to fetch public ORCID record.',
        severity: 'error',
      });
    } finally {
      setSyncingOrcid(false);
    }
  };

  const handleConnectOrcid = async () => {
    setConnectingOrcid(true);
    try {
      const redirectUri = `${window.location.origin}/auth/orcid/callback`;
      let targetUrl = '';
      try {
        const res = await api.get(`/auth/orcid/url?redirectUri=${encodeURIComponent(redirectUri)}`);
        if (res.data?.authUrl && typeof res.data.authUrl === 'string' && res.data.authUrl.startsWith('http')) {
          targetUrl = res.data.authUrl;
        }
      } catch (e) {
        console.warn('[ORCID OAuth] Using direct OAuth fallback:', e.message);
      }

      if (!targetUrl) {
        const clientId = 'APP-NZ8CPXKBRG5YOW1S';
        targetUrl = `https://orcid.org/oauth/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&scope=/authenticate&redirect_uri=${encodeURIComponent(redirectUri)}`;
      }

      window.location.href = targetUrl;
    } catch (err) {
      console.error('[ORCID Connect] Error:', err);
      setNotification({
        open: true,
        message: 'Failed to initiate ORCID connection. Please try again.',
        severity: 'error',
      });
      setConnectingOrcid(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={40} sx={{ color: '#1565C0' }} />
      </Box>
    );
  }

  const roleStyle = ROLE_BADGES[profile?.role] || ROLE_BADGES.author;

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Top Banner Card */}
      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid #D3DDD7',
          boxShadow: '0 4px 20px rgba(18, 59, 50, 0.08)',
          backgroundColor: '#FFFFFF',
          mb: 3.5,
        }}
      >
        {/* Sleek Brand Gradient Header Bar */}
        <Box
          sx={{
            minHeight: { xs: 'auto', sm: 100 },
            background: 'linear-gradient(135deg, #123B32 0%, #1D4C40 50%, #2F5B4E 100%)',
            px: { xs: 2, sm: 4 },
            py: { xs: 2, sm: 2.75 },
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 1.5, sm: 2 },
            position: 'relative',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'rgba(255, 255, 255, 0.95)' }}>
            <i className="bi bi-person-badge" style={{ fontSize: '1.1rem' }} />
            <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#FFFFFF' }}>
              Academic Scholar Profile
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, alignSelf: { xs: 'flex-start', sm: 'center' } }}>
            {!editMode ? (
              <Button
                variant="contained"
                onClick={() => setEditMode(true)}
                startIcon={<i className="bi bi-pencil-square" />}
                sx={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  borderRadius: 1.5,
                  px: 2.5,
                  py: 0.8,
                  '&:hover': {
                    background: '#FFFFFF',
                    color: '#123B32',
                    borderColor: '#FFFFFF',
                  },
                }}
              >
                Edit Profile
              </Button>
            ) : (
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="outlined"
                  onClick={handleCancelClick}
                  disabled={saving}
                  sx={{
                    borderRadius: 1.5,
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    borderColor: 'rgba(255, 255, 255, 0.6)',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#FFFFFF',
                    px: 2,
                    '&:hover': {
                      borderColor: '#FFFFFF',
                      backgroundColor: 'rgba(255, 255, 255, 0.28)',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSaveProfile}
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <i className="bi bi-check-lg" />}
                  sx={{
                    background: '#16A34A',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    borderRadius: 1.5,
                    px: 2.5,
                    boxShadow: '0 4px 12px rgba(22, 163, 74, 0.35)',
                    '&.Mui-disabled': {
                      background: '#16A34A',
                      color: '#FFFFFF',
                      opacity: 0.85,
                    },
                    '&:hover': { background: '#15803D' },
                  }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Stack>
            )}
          </Box>
        </Box>

        {/* Profile Identity Bar */}
        <CardContent sx={{ px: { xs: 2.5, sm: 4 }, py: 3, backgroundColor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 3 }}>
            {/* Avatar */}
            <Avatar
              sx={{
                width: 76,
                height: 76,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #123B32 0%, #2F5B4E 100%)',
                fontSize: '2rem',
                fontWeight: 800,
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(18, 59, 50, 0.22)',
                border: '3px solid #E8EFEB',
                flexShrink: 0,
              }}
            >
              {profile?.first_name?.charAt(0) || 'U'}
            </Avatar>

            {/* Scholar Metadata */}
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#123B32', letterSpacing: '-0.01em' }}>
                  {profile?.first_name} {profile?.last_name}
                </Typography>
                <Chip
                  label={roleStyle.label}
                  size="small"
                  sx={{
                    backgroundColor: roleStyle.bg,
                    color: roleStyle.color,
                    border: `1px solid ${roleStyle.border}`,
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    borderRadius: 1,
                    height: 24,
                  }}
                  icon={<i className={`bi ${roleStyle.icon}`} style={{ color: roleStyle.color, marginLeft: 6, fontSize: '0.8rem' }} />}
                />
              </Box>

              <Typography variant="body2" sx={{ color: '#334E43', fontWeight: 600, mt: 0.5 }}>
                {profile?.designation || 'Scholar / Researcher'}
                {profile?.institution ? ` • ${profile.institution}` : ''}
                {profile?.country ? ` (${profile.country})` : ''}
              </Typography>

              {/* Verified ORCID Badge & Email */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1.5, flexWrap: 'wrap' }}>
                {profile?.orcid_id ? (
                  <Box
                    component="a"
                    href={`https://orcid.org/${profile.orcid_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.25,
                      py: 0.4,
                      borderRadius: '6px',
                      backgroundColor: '#F0FDF4',
                      color: '#15803D',
                      border: '1px solid #86EFAC',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textDecoration: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease-in-out',
                      '&:hover': { backgroundColor: '#DCFCE7' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: '#A6CE39',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '0.65rem',
                        flexShrink: 0,
                      }}
                    >
                      iD
                    </Box>
                    <span>Verified ORCID: {profile.orcid_id}</span>
                  </Box>
                ) : (
                  <Box
                    onClick={handleConnectOrcid}
                    role="button"
                    tabIndex={0}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.75,
                      px: 1.25,
                      py: 0.4,
                      borderRadius: '6px',
                      backgroundColor: '#E8EFEB',
                      color: '#123B32',
                      border: '1px solid #527A68',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease-in-out',
                      '&:hover': { backgroundColor: '#D3DDD7' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: '#A6CE39',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        fontSize: '0.65rem',
                        flexShrink: 0,
                      }}
                    >
                      iD
                    </Box>
                    <span>{connectingOrcid ? 'Connecting to ORCID...' : 'Connect ORCID iD (Recommended)'}</span>
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.75,
                    px: 1.25,
                    py: 0.4,
                    borderRadius: '6px',
                    backgroundColor: '#F5F3EC',
                    color: '#334E43',
                    border: '1px solid #D3DDD7',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                >
                  <i className="bi bi-envelope-check" style={{ color: '#123B32' }} />
                  <span>{profile?.email || 'No email registered'}</span>
                </Box>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Grid: Details, Keywords, & Review Settings */}
      <Grid container spacing={3}>
        {/* Left Column: Academic Profile & Keywords */}
        <Grid item xs={12} md={8}>
          {/* Personal Details Card */}
          <Card
            sx={{
              borderRadius: 2.5,
              border: '1px solid #D3DDD7',
              boxShadow: '0 4px 16px rgba(18, 59, 50, 0.04)',
              backgroundColor: '#FFFFFF',
              mb: 3,
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    backgroundColor: '#E8EFEB',
                    color: '#123B32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                  }}
                >
                  <i className="bi bi-person-lines-fill" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#123B32', lineHeight: 1.2 }}>
                    Personal & Academic Details
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Your institutional affiliation, academic role, and contact information
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    InputProps={{ readOnly: !editMode }}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiInputBase-input': { color: '#123B32', fontWeight: 600 },
                      '& .MuiOutlinedInput-root': { backgroundColor: editMode ? '#FFFFFF' : '#FAFCFB' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    InputProps={{ readOnly: !editMode }}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiInputBase-input': { color: '#123B32', fontWeight: 600 },
                      '& .MuiOutlinedInput-root': { backgroundColor: editMode ? '#FFFFFF' : '#FAFCFB' },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Registered Email Address"
                    value={profile?.email || ''}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    size="small"
                    helperText="Primary email is locked for security"
                    sx={{
                      '& .MuiInputBase-input': { color: '#123B32', fontWeight: 600 },
                      '& .MuiOutlinedInput-root': { backgroundColor: '#FAFCFB' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country / Region"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    InputProps={{ readOnly: !editMode }}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiInputBase-input': { color: '#123B32', fontWeight: 600 },
                      '& .MuiOutlinedInput-root': { backgroundColor: editMode ? '#FFFFFF' : '#FAFCFB' },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Affiliated Institution / University"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    InputProps={{ readOnly: !editMode }}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiInputBase-input': { color: '#123B32', fontWeight: 600 },
                      '& .MuiOutlinedInput-root': { backgroundColor: editMode ? '#FFFFFF' : '#FAFCFB' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department / Faculty"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    InputProps={{ readOnly: !editMode }}
                    variant="outlined"
                    size="small"
                    sx={{
                      '& .MuiInputBase-input': { color: '#123B32', fontWeight: 600 },
                      '& .MuiOutlinedInput-root': { backgroundColor: editMode ? '#FFFFFF' : '#FAFCFB' },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Academic Designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    InputProps={{ readOnly: !editMode }}
                    variant="outlined"
                    size="small"
                    placeholder="e.g. Professor, Assistant Professor, Researcher"
                    sx={{
                      '& .MuiInputBase-input': { color: '#123B32', fontWeight: 600 },
                      '& .MuiOutlinedInput-root': { backgroundColor: editMode ? '#FFFFFF' : '#FAFCFB' },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Highest Qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    InputProps={{ readOnly: !editMode }}
                    variant="outlined"
                    size="small"
                    placeholder="e.g. Ph.D., Doctorate, M.Tech, M.S."
                    sx={{
                      '& .MuiInputBase-input': { color: '#123B32', fontWeight: 600 },
                      '& .MuiOutlinedInput-root': { backgroundColor: editMode ? '#FFFFFF' : '#FAFCFB' },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Primary Research Domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    InputProps={{ readOnly: !editMode }}
                    variant="outlined"
                    size="small"
                    placeholder="e.g. Computer Science, Artificial Intelligence, Mechanical Engineering"
                    sx={{
                      '& .MuiInputBase-input': { color: '#123B32', fontWeight: 600 },
                      '& .MuiOutlinedInput-root': { backgroundColor: editMode ? '#FFFFFF' : '#FAFCFB' },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Academic Biography / Scholar Statement"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    InputProps={{ readOnly: !editMode }}
                    variant="outlined"
                    placeholder="Brief description of research background, expertise, teaching, and publications..."
                    sx={{
                      '& .MuiInputBase-input': { color: '#123B32', fontWeight: 600, lineHeight: 1.6 },
                      '& .MuiOutlinedInput-root': { backgroundColor: editMode ? '#FFFFFF' : '#FAFCFB' },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Research Areas & Keywords Card */}
          <Card
            sx={{
              borderRadius: 2.5,
              border: '1px solid #D3DDD7',
              boxShadow: '0 4px 16px rgba(18, 59, 50, 0.04)',
              backgroundColor: '#FFFFFF',
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    backgroundColor: '#E8EFEB',
                    color: '#123B32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                  }}
                >
                  <i className="bi bi-tags-fill" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#123B32', lineHeight: 1.2 }}>
                    Research Expertise & Keywords
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Topics used by the AI Paper Matcher and Chairs for reviewer assignment
                  </Typography>
                </Box>
              </Box>

              {editMode && (
                <Box sx={{ display: 'flex', gap: 1.5, mb: 2.5, mt: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a research keyword and press Enter (e.g. Machine Learning, Cloud Security)..."
                    name="newInterest"
                    value={formData.newInterest}
                    onChange={handleInputChange}
                    onKeyDown={handleAddInterest}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddInterest}
                    sx={{
                      background: '#123B32',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      textTransform: 'none',
                      px: 3,
                      '&:hover': { background: '#0B241E' },
                    }}
                  >
                    Add
                  </Button>
                </Box>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.areasOfInterest?.length > 0 ? (
                  formData.areasOfInterest.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={editMode ? () => handleRemoveInterest(tag) : undefined}
                      sx={{
                        backgroundColor: '#E8EFEB',
                        color: '#123B32',
                        fontWeight: 700,
                        border: '1px solid #527A68',
                        borderRadius: 1.5,
                        py: 0.5,
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', py: 1 }}>
                    No research keywords added yet. Click 'Edit Profile' to add your expertise keywords.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column: Identifiers & Reviewer Settings */}
        <Grid item xs={12} md={4}>
          {/* ORCID Integration Card */}
          <Card
            sx={{
              borderRadius: 2.5,
              border: '1px solid #D3DDD7',
              boxShadow: '0 4px 16px rgba(18, 59, 50, 0.04)',
              backgroundColor: '#FFFFFF',
              mb: 3,
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    backgroundColor: '#A6CE39',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 8px rgba(166, 206, 57, 0.35)',
                  }}
                >
                  iD
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#123B32' }}>
                  ORCID Integration
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="ORCID iD"
                name="orcidId"
                value={formData.orcidId}
                onChange={handleInputChange}
                InputProps={{
                  readOnly: !editMode,
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="bi bi-shield-check" style={{ color: '#123B32', fontSize: '1.1rem' }} />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
                placeholder="0000-0002-1825-0097"
                sx={{
                  mb: 2,
                  '& .MuiInputBase-input': { color: '#123B32', fontWeight: 600 },
                  '& .MuiOutlinedInput-root': { backgroundColor: editMode ? '#FFFFFF' : '#FAFCFB' },
                }}
              />

              {formData.orcidId ? (
                <Stack spacing={1.5}>
                  <Button
                    fullWidth
                    variant="outlined"
                    component="a"
                    href={`https://orcid.org/${formData.orcidId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<i className="bi bi-box-arrow-up-right" />}
                    sx={{
                      borderColor: '#527A68',
                      color: '#123B32',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 1.5,
                      py: 0.9,
                      '&:hover': {
                        borderColor: '#123B32',
                        backgroundColor: '#E8EFEB',
                      },
                    }}
                  >
                    View Public ORCID Record
                  </Button>

                  {editMode && (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSyncOrcid}
                      disabled={syncingOrcid}
                      startIcon={syncingOrcid ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : <i className="bi bi-cloud-arrow-down" />}
                      sx={{
                        background: '#123B32',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        textTransform: 'none',
                        borderRadius: 1.5,
                        py: 0.9,
                        '&:hover': { background: '#0B241E' },
                      }}
                    >
                      {syncingOrcid ? 'Syncing...' : 'Sync Data from ORCID'}
                    </Button>
                  )}
                </Stack>
              ) : (
                /* Unlinked ORCID Recommendation Box */
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    backgroundColor: '#E8EFEB',
                    border: '1.5px dashed #527A68',
                    textAlign: 'center',
                    mt: 1,
                  }}
                >
                  <Chip
                    label="RECOMMENDED FOR BETTER SCHOLAR IDENTIFICATION"
                    size="small"
                    sx={{
                      backgroundColor: '#123B32',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.65rem',
                      letterSpacing: '0.04em',
                      mb: 1.25,
                      borderRadius: 1,
                      height: 22,
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#123B32', mb: 0.5 }}>
                    Connect or Register with ORCID iD
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#334E43', display: 'block', mb: 2, lineHeight: 1.5 }}>
                    Please register or link your verified 16-digit ORCID iD. This ensures accurate reviewer assignment, publication tracking, and eliminates conflicts of interest.
                  </Typography>

                  <Stack spacing={1.25}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleConnectOrcid}
                      disabled={connectingOrcid}
                      startIcon={
                        connectingOrcid ? (
                          <CircularProgress size={16} sx={{ color: '#FFFFFF' }} />
                        ) : (
                          <Box
                            sx={{
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              backgroundColor: '#A6CE39',
                              color: '#FFFFFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: '0.65rem',
                            }}
                          >
                            iD
                          </Box>
                        )
                      }
                      sx={{
                        background: 'linear-gradient(135deg, #123B32 0%, #2F5B4E 100%)',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        textTransform: 'none',
                        borderRadius: 1.5,
                        py: 1,
                        boxShadow: '0 2px 8px rgba(18, 59, 50, 0.2)',
                        '&.Mui-disabled': {
                          background: '#123B32',
                          color: '#FFFFFF',
                          opacity: 0.85,
                        },
                        '&:hover': { background: '#0B241E' },
                      }}
                    >
                      {connectingOrcid ? 'Connecting to ORCID...' : 'Connect ORCID iD (Recommended)'}
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      component="a"
                      href="https://orcid.org/register"
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<i className="bi bi-box-arrow-up-right" />}
                      sx={{
                        borderColor: '#527A68',
                        color: '#123B32',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        textTransform: 'none',
                        borderRadius: 1.5,
                        py: 0.8,
                        '&:hover': {
                          borderColor: '#123B32',
                          backgroundColor: '#FFFFFF',
                        },
                      }}
                    >
                      Don't have an ORCID? Register at orcid.org
                    </Button>
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Academic Links & Reviewer Capacity */}
          <Card
            sx={{
              borderRadius: 2.5,
              border: '1px solid #D3DDD7',
              boxShadow: '0 4px 16px rgba(18, 59, 50, 0.04)',
              backgroundColor: '#FFFFFF',
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    backgroundColor: '#E8EFEB',
                    color: '#123B32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                  }}
                >
                  <i className="bi bi-sliders" />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#123B32' }}>
                  Review Capacity & Links
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Google Scholar Profile URL"
                name="googleScholarUrl"
                value={formData.googleScholarUrl}
                onChange={handleInputChange}
                InputProps={{
                  readOnly: !editMode,
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="bi bi-mortarboard" style={{ color: '#123B32' }} />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                size="small"
                placeholder="https://scholar.google.com/citations?user=..."
                sx={{
                  mb: 2.5,
                  '& .MuiInputBase-input': { color: '#123B32', fontWeight: 600 },
                  '& .MuiOutlinedInput-root': { backgroundColor: editMode ? '#FFFFFF' : '#FAFCFB' },
                }}
              />

              <TextField
                fullWidth
                label="Max Review Paper Limit"
                name="maxReviewLimit"
                type="number"
                value={formData.maxReviewLimit}
                onChange={handleInputChange}
                InputProps={{ readOnly: !editMode }}
                variant="outlined"
                size="small"
                inputProps={{ min: 1, max: 20 }}
                helperText="Maximum number of submissions you can review per conference"
                sx={{
                  '& .MuiInputBase-input': { color: '#123B32', fontWeight: 600 },
                  '& .MuiOutlinedInput-root': { backgroundColor: editMode ? '#FFFFFF' : '#FAFCFB' },
                }}
              />

              <Divider sx={{ my: 2.5, borderColor: '#D3DDD7' }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#334E43' }}>
                <i className="bi bi-calendar-event" style={{ fontSize: '1.1rem', color: '#123B32' }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Account active since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notification Toast */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={notification.severity} sx={{ borderRadius: 1.5, fontWeight: 600 }}>
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Discard Unsaved Changes Modal */}
      <ConfirmModal
        open={showCancelEditConfirm}
        title="Discard Unsaved Changes?"
        message="You have unsaved changes in your scholar profile. If you discard now, any newly typed information will be lost."
        confirmText="Yes, Discard Changes"
        cancelText="Keep Editing"
        severity="warning"
        onConfirm={handleConfirmDiscard}
        onCancel={() => setShowCancelEditConfirm(false)}
      />
    </Box>
  );
}
