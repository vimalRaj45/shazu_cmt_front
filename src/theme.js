import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565C0', // Royal Blue
      light: '#42A5F5',
      dark: '#0D47A1',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0288D1', // Bright Azure Blue
      light: '#29B6F6',
      dark: '#01579B',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F4F7FB', // Crisp Light Canvas
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F2942', // Deep Navy Text
      secondary: '#4A657E',
    },
    info: {
      main: '#1976D2',
      light: '#E3F2FD',
      dark: '#0D47A1',
    },
    success: {
      main: '#0284C7',
      light: '#E0F2FE',
      dark: '#0369A1',
    },
    warning: {
      main: '#D97706',
      light: '#FEF3C7',
      dark: '#92400E',
    },
    error: {
      main: '#DC2626',
      light: '#FEE2E2',
      dark: '#991B1B',
    },
    divider: '#E2E8F0',
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
