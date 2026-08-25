import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let baseTheme = createTheme({
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
    h1: { fontWeight: 800, letterSpacing: '-0.025em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700, letterSpacing: '-0.015em' },
    h4: { fontWeight: 700, letterSpacing: '-0.01em' },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 6, // Clean, modern lightly rounded default
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          boxShadow: 'none',
          padding: '7px 16px',
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '0.85rem',
          transition: 'all 0.15s ease-in-out',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(18, 59, 50, 0.15)',
          },
          '&.Mui-disabled': {
            opacity: 0.85,
          },
        },
        containedPrimary: {
          backgroundColor: '#123B32',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#0B241E',
          },
        },
        containedSecondary: {
          backgroundColor: '#2F5B4E',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#123B32',
          },
        },
        outlinedPrimary: {
          borderColor: '#2F5B4E',
          color: '#123B32',
          '&:hover': {
            borderColor: '#123B32',
            backgroundColor: '#E8EFEB',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          border: '1px solid #D3DDD7',
          boxShadow: '0 1px 4px rgba(18, 59, 50, 0.04)',
          transition: 'all 0.2s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        rounded: {
          borderRadius: 8,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D3DDD7',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#527A68',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#123B32',
            borderWidth: '2px',
          },
          '&.Mui-disabled': {
            backgroundColor: '#F8FAF9',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#CBD5E1',
            },
          },
        },
        input: {
          color: '#1E293B',
          fontWeight: 600,
          '&.Mui-disabled': {
            WebkitTextFillColor: '#123B32 !important', // High-contrast, crystal clear dark brand text!
            color: '#123B32 !important',
            fontWeight: 600,
            cursor: 'default',
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#475569',
          fontWeight: 600,
          '&.Mui-disabled': {
            color: '#2F5B4E !important',
            fontWeight: 700,
          },
          '&.Mui-focused': {
            color: '#123B32',
            fontWeight: 700,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          margin: 16,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F5F3EC',
          fontWeight: 700,
          color: '#123B32',
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          borderBottom: '1px solid #D3DDD7',
        },
        body: {
          borderColor: '#D3DDD7',
          fontSize: '0.875rem',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          backgroundColor: '#E8EFEB',
        },
        bar: {
          backgroundColor: '#123B32',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#123B32',
        },
      },
    },
  },
});

export const theme = responsiveFontSizes(baseTheme);

