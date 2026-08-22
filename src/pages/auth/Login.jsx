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
  Grid,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const ROLE_PRESETS = [
  { role: 'Administrator', email: 'admin@shazusoft.com', pass: 'password123', icon: 'bi-shield-lock' },
  { role: 'Peer Reviewer', email: 'reviewer1@shazusoft.com', pass: 'password123', icon: 'bi-journal-check' },
  { role: 'Paper Author', email: 'author@shazusoft.com', pass: 'password123', icon: 'bi-file-earmark-text' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (preset) => {
    setEmail(preset.email);
    setPassword(preset.pass);
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
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          borderRadius: 3,
          backgroundColor: '#FFFFFF',
          boxShadow: '0 20px 40px -15px rgba(15, 41, 66, 0.12)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
        }}
      >
        {/* Card Header (Deep Royal Blue) */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 100%)',
            p: 3.5,
            textAlign: 'center',
            color: '#FFFFFF',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              p: 1.5,
              borderRadius: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              mb: 1.5,
            }}
          >
            <i className="bi bi-mortarboard-fill" style={{ fontSize: '2rem' }}></i>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.01em', color: '#FFFFFF' }}>
            Shazu Soft CMT
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5, color: '#E3F2FD' }}>
            Internal Conference Management System
          </Typography>
        </Box>

        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Account Email Address"
              variant="outlined"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. yourname@shazusoft.com"
              sx={{ mb: 2.5 }}
              InputProps={{
                startAdornment: <i className="bi bi-envelope" style={{ marginRight: 8, color: '#1565C0' }}></i>,
              }}
            />

            <TextField
              fullWidth
              label="Password"
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: <i className="bi bi-lock" style={{ marginRight: 8, color: '#1565C0' }}></i>,
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.4,
                fontSize: '0.95rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In to CMT'}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Quick Institutional Role Fillers */}
          <Accordion elevation={0} sx={{ border: '1px solid #E2E8F0', borderRadius: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<i className="bi bi-chevron-down text-muted"></i>}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#1565C0' }}>
                <i className="bi bi-key" style={{ marginRight: 6 }}></i> PRE-CONFIGURED INSTITUTIONAL ACCOUNTS
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Grid container spacing={1}>
                {ROLE_PRESETS.map((preset) => (
                  <Grid item xs={6} key={preset.role}>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      onClick={() => handleQuickFill(preset)}
                      sx={{
                        py: 0.75,
                        fontSize: '0.725rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.25,
                        borderColor: '#E2E8F0',
                        color: '#0F2942',
                        '&:hover': { borderColor: '#1565C0', backgroundColor: '#F0F7FF' },
                      }}
                    >
                      <i className={`bi ${preset.icon}`} style={{ fontSize: '1rem', color: '#1565C0' }}></i>
                      <span>{preset.role}</span>
                    </Button>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Need a new conference account?{' '}
              <Link to="/register" style={{ color: '#1565C0', fontWeight: 700, textDecoration: 'none' }}>
                Register here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
