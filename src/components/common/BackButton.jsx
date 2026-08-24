import React from 'react';
import { Button, IconButton, Tooltip, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable, clean Back Button for page headers
 * @param {string} fallbackUrl Optional fallback route if history is empty
 * @param {string} label Optional button text label (default: 'Back')
 * @param {boolean} iconOnly If true, renders an IconButton with tooltip
 */
export default function BackButton({ fallbackUrl = '/dashboard', label = 'Back', iconOnly = false, sx = {} }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackUrl);
    }
  };

  if (iconOnly) {
    return (
      <Tooltip title="Go Back">
        <IconButton
          onClick={handleBack}
          size="small"
          sx={{
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
            color: '#0F2942',
            borderRadius: 1,
            p: 0.75,
            transition: 'all 0.15s ease-in-out',
            '&:hover': {
              backgroundColor: '#F1F5F9',
              borderColor: '#CBD5E1',
            },
            ...sx,
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      onClick={handleBack}
      variant="outlined"
      size="small"
      startIcon={<ArrowBackIcon sx={{ fontSize: '1.1rem !important' }} />}
      sx={{
        borderColor: '#E2E8F0',
        backgroundColor: '#FFFFFF',
        color: '#334155',
        fontWeight: 700,
        textTransform: 'none',
        borderRadius: 1,
        px: 1.5,
        py: 0.6,
        fontSize: '0.825rem',
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        '&:hover': {
          borderColor: '#CBD5E1',
          backgroundColor: '#F8FAFC',
          color: '#0F2942',
        },
        ...sx,
      }}
    >
      {label}
    </Button>
  );
}
