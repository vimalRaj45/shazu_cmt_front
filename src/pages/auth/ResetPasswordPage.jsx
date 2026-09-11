import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Request Reset Mode (Email input)
  const [email, setEmail] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');

  // Set New Password Mode (Token present)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  // Handle Request Reset Link submission
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (!email) return;
    setRequestError('');
    setRequestLoading(true);

    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setRequestSuccess(true);
    } catch (err) {
      setRequestError(err.response?.data?.error || 'Failed to send password reset link. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  // Handle Setting New Password with Token
  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    setResetError('');

    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match. Please verify.');
      return;
    }

    setResetLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword,
      });
      setResetSuccess(true);
      setTimeout(() => {
        navigate('/login?reset=success');
      }, 2500);
    } catch (err) {
      setResetError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setResetLoading(false);
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
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 440,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
          border: '1px solid #E2E8F0',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Header Brand */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 1.5,
              }}
            >
              <LockIcon sx={{ color: '#1565C0', fontSize: 28 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F2942' }}>
              {token ? 'Set New Password' : 'Reset Password'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {token
                ? 'Create a strong, new password for your CJMS account'
                : 'Enter your registered email address and we will send you instructions to reset your password.'}
            </Typography>
          </Box>

          {/* MODE 1: Token Present -> Set New Password */}
          {token ? (
            resetSuccess ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 60, color: '#10B981', mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F2942', mb: 1 }}>
                  Password Reset Complete!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Your password has been securely updated. Redirecting you to the sign-in portal...
                </Typography>
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  fullWidth
                  sx={{
                    py: 1.2,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                  }}
                >
                  Sign In Now
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSetNewPassword}>
                {resetError && (
                  <Alert severity="error" sx={{ mb: 2.5 }}>
                    {resetError}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="At least 6 characters"
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon sx={{ color: '#1565C0', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Confirm New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter your new password"
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
                  disabled={resetLoading}
                  startIcon={resetLoading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
                  sx={{
                    py: 1.3,
                    fontWeight: 800,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                    color: '#FFFFFF',
                  }}
                >
                  {resetLoading ? 'Updating Password...' : 'Save & Reset Password'}
                </Button>
              </Box>
            )
          ) : (
            /* MODE 2: No Token -> Request Reset Email */
            requestSuccess ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <CheckCircleIcon sx={{ fontSize: 56, color: '#10B981', mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F2942', mb: 1 }}>
                  Check Your Inbox
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  If an account exists for <strong>{email}</strong>, a password reset link has been dispatched. Please check your email and spam folder.
                </Typography>
                <Button
                  component={Link}
                  to="/login"
                  variant="outlined"
                  fullWidth
                  startIcon={<ArrowBackIcon />}
                  sx={{ py: 1.2, fontWeight: 700 }}
                >
                  Back to Sign In
                </Button>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleRequestReset}>
                {requestError && (
                  <Alert severity="error" sx={{ mb: 2.5 }}>
                    {requestError}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Registered Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="e.g. reviewer@university.edu"
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#1565C0', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={requestLoading}
                  startIcon={requestLoading ? <CircularProgress size={18} color="inherit" /> : <EmailIcon />}
                  sx={{
                    py: 1.3,
                    fontWeight: 800,
                    borderRadius: 1.5,
                    background: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
                    color: '#FFFFFF',
                  }}
                >
                  {requestLoading ? 'Sending Instructions...' : 'Send Password Reset Link'}
                </Button>
              </Box>
            )
          )}

          {/* Footer Back Link */}
          <Box sx={{ textAlign: 'center', mt: 3, pt: 2, borderTop: '1px solid #F1F5F9' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#1565C0',
                fontWeight: 700,
                fontSize: '0.875rem',
                textDecoration: 'none',
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 16 }} /> Back to Sign In
            </Link>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
