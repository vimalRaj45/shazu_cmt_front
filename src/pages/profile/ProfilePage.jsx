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
  IconButton,
  Paper,
  InputAdornment,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ROLE_BADGES = {
  admin: { label: 'Administrator', bg: '#EFF6FF', color: '#1565C0', border: '#BFDBFE', icon: 'bi-shield-lock-fill' },
  reviewer: { label: 'Peer Reviewer', bg: '#F0F9FF', color: '#0284C7', border: '#BAE6FD', icon: 'bi-journal-check' },
  author: { label: 'Author', bg: '#F0FDF4', color: '#15803D', border: '#BBF7D0', icon: 'bi-file-earmark-text' },
};

export default function ProfilePage() {
  const { user: authUser, setUser: setAuthUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncingOrcid, setSyncingOrcid] = useState(false);
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
      // Fallback to context user
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
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)',
          mb: 3,
        }}
      >
        {/* Cover Header */}
        <Box
          sx={{
            height: 120,
            background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #0288D1 100%)',
            position: 'relative',
          }}
        />

        {/* Profile Info Header */}
        <CardContent sx={{ p: { xs: 2.5, sm: 3 }, position: 'relative', mt: -6 }}>
          <Grid container spacing={2} alignItems="flex-end" justifyContent="space-between">
            <Grid item xs={12} sm="auto" sx={{ display: 'flex', alignItems: 'flex-end', gap: 2.5 }}>
              <Avatar
                sx={{
                  width: { xs: 80, sm: 100 },
                  height: { xs: 80, sm: 100 },
                  borderRadius: 3,
                  border: '4px solid #FFFFFF',
                  background: 'linear-gradient(135deg, #1565C0 0%, #0288D1 100%)',
                  fontSize: { xs: '2rem', sm: '2.5rem' },
                  fontWeight: 800,
                  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
                  color: '#FFFFFF',
                }}
              >
                {profile?.first_name?.charAt(0) || 'U'}
              </Avatar>

              <Box sx={{ mb: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F2942' }}>
                  {profile?.first_name} {profile?.last_name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {profile?.designation || 'Academic Scholar'} • {profile?.institution || 'Institution'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={roleStyle.label}
                    size="small"
                    sx={{
                      backgroundColor: roleStyle.bg,
                      color: roleStyle.color,
                      border: `1px solid ${roleStyle.border}`,
                      fontWeight: 800,
                      borderRadius: 1,
                    }}
                    icon={<i className={`bi ${roleStyle.icon}`} style={{ color: roleStyle.color, marginLeft: 6 }} />}
                  />

                  {profile?.orcid_id && (
                    <Chip
                      component="a"
                      href={`https://orcid.org/${profile.orcid_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      clickable
                      label={`ORCID: ${profile.orcid_id}`}
                      size="small"
                      sx={{
                        backgroundColor: '#F0FDF4',
                        color: '#166534',
                        border: '1px solid #86EFAC',
                        fontWeight: 700,
                        borderRadius: 1,
                      }}
                      icon={
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
                            ml: 0.5,
                          }}
                        >
                          iD
                        </Box>
                      }
                    />
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm="auto">
              {!editMode ? (
                <Button
                  variant="contained"
                  onClick={() => setEditMode(true)}
                  startIcon={<i className="bi bi-pencil-square" />}
                  sx={{
                    background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                    fontWeight: 700,
                    borderRadius: 1.5,
                    px: 2.5,
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditMode(false);
                      fetchUserProfile();
                    }}
                    disabled={saving}
                    sx={{ borderRadius: 1.5, fontWeight: 700, borderColor: '#CBD5E1', color: '#475569' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <i className="bi bi-check-lg" />}
                    sx={{
                      background: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      px: 2.5,
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Stack>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Form & Information Grid */}
      <Grid container spacing={3}>
        {/* Left Column: Academic Profile */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: 2,
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)',
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <i className="bi bi-person-lines-fill" style={{ fontSize: '1.25rem', color: '#1565C0' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F2942' }}>
                  Personal & Academic Details
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Registered Email Address"
                    value={profile?.email || ''}
                    disabled
                    variant="outlined"
                    size="small"
                    helperText="Primary email cannot be modified"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Country / Region"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Affiliated Institution / University"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Department / Faculty"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant="outlined"
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Academic Designation"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant="outlined"
                    size="small"
                    placeholder="e.g. Professor, Assistant Professor, Researcher"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Highest Qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant="outlined"
                    size="small"
                    placeholder="e.g. Ph.D., Doctorate, M.Tech, M.S."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Primary Research Domain"
                    name="domain"
                    value={formData.domain}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    variant="outlined"
                    size="small"
                    placeholder="e.g. Computer Science, Artificial Intelligence, Cybersecurity"
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
                    disabled={!editMode}
                    variant="outlined"
                    placeholder="Brief description of your research background, teaching areas, and interests..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Research Areas & Keywords Card */}
          <Card
            sx={{
              borderRadius: 2,
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <i className="bi bi-tags-fill" style={{ fontSize: '1.25rem', color: '#1565C0' }} />
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F2942' }}>
                  Research Expertise & Keywords
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These keywords are used by the AI Paper Matcher and Chairs for reviewer assignment and matching relevant papers.
              </Typography>

              {editMode && (
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Add a research topic (e.g. Deep Learning, IoT)..."
                    name="newInterest"
                    value={formData.newInterest}
                    onChange={handleInputChange}
                    onKeyDown={handleAddInterest}
                    sx={{ flexGrow: 1 }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleAddInterest}
                    sx={{
                      background: '#1565C0',
                      fontWeight: 700,
                      borderRadius: 1,
                      textTransform: 'none',
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
                        backgroundColor: '#EFF6FF',
                        color: '#1565C0',
                        fontWeight: 700,
                        border: '1px solid #BFDBFE',
                        borderRadius: 1,
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No research keywords added yet.
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
              borderRadius: 2,
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)',
              mb: 3,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 0.75,
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
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F2942' }}>
                  ORCID Integration
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="ORCID iD"
                name="orcidId"
                value={formData.orcidId}
                onChange={handleInputChange}
                disabled={!editMode}
                variant="outlined"
                size="small"
                placeholder="0000-0002-1825-0097"
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="bi bi-shield-check" style={{ color: '#166534' }} />
                    </InputAdornment>
                  ),
                }}
              />

              {formData.orcidId && (
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
                      borderColor: '#A6CE39',
                      color: '#166534',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 1,
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
                      startIcon={syncingOrcid ? <CircularProgress size={16} color="inherit" /> : <i className="bi bi-cloud-arrow-down" />}
                      sx={{
                        background: '#A6CE39',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        textTransform: 'none',
                        borderRadius: 1,
                        '&:hover': { background: '#8eb32c' },
                      }}
                    >
                      {syncingOrcid ? 'Syncing...' : 'Sync Data from ORCID'}
                    </Button>
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Academic Links & Reviewer Capacity */}
          <Card
            sx={{
              borderRadius: 2,
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 12px rgba(15, 23, 42, 0.04)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <i className="bi bi-sliders" style={{ fontSize: '1.25rem', color: '#1565C0' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F2942' }}>
                  Review Capacity & Links
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Google Scholar Profile URL"
                name="googleScholarUrl"
                value={formData.googleScholarUrl}
                onChange={handleInputChange}
                disabled={!editMode}
                variant="outlined"
                size="small"
                placeholder="https://scholar.google.com/citations?user=..."
                sx={{ mb: 2.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="bi bi-mortarboard" style={{ color: '#1565C0' }} />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Max Review Paper Limit"
                name="maxReviewLimit"
                type="number"
                value={formData.maxReviewLimit}
                onChange={handleInputChange}
                disabled={!editMode}
                variant="outlined"
                size="small"
                inputProps={{ min: 1, max: 20 }}
                helperText="Maximum number of submissions you can review per conference"
              />

              <Divider sx={{ my: 2.5 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#64748B' }}>
                <i className="bi bi-calendar-event" style={{ fontSize: '1.1rem' }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Account created on {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
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
    </Box>
  );
}
