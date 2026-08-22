import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Skeleton,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from '@mui/material';

/**
 * Centered Circular Spinner with Blue & White theme
 */
export function LoadingSpinner({ message = 'Loading data...', size = 44, minHeight = 240 }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        p: 3,
        width: '100%',
      }}
    >
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={size}
          thickness={4}
          sx={{ color: '#E3F2FD' }}
        />
        <CircularProgress
          variant="indeterminate"
          disableShrink
          size={size}
          thickness={4}
          sx={{
            color: '#1565C0',
            animationDuration: '750ms',
            position: 'absolute',
            left: 0,
          }}
        />
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#4A657E' }}>
        {message}
      </Typography>
    </Box>
  );
}

/**
 * Table Loading Skeleton with realistic rows
 */
export function TableSkeleton({ rows = 5, columns = 6 }) {
  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 2, mb: 1.5, backgroundColor: '#EDF2F7' }} />
      {Array.from(new Array(rows)).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 2, my: 1.5 }}>
          {Array.from(new Array(columns)).map((_, j) => (
            <Skeleton
              key={j}
              variant="rounded"
              height={32}
              sx={{ flex: j === 1 ? 2 : 1, borderRadius: 1.5, backgroundColor: '#F4F7FB' }}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}

/**
 * Dashboard Cards Skeleton
 */
export function CardsSkeleton({ count = 4, sm = 6, md = 3 }) {
  return (
    <Grid container spacing={2.5}>
      {Array.from(new Array(count)).map((_, i) => (
        <Grid item xs={12} sm={sm} md={md} key={i}>
          <Card sx={{ p: 1 }}>
            <CardContent>
              <Skeleton variant="circular" width={40} height={40} sx={{ mb: 1.5, backgroundColor: '#E3F2FD' }} />
              <Skeleton variant="text" width="40%" height={32} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="70%" height={18} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

/**
 * Clean Blue & White Empty State
 */
export function EmptyState({ icon = 'bi-inbox', title = 'No items found', description = 'There is currently no data to display.', action = null }) {
  return (
    <Box
      sx={{
        p: 5,
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 3,
        border: '1px dashed #BFDBFE',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        my: 2,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          backgroundColor: '#E3F2FD',
          color: '#1565C0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          mb: 2,
        }}
      >
        <i className={`bi ${icon}`}></i>
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#0F2942', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mb: action ? 2.5 : 0 }}>
        {description}
      </Typography>
      {action}
    </Box>
  );
}
