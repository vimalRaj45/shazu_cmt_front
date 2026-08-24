import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#123B32', // Brand Primary (Deep Emerald)
      light: '#2F5B4E',
      dark: '#0B241E',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#2F5B4E', // Brand Secondary
      light: '#527A68',
      dark: '#123B32',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F3EC', // Brand BG
      paper: '#FFFFFF', // Brand Surface
    },
    text: {
      primary: '#26322E', // Brand Text
      secondary: '#334E43', // Brand Text Secondary
    },
    info: {
      main: '#2F5B4E',
      light: '#E8EFEB',
      dark: '#123B32',
    },
    success: {
      main: '#123B32',
      light: '#E8EFEB',
      dark: '#0B241E',
    },
    warning: {
      main: '#C47D4C', // Brand Copper
      light: '#FBEFE7',
      dark: '#9A5B31',
    },
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
      dark: '#991B1B',
    },
    divider: '#D3DDD7', // Brand Border
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.025em', color: '#0F2942' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em', color: '#0F2942' },
    h3: { fontWeight: 700, letterSpacing: '-0.015em', color: '#0F2942' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em', color: '#0F2942' },
    h5: { fontWeight: 600, color: '#0F2942' },
    h6: { fontWeight: 600, color: '#0F2942' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 4, // Clean, lightly rounded default
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          boxShadow: 'none',
          padding: '7px 16px',
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.85rem',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(21, 101, 192, 0.15)',
          },
        },
        containedPrimary: {
          backgroundColor: '#1565C0',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#0D47A1',
          },
        },
        containedSecondary: {
          backgroundColor: '#0288D1',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#01579B',
          },
        },
        outlinedPrimary: {
          borderColor: '#90CAF9',
          color: '#1565C0',
          backgroundColor: '#FFFFFF',
          '&:hover': {
            borderColor: '#1565C0',
            backgroundColor: '#F0F7FF',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(15, 41, 66, 0.04)',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        rounded: {
          borderRadius: 6,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 6,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 4,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F8FAFC',
          fontWeight: 700,
          color: '#0F2942',
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          borderBottom: '1px solid #E2E8F0',
        },
        body: {
          borderColor: '#EDF2F7',
          fontSize: '0.875rem',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          backgroundColor: '#E3F2FD',
        },
        bar: {
          backgroundColor: '#1565C0',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#1565C0',
        },
      },
    },
  },
});
