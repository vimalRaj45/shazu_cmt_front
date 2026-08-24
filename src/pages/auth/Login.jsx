import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Divider,
  CircularProgress,
  InputAdornment,
} from '@mui/material';

// Official MUI Icons
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import BadgeIcon from '@mui/icons-material/Badge';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orcidLoading, setOrcidLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please verify your email/ORCID and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrcidOAuthLogin = async () => {
    setOrcidLoading(true);
    try {
      const redirectUri = `${window.location.origin}/auth/orcid/callback`;
      const res = await api.get(`/auth/orcid/url?redirectUri=${encodeURIComponent(redirectUri)}`);
      window.location.href = res.data.authUrl;
    } catch (err) {
      setError('Failed to initiate ORCID login. Please use standard login or check credentials.');
      setOrcidLoading(false);
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
        backgroundImage: 'radial-gradient(at 0% 0%, rgba(21, 101, 192, 0.08) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(2, 136, 209, 0.06) 0, transparent 50%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          borderRadius: 1.5,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
        }}
      >
        {/* Card Header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 60%, #1976D2 100%)',
            p: 4,
            textAlign: 'center',
            color: '#FFFFFF',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              p: 1.25,
              borderRadius: 1.5,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(8px)',
              mb: 1.5,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            }}
          >
            <SchoolIcon sx={{ fontSize: 32, color: '#FFFFFF' }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.01em', color: '#FFFFFF' }}>
            Shazu Soft CMT
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5, color: '#E3F2FD' }}>
            Academic Conference Management Portal
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 4.5 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
              {error}
            </Alert>
          )}

          {/* ORCID OAuth Button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={handleOrcidOAuthLogin}
            disabled={orcidLoading || loading}
            startIcon={
              orcidLoading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 1,
                    backgroundColor: '#A6CE39',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '0.7rem',
                  }}
                >
                  iD
                </Box>
              )
            }
            sx={{
              mb: 3,
              py: 1.2,
              borderColor: '#86EFAC',
              backgroundColor: '#F0FDF4',
              color: '#166534',
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.925rem',
              borderRadius: 1,
              '&:hover': {
                borderColor: '#4ADE80',
                backgroundColor: '#DCFCE7',
              },
            }}
          >
            {orcidLoading ? 'Connecting to ORCID...' : 'Sign In with ORCID iD'}
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', my: 2.5 }}>
            <Divider sx={{ flexGrow: 1 }} />
            <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.05em' }}>
              OR SIGN IN WITH CREDENTIALS
            </Typography>
            <Divider sx={{ flexGrow: 1 }} />
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address or ORCID iD"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="academic.email@univ.edu or 0000-0002-1825-0097"
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon sx={{ color: '#1565C0', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              helperText="Enter your registered email or 16-digit ORCID identifier"
            />

            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#1565C0', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || orcidLoading}
              startIcon={!loading && <LoginIcon />}
              sx={{
                py: 1.4,
                fontSize: '0.95rem',
                fontWeight: 800,
                borderRadius: 1,
                background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                boxShadow: '0 4px 14px rgba(21, 101, 192, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0D47A1 0%, #0A3880 100%)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In to CMT Portal'}
            </Button>
          </Box>

          <Divider sx={{ my: 3.5 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#1565C0', fontWeight: 800, textDecoration: 'none' }}>
                Create CMT Account
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
