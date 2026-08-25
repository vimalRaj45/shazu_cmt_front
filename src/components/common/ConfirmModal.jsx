import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Fade,
} from '@mui/material';

const SEVERITY_THEMES = {
  danger: {
    bg: '#FEE2E2',
    color: '#DC2626',
    border: '#FECACA',
    icon: 'bi-exclamation-triangle-fill',
    confirmBg: '#DC2626',
    confirmHover: '#B91C1C',
    confirmText: '#FFFFFF',
  },
  warning: {
    bg: '#FEF3C7',
    color: '#D97706',
    border: '#FDE68A',
    icon: 'bi-exclamation-circle-fill',
    confirmBg: '#D97706',
    confirmHover: '#B45309',
    confirmText: '#FFFFFF',
  },
  logout: {
    bg: '#FEE2E2',
    color: '#DC2626',
    border: '#FECACA',
    icon: 'bi-box-arrow-right',
    confirmBg: '#DC2626',
    confirmHover: '#B91C1C',
    confirmText: '#FFFFFF',
  },
  info: {
    bg: '#E8EFEB',
    color: '#123B32',
    border: '#527A68',
    icon: 'bi-info-circle-fill',
    confirmBg: '#123B32',
    confirmHover: '#0B241E',
    confirmText: '#FFFFFF',
  },
  success: {
    bg: '#DCFCE7',
    color: '#16A34A',
    border: '#BBF7D0',
    icon: 'bi-check-circle-fill',
    confirmBg: '#16A34A',
    confirmHover: '#15803D',
    confirmText: '#FFFFFF',
  },
};

export default function ConfirmModal({
  open,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  severity = 'warning',
  confirmColor,
  icon,
  onConfirm,
  onCancel,
  loading = false,
}) {
  // If confirmColor is passed as 'error', map to 'danger'
  const resolvedSeverity = severity === 'warning' && confirmColor === 'error' ? 'danger' : severity;
  const theme = SEVERITY_THEMES[resolvedSeverity] || SEVERITY_THEMES.warning;
  const displayIcon = icon || theme.icon;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onCancel}
      TransitionComponent={Fade}
      transitionDuration={200}
      maxWidth="xs"
      fullWidth
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(3px)',
          backgroundColor: 'rgba(18, 59, 50, 0.25)',
        },
      }}
      PaperProps={{
        sx: {
          borderRadius: 2.5,
          p: 1.5,
          border: '1px solid #D3DDD7',
          boxShadow: '0 16px 40px rgba(18, 59, 50, 0.2)',
          backgroundColor: '#FFFFFF',
          maxWidth: '440px !important',
          width: '100%',
          m: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 42,
            height: 42,
            borderRadius: 2,
            backgroundColor: theme.bg,
            color: theme.color,
            border: `1px solid ${theme.border}`,
            fontSize: '1.2rem',
            flexShrink: 0,
          }}
        >
          <i className={`bi ${displayIcon}`} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#123B32', lineHeight: 1.25 }}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pb: 2.5, pt: 1 }}>
        <DialogContentText sx={{ color: '#334E43', fontSize: '0.9rem', lineHeight: 1.6 }}>
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, pb: 1.5, gap: 1.25 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          size="small"
          disabled={loading}
          sx={{
            borderRadius: 1.5,
            color: '#334E43',
            borderColor: '#D3DDD7',
            backgroundColor: 'transparent',
            textTransform: 'none',
            fontWeight: 700,
            px: 2,
            py: 0.75,
            '&:hover': {
              borderColor: '#123B32',
              backgroundColor: '#F5F3EC',
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          size="small"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : null}
          sx={{
            borderRadius: 1.5,
            textTransform: 'none',
            fontWeight: 800,
            px: 2.5,
            py: 0.75,
            backgroundColor: theme.confirmBg,
            color: theme.confirmText,
            boxShadow: `0 4px 12px ${theme.bg}`,
            '&:hover': {
              backgroundColor: theme.confirmHover,
            },
          }}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
