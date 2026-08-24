import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Box, Card, CardContent, Typography, CircularProgress, Alert, Button, Stack } from '@mui/material';
import api from '../../services/api';

export default function OrcidCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const code = searchParams.get('code');
    const oauthError = searchParams.get('error') || searchParams.get('error_description');

    console.log('[ORCID Callback] Process callback initiated with params:', {
      url: window.location.href,
      code: code ? `${code.slice(0, 8)}...` : null,
      oauthError,
      allParams: Object.fromEntries(searchParams.entries()),
    });

    if (oauthError) {
      console.error('[ORCID Callback] OAuth error received in URL:', oauthError);
      setError(`ORCID authorization returned an error: ${oauthError}`);
      setLoading(false);
      return;
    }

    if (!code) {
      console.warn('[ORCID Callback] No authorization code found in URL params');
      setError('No authorization code provided in the callback URL.');
      setLoading(false);
      return;
    }

    const exchangeCode = async () => {
      try {
        const redirectUri = `${window.location.origin}/auth/orcid/callback`;
        console.log('[ORCID Callback] Exchanging code with backend:', { code, redirectUri });

        const res = await api.post('/auth/orcid/callback', {
          code,
          redirectUri,
        });

        console.log('[ORCID Callback] Exchange response:', res.data);
        const { user, token } = res.data;

        if (token && user) {
          localStorage.setItem('cmt_token', token);
          localStorage.setItem('cmt_user', JSON.stringify(user));
          console.log('[ORCID Callback] Token and user saved, redirecting to /dashboard...');
          window.location.href = '/dashboard';
        } else {
          console.error('[ORCID Callback] Missing token or user in response payload:', res.data);
          setError('Authentication response was incomplete. Please try signing in again.');
          setLoading(false);
        }
      } catch (err) {
        console.error('[ORCID Callback] Code exchange failed:', err);
        setError(err.response?.data?.error || err.response?.data?.details || 'Failed to authenticate with ORCID. Please try again.');
        setLoading(false);
      }
    };

    exchangeCode();
  }, [searchParams]);

  const handleDemoSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('[ORCID Callback] Triggering dev simulation sign-in for 0000-0002-1825-0097...');
      const res = await api.post('/auth/orcid/callback', {
        code: '0000-0002-1825-0097',
        redirectUri: `${window.location.origin}/auth/orcid/callback`,
      });
      const { user, token } = res.data;
      if (token && user) {
        localStorage.setItem('cmt_token', token);
        localStorage.setItem('cmt_user', JSON.stringify(user));
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('[ORCID Callback] Demo login error:', err);
      setError('Simulation sign-in failed: ' + (err.response?.data?.error || err.message));
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
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          borderRadius: 1.5,
          boxShadow: '0 20px 40px -15px rgba(15, 41, 66, 0.08)',
          textAlign: 'center',
          p: 3,
          border: '1px solid #E2E8F0',
        }}
      >
        <CardContent>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 1.5,
              backgroundColor: '#A6CE39',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontWeight: 900,
              fontSize: '1.4rem',
              mb: 2,
              boxShadow: '0 4px 12px rgba(166, 206, 57, 0.25)',
            }}
          >
            iD
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F2942', mb: 1 }}>
            ORCID Authentication
          </Typography>

          {loading && (
            <Box sx={{ py: 3 }}>
              <CircularProgress size={36} sx={{ color: '#A6CE39', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Verifying your ORCID identity and synchronizing academic credentials...
              </Typography>
            </Box>
          )}

          {error && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="error" sx={{ mb: 3, textAlign: 'left', borderRadius: 1 }}>
                {error}
              </Alert>
              <Stack spacing={1.5} direction="column">
                <Button
                  variant="contained"
                  onClick={handleDemoSignIn}
                  sx={{
                    background: 'linear-gradient(135deg, #1565C0 0%, #1976D2 100%)',
                    fontWeight: 700,
                    borderRadius: 1,
                  }}
                >
                  Continue with Demo ORCID (0000-0002-1825-0097)
                </Button>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/login"
                  sx={{
                    borderColor: '#CBD5E1',
                    color: '#475569',
                    fontWeight: 700,
                    borderRadius: 1,
                  }}
                >
                  Return to Login
                </Button>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
