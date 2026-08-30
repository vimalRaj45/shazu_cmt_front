import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  Container,
  Divider,
} from '@mui/material';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

// Official MUI Icons
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LoginIcon from '@mui/icons-material/Login';
import ShieldIcon from '@mui/icons-material/Shield';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import RateReviewIcon from '@mui/icons-material/RateReview';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

export default function ExternalWelcomePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract referral parameters
  const source = searchParams.get('source') || searchParams.get('platform') || searchParams.get('ref') || '';
  const journal = searchParams.get('journal') || searchParams.get('conference') || '';
  
  // Format partner platform display title
  const partnerTitle = journal || source || 'External Journal & Conference Partner';

  const handleRegisterProceed = () => {
    const query = searchParams.toString();
    navigate(`/register${query ? `?${query}` : ''}`);
  };

  const handleLoginProceed = () => {
    const query = searchParams.toString();
    navigate(`/login${query ? `?${query}` : ''}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        backgroundImage:
          'radial-gradient(at 0% 0%, rgba(18, 59, 50, 0.08) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(21, 101, 192, 0.06) 0, transparent 50%)',
        py: { xs: 4, md: 7 },
        px: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="md">
        <Card
          sx={{
            borderRadius: 2.5,
            backgroundColor: '#FFFFFF',
            boxShadow: '0 24px 48px -12px rgba(15, 23, 42, 0.12)',
            overflow: 'hidden',
            border: '1px solid #E2E8F0',
          }}
        >
          {/* Header Banner */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #123B32 0%, #1D4C40 50%, #2F5B4E 100%)',
              p: { xs: 3.5, sm: 5 },
              color: '#FFFFFF',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 1.5,
                borderRadius: 3,
                backgroundColor: '#FFFFFF',
                mb: 2.5,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.9)',
              }}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="Shazu Soft Logo"
                sx={{
                  height: 72,
                  width: 72,
                  objectFit: 'contain',
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
              <Chip
                label="PARTNER PUBLICATION VISITOR"
                size="small"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  backdropFilter: 'blur(4px)',
                }}
              />
              {source && (
                <Chip
                  label={`REFERRER: ${source.toUpperCase()}`}
                  size="small"
                  sx={{
                    backgroundColor: '#86EFAC',
                    color: '#166534',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                fontSize: { xs: '1.65rem', sm: '2.25rem' },
                mb: 1.5,
              }}
            >
              Welcome to Shazu Soft CJMS
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                opacity: 0.95,
                maxWidth: 680,
                mx: 'auto',
                color: '#E8EFEB',
                lineHeight: 1.6,
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
              }}
            >
              You have been redirected from <strong>{partnerTitle}</strong> to the official Shazu Soft Conference & Journal Management System.
            </Typography>
          </Box>

          {/* Body Content */}
          <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
            {/* Call to Action Box */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                backgroundColor: '#F0FDF4',
                borderRadius: 2,
                border: '1.5px solid #86EFAC',
                textAlign: 'center',
                mb: 4,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#166534', mb: 1 }}>
                Ready to Access Manuscripts & Publications?
              </Typography>
              <Typography variant="body2" sx={{ color: '#15803D', mb: 3, maxWidth: 580, mx: 'auto', lineHeight: 1.6 }}>
                Create your verified CJMS account to submit research papers, participate in peer evaluations, and track editorial decisions for <strong>{partnerTitle}</strong>.
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleRegisterProceed}
                  startIcon={<HowToRegIcon />}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.6,
                    px: 4,
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    borderRadius: 1.5,
                    color: '#FFFFFF',
                    background: 'linear-gradient(135deg, #123B32 0%, #1D4C40 50%, #2F5B4E 100%)',
                    boxShadow: '0 8px 20px rgba(18, 59, 50, 0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0B241E 0%, #123B32 100%)',
                      boxShadow: '0 10px 24px rgba(18, 59, 50, 0.35)',
                    },
                  }}
                >
                  Click Register to Proceed
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleLoginProceed}
                  startIcon={<LoginIcon />}
                  sx={{
                    py: 1.5,
                    px: 3.5,
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    borderRadius: 1.5,
                    color: '#123B32',
                    borderColor: '#A3E635',
                    backgroundColor: '#FFFFFF',
                    '&:hover': {
                      borderColor: '#123B32',
                      backgroundColor: '#F8FAFC',
                    },
                  }}
                >
                  Sign In (Existing User)
                </Button>
              </Box>
            </Paper>

            <Divider sx={{ mb: 4 }} />

            {/* Platform Highlights Grid */}
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#123B32', mb: 2.5, textAlign: 'center' }}>
              Why Researchers & Journals Trust Shazu Soft CJMS
            </Typography>

            <Grid container spacing={2.5}>
              {[
                {
                  title: 'Double-Blind Peer Review',
                  desc: 'Automated Conflict-of-Interest (COI) matrix detection and anonymized manuscript evaluation.',
                  icon: RateReviewIcon,
                  color: '#123B32',
                  bg: '#E8EFEB',
                },
                {
                  title: 'High-Speed Cloud Storage',
                  desc: 'Instant PDF uploads, camera-ready submissions, and proceedings distribution.',
                  icon: CloudUploadIcon,
                  color: '#1565C0',
                  bg: '#EFF6FF',
                },
                {
                  title: 'Verified ORCID iD Integration',
                  desc: 'One-click academic sign-in and publication history synchronization.',
                  icon: VerifiedUserIcon,
                  color: '#166534',
                  bg: '#F0FDF4',
                },
                {
                  title: 'Cloudflare Turnstile Protection',
                  desc: 'Enterprise-grade bot protection ensuring authentic peer evaluations and secure access.',
                  icon: ShieldIcon,
                  color: '#C47D4C',
                  bg: '#FBEFE7',
                },
              ].map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <Grid item xs={12} sm={6} key={idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        border: '1px solid #E2E8F0',
                        height: '100%',
                        backgroundColor: '#FFFFFF',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.06)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 1.5,
                            backgroundColor: item.bg,
                            color: item.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <IconComponent fontSize="small" />
                        </Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F2942' }}>
                          {item.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.55 }}>
                        {item.desc}
                      </Typography>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>

            {/* Footer Notice */}
            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                © {new Date().getFullYear()} Shazu Soft Technologies. All rights reserved. • Partner Portal Gateway
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
