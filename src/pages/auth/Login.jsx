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
import TurnstileWidget from '../../components/common/TurnstileWidget';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orcidLoading, setOrcidLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('[Login] Attempting sign-in for identifier:', email);
    try {
      const user = await login(email, password, turnstileToken);
      console.log('[Login] Sign-in successful for user:', user);
      navigate('/dashboard');
    } catch (err) {
      console.error('[Login] Sign-in error:', err);
      setError(err.response?.data?.error || 'Invalid credentials. Please verify your email/ORCID and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrcidOAuthLogin = async () => {
    setOrcidLoading(true);
    setError('');
    try {
      const redirectUri = `${window.location.origin}/auth/orcid/callback`;
      console.log('[ORCID OAuth] Initiating login with redirectUri:', redirectUri);
      
      let targetUrl = '';
      try {
        const res = await api.get(`/auth/orcid/url?redirectUri=${encodeURIComponent(redirectUri)}`);
        console.log('[ORCID OAuth] Received auth URL response from backend:', res.data);
        if (res.data?.authUrl && typeof res.data.authUrl === 'string' && res.data.authUrl.startsWith('http')) {
          targetUrl = res.data.authUrl;
        }
      } catch (apiErr) {
        console.warn('[ORCID OAuth] Backend endpoint error, generating direct authorization URL:', apiErr.message);
      }

      // If backend URL generation failed or returned non-JSON, construct direct ORCID OAuth URL
      if (!targetUrl) {
        const clientId = 'APP-NZ8CPXKBRG5YOW1S';
        targetUrl = `https://orcid.org/oauth/authorize?client_id=${encodeURIComponent(clientId)}&response_type=code&scope=/authenticate&redirect_uri=${encodeURIComponent(redirectUri)}`;
        console.log('[ORCID OAuth] Constructed direct ORCID URL:', targetUrl);
      }

      console.log('[ORCID OAuth] Navigating to ORCID:', targetUrl);
      window.location.href = targetUrl;
    } catch (err) {
      console.error('[ORCID OAuth] Error initiating ORCID login:', err);
      setError('Failed to initiate ORCID login: ' + (err.response?.data?.error || err.message));
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
            background: 'linear-gradient(135deg, #123B32 0%, #1D4C40 50%, #2F5B4E 100%)',
            p: { xs: 3, sm: 3.5 },
            textAlign: 'center',
            color: '#FFFFFF',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: 1.25,
              borderRadius: 3,
              backgroundColor: '#FFFFFF',
              mb: 2,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
            }}
          >
            <Box
              component="img"
              src="/logo.png"
              alt="Shazu Soft Logo"
              sx={{
                height: 72,
                width: 72,
                maxHeight: 72,
                maxWidth: 72,
                objectFit: 'contain',
              }}
            />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.01em', color: '#FFFFFF' }}>
            Shazu Soft CJMS
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.92, mt: 0.5, color: 'rgba(255, 255, 255, 0.9)' }}>
            Academic Conference & Journal Management Portal
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

            {/* Cloudflare Turnstile Verification */}
            <TurnstileWidget
              action="login"
              onVerify={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken('')}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || orcidLoading}
              startIcon={loading ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : <LoginIcon />}
              sx={{
                py: 1.4,
                fontSize: '0.95rem',
                fontWeight: 800,
                borderRadius: 1.5,
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                boxShadow: '0 4px 14px rgba(21, 101, 192, 0.25)',
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
              {loading ? 'Signing In...' : 'Sign In to CJMS Portal'}
            </Button>
          </Box>

          <Divider sx={{ my: 3.5 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#1565C0', fontWeight: 800, textDecoration: 'none' }}>
                Create CJMS Account
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
