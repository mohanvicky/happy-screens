import { createTheme } from '@mui/material/styles'

// Our refined color palette
const colors = {
  primary: {
    main: '#D50A17', // Light Purple
    light: '#D50A17', // Lavender
    dark: '#D50A17', // Darker Purple
    contrastText: '#FFFFFF'
  },
  secondary: {
    main: '#60A5FA', // Soft Blue
    light: '#D50A17',
    dark: '#3B82F6',
    contrastText: '#FFFFFF'
  },
  accent: {
    main: '#F472B6', // Light Pink
    light: '#FBCFE8',
    dark: '#EC4899'
  },
  background: {
    default: '#F8FAFC', // Light Gray
    paper: '#FFFFFF', // White
    hero: '#FAF5FF' // Very Light Purple
  },
  text: {
    primary: '#1F2937', // Dark Text
    secondary: '#6B7280'
  }
}

// Mobile-first theme configuration
export const theme = createTheme({
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    background: colors.background,
    text: colors.text
  },
  typography: {

  fontFamily: ['Inter', 'serif'].join(','),

    // fontFamily: [
    //   'Inter',
    //   '-apple-system',
    //   'BlinkMacSystemFont',
    //   'Segoe UI',
    //   'Roboto',
    //   'sans-serif'
    // ].join(','),
    // Mobile-first typography
    h1: {
      fontSize: '2rem', // 32px
      fontWeight: 700,
      lineHeight: 1.2,
      '@media (min-width:600px)': {
        fontSize: '2.5rem' // 40px on tablet+
      },
      '@media (min-width:960px)': {
        fontSize: '3rem' // 48px on desktop
      }
    },
    h2: {
      fontSize: '1.75rem', // 28px
      fontWeight: 600,
      lineHeight: 1.3,
      '@media (min-width:600px)': {
        fontSize: '2rem' // 32px on tablet+
      }
    },
    body1: {
      fontSize: '1rem', // 16px
      lineHeight: 1.6
    },
    button: {
      fontSize: '1rem',
      fontWeight: 500,
      textTransform: 'none' // Don't uppercase buttons
    }
  },
  breakpoints: {
    values: {
      xs: 0,     // Mobile
      sm: 600,   // Tablet
      md: 960,   // Small desktop
      lg: 1280,  // Large desktop
      xl: 1920   // Extra large
    }
  },
  components: {
    // Mobile-optimized button sizes
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          '@media (max-width:600px)': {
            padding: '14px 20px', // Larger touch targets on mobile
            fontSize: '1.1rem'
          }
        },
        contained: {
          boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(168, 85, 247, 0.4)'
          }
        }
      }
    },
    // Mobile-optimized cards
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)'
          }
        }
      }
    },
    // Larger touch targets for mobile
    MuiIconButton: {
      styleOverrides: {
        root: {
          '@media (max-width:600px)': {
            padding: '12px' // Larger touch area
          }
        }
      }
    }
  }
})
