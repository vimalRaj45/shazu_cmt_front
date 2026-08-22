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
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    institution: '',
    department: '',
    country: 'India',
    role: 'author',
    expertiseInput: '',
    expertiseKeywords: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddKeyword = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && formData.expertiseInput.trim()) {
      e.preventDefault();
      const kw = formData.expertiseInput.trim().replace(/,$/, '');
      if (!formData.expertiseKeywords.includes(kw)) {
        setFormData({
          ...formData,
          expertiseKeywords: [...formData.expertiseKeywords, kw],
          expertiseInput: '',
        });
      }
    }
  };

  const handleRemoveKeyword = (kwToRemove) => {
    setFormData({
      ...formData,
      expertiseKeywords: formData.expertiseKeywords.filter((k) => k !== kwToRemove),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
        expertise: formData.expertiseKeywords,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check form details.');
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
        backgroundColor: '#F4F7FB',
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(21, 101, 192, 0.08) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(2, 136, 209, 0.06) 0, transparent 50%)',
        py: { xs: 3, sm: 5 },
        px: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 660,
          width: '100%',
          borderRadius: 3,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 20px 40px -15px rgba(15, 41, 66, 0.12)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
        }}
      >
        {/* Card Header (Royal Blue Gradient) */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
            p: 3.5,
            color: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              p: 1.25,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              mb: 1,
            }}
          >
            <i className="bi bi-person-plus-fill" style={{ fontSize: '1.75rem', color: '#FFFFFF' }}></i>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
            Create CMT Account
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, color: '#E3F2FD', mt: 0.5 }}>
            Join the Shazu Soft Technologies Conference Portal
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
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
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Institution / Company"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="e.g. Shazu Soft Technologies"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g. Research & Development"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
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
                  helperText="Default access role for this portal"
                >
                  <MenuItem value="author">Author (Submit & Track Papers)</MenuItem>
                  <MenuItem value="reviewer">Reviewer (Peer Reviewer)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Research Expertise Keywords"
                  name="expertiseInput"
                  value={formData.expertiseInput}
                  onChange={handleChange}
                  onKeyDown={handleAddKeyword}
                  placeholder="Type a keyword and press Enter (e.g. Artificial Intelligence, Cloud Systems)..."
                  helperText="Press Enter or comma to add each research topic tag"
                />
                {formData.expertiseKeywords.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                    {formData.expertiseKeywords.map((kw, idx) => (
                      <Chip
                        key={idx}
                        label={kw}
                        onDelete={() => handleRemoveKeyword(kw)}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>

            <Box sx={{ mt: 3.5 }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.35,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Complete Registration'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link to="/login" style={{ color: '#1565C0', fontWeight: 700, textDecoration: 'none' }}>
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
