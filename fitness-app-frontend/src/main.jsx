import ReactDOM from 'react-dom/client'

import { Provider } from 'react-redux'
import store from './store/store'

import App from './App'
import { AuthProvider } from 'react-oauth2-code-pkce'
import authConfig from './authConfig'
import { CssBaseline, CircularProgress, Box } from '@mui/material'
import { alpha, ThemeProvider, createTheme } from '@mui/material/styles'
import './index.css'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f766e',
      dark: '#115e59',
      light: '#ccfbf1',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f59e0b',
      dark: '#b45309',
      light: '#fef3c7',
      contrastText: '#111827',
    },
    error: {
      main: '#dc2626',
      dark: '#991b1b',
      light: '#fee2e2',
    },
    background: {
      default: '#f4f7f4',
      paper: '#ffffff',
    },
    text: {
      primary: '#10201d',
      secondary: '#62706b',
    },
    divider: '#dfe7e2',
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 750,
      letterSpacing: 0,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 700,
      letterSpacing: 0,
    },
    h3: {
      fontSize: '1.25rem',
      fontWeight: 650,
      letterSpacing: 0,
    },
    button: {
      textTransform: 'none',
      fontWeight: 650,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: 'none',
          borderRadius: 8,
          paddingInline: theme.spacing(2),
          minHeight: 40,
        }),
        containedPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          '&:hover': {
            backgroundColor: theme.palette.primary.dark,
          },
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.06),
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          borderColor: theme.palette.divider,
          boxShadow: `0 1px 2px ${alpha(theme.palette.common.black, 0.04)}`,
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 6,
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          color: theme.palette.primary.dark,
          fontWeight: 650,
        }),
        outlined: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
        }),
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          backgroundColor: '#fbfcfb',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(theme.palette.primary.main, 0.55),
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
        }),
      },
    },
  },
})

// As of React 18
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <AuthProvider authConfig={authConfig}
  loadingComponent={
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'background.default',
      }}
    >
      <CircularProgress size={28} color="inherit" />
    </Box>
  }>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Provider store={store}>
        <App />
      </Provider>
    </ThemeProvider>
  </AuthProvider>,
)
