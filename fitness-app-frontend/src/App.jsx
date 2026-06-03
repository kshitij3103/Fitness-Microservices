import { useContext, useEffect } from 'react'
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  Toolbar,
  Typography,
  Alert,
} from '@mui/material'
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router'
import { AuthContext } from 'react-oauth2-code-pkce'
import { useDispatch, useSelector } from 'react-redux'
import { logout, setCredentials } from './store/authSlice'
import ActivityForm from './components/ActivityForm'
import ActivityList from './components/ActivityList'
import ActivityDetail from './components/ActivityDetail'
import FitnessProfile from './components/FitnessProfile'
import './App.css'

const ActivitiesPage = () => (
  <Stack spacing={3}>
    <FitnessProfile />
    <ActivityForm />
    <ActivityList />
  </Stack>
)

const Shell = ({ children, onLogout }) => {
  const location = useLocation()
  const user = useSelector((state) => state.auth.user)
  const pageTitle = location.pathname.startsWith('/activities/')
    ? 'Activity detail'
    : 'Activities'

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        background:
          'linear-gradient(180deg, #eef7f2 0, #f4f7f4 260px, #f4f7f4 100%)',
      }}
    >
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'rgba(255, 255, 255, 0.82)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <Toolbar sx={{ gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h3" component="p">
              Fitness Tracker
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pageTitle}
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            {user?.name || user?.email || 'Signed in'}
          </Typography>
          <Button variant="outlined" onClick={onLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        {children}
      </Container>
    </Box>
  )
}

const LoginPage = ({ onLogin, error, loginInProgress }) => (
  <Box
    sx={{
      minHeight: '100vh',
      bgcolor: 'background.default',
      display: 'grid',
      placeItems: 'center',
      px: 2,
    }}
  >
    <Paper
      variant="outlined"
      sx={{
        width: '100%',
      maxWidth: 460,
      p: { xs: 3, sm: 4 },
      borderTop: 4,
      borderTopColor: 'primary.main',
    }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1 }}>
            Fitness Tracker
          </Typography>
          <Typography color="text.secondary">
            Track workouts and review AI recommendations from your fitness
            microservices.
          </Typography>
        </Box>
        <Divider />
        {error ? (
          <Alert severity="warning">
            Login could not be completed. Clear the failed attempt and try
            signing in again.
          </Alert>
        ) : null}
        <Button
          variant="contained"
          size="large"
          onClick={onLogin}
          disabled={loginInProgress}
        >
          {loginInProgress ? 'Opening Keycloak...' : 'Login with Keycloak'}
        </Button>
      </Stack>
    </Paper>
  </Box>
)

const App = () => {
  const { token, tokenData, logIn, logOut, error, loginInProgress } =
    useContext(AuthContext)
  const dispatch = useDispatch()

  useEffect(() => {
    if (token) {
      dispatch(setCredentials({ token, user: tokenData }))
    }
  }, [token, tokenData, dispatch])

  const handleLogout = () => {
    dispatch(logout())
    logOut()
  }

  const handleLogin = () => {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('ROCP_') || ['token', 'user', 'userId'].includes(key)) {
        localStorage.removeItem(key)
      }
    }

    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith('ROCP_')) {
        sessionStorage.removeItem(key)
      }
    }

    window.history.replaceState({}, document.title, window.location.pathname)
    logIn()
  }

  return (
    <Router>
      {!token ? (
        <LoginPage
          onLogin={handleLogin}
          error={error}
          loginInProgress={loginInProgress}
        />
      ) : (
        <Shell onLogout={handleLogout}>
          <Routes>
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/activities/:id" element={<ActivityDetail />} />
            <Route path="/" element={<Navigate to="/activities" replace />} />
            <Route path="*" element={<Navigate to="/activities" replace />} />
          </Routes>
        </Shell>
      )}
    </Router>
  )
}

export default App
