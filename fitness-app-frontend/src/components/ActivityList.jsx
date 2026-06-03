import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { deleteActivity, getActivities } from '../services/api'

const formatDate = (value) => {
  if (!value) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const formatType = (value = '') =>
  value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const summaryCards = [
  { label: 'Activities', key: 'count', color: 'primary.main' },
  { label: 'Minutes', key: 'duration', color: 'secondary.main' },
  { label: 'Calories', key: 'calories', color: 'error.main' },
]

const ActivityList = () => {
  const [activities, setActivities] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deletingActivityId, setDeletingActivityId] = useState('')
  const { token, userId } = useSelector((state) => state.auth)

  const loadActivities = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await getActivities({ token, userId })
      setActivities(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Could not load activities')
    } finally {
      setIsLoading(false)
    }
  }, [token, userId])

  useEffect(() => {
    const timer = window.setTimeout(loadActivities, 0)
    window.addEventListener('activity-created', loadActivities)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('activity-created', loadActivities)
    }
  }, [loadActivities])

  const handleDeleteActivity = async (activityId) => {
    setDeletingActivityId(activityId)
    setError('')

    try {
      await deleteActivity(activityId, { token, userId })
      setActivities((currentActivities) =>
        currentActivities.filter((activity) => activity.id !== activityId),
      )
    } catch (err) {
      setError(err.message || 'Could not delete activity')
    } finally {
      setDeletingActivityId('')
    }
  }

  const totals = useMemo(() => {
    return activities.reduce(
      (summary, activity) => ({
        duration: summary.duration + (activity.duration || 0),
        calories: summary.calories + (activity.caloriesBurned || 0),
        count: summary.count + 1,
      }),
      { duration: 0, calories: 0, count: 0 },
    )
  }, [activities])

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: 2,
        }}
      >
        {summaryCards.map(({ label, key, color }) => (
          <Paper
            key={label}
            variant="outlined"
            sx={{
              p: 2,
              minHeight: 112,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderLeft: 4,
              borderLeftColor: color,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h2">{totals[key]}</Typography>
          </Paper>
        ))}
      </Box>

      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ p: 2 }}
        >
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h2">Recent activities</Typography>
            <Typography color="text.secondary">
              Your latest saved workouts from the activity service.
            </Typography>
          </Box>
          <Button variant="outlined" onClick={loadActivities}>
            Refresh
          </Button>
        </Stack>
        <Divider />

        {error ? (
          <Box sx={{ p: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : null}

        {isLoading ? (
          <Box sx={{ p: 4, display: 'grid', placeItems: 'center' }}>
            <CircularProgress size={26} color="inherit" />
          </Box>
        ) : activities.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h3" sx={{ mb: 0.5 }}>
              No activities yet
            </Typography>
            <Typography color="text.secondary">
              Add your first workout to start building your fitness history.
            </Typography>
          </Box>
        ) : (
          <Stack divider={<Divider />}>
            {activities.map((activity) => (
              <Box
                key={activity.id}
                sx={{
                  p: 2,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1.3fr 1fr auto' },
                  gap: 2,
                  alignItems: 'center',
                  transition: 'background-color 160ms ease',
                  '&:hover': {
                    bgcolor: 'rgba(15, 118, 110, 0.04)',
                  },
                }}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="h3">{formatType(activity.type)}</Typography>
                    <Chip size="small" label={`${activity.duration || 0} min`} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(activity.startTime || activity.createdAt)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Calories
                  </Typography>
                  <Typography>{activity.caloriesBurned || 0}</Typography>
                </Box>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  sx={{ justifySelf: { md: 'end' } }}
                >
                  <Button
                    component={Link}
                    to={`/activities/${activity.id}`}
                    variant="outlined"
                  >
                    View details
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteActivity(activity.id)}
                    disabled={deletingActivityId === activity.id}
                  >
                    {deletingActivityId === activity.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Stack>
  )
}

export default ActivityList
