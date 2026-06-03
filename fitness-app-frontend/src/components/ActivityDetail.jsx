import { useCallback, useEffect, useState } from 'react'
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
import { Link, useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import {
  deleteActivity,
  deleteActivityRecommendations,
  getActivity,
  getActivityRecommendations,
  regenerateActivityRecommendation,
} from '../services/api'

const formatType = (value = '') =>
  value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const formatDate = (value) => {
  if (!value) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const formatSectionTitle = (value = '') =>
  value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const parseMaybeJson = (value) => {
  if (!value || typeof value !== 'string') {
    return null
  }

  const cleanedValue = value
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  if (!cleanedValue.startsWith('{') && !cleanedValue.startsWith('[')) {
    return null
  }

  try {
    return JSON.parse(cleanedValue)
  } catch {
    return null
  }
}

const splitLabel = (value) => {
  if (typeof value !== 'string') {
    return { body: String(value ?? '') }
  }

  const [label, ...rest] = value.split(':')
  if (!rest.length || label.length > 32) {
    return { body: value }
  }

  return {
    label: label.trim(),
    body: rest.join(':').trim(),
  }
}

const DetailItem = ({ label, value }) => (
  <Paper variant="outlined" sx={{ p: 2 }}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h3">{value}</Typography>
  </Paper>
)

const RecommendationValue = ({ value }) => {
  if (Array.isArray(value)) {
    return (
      <Stack spacing={1}>
        {value.map((item, index) => (
          <RecommendationValue key={index} value={item} />
        ))}
      </Stack>
    )
  }

  if (value && typeof value === 'object') {
    return (
      <Stack spacing={1}>
        {Object.entries(value).map(([key, nestedValue]) => (
          <Box key={key}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>
              {formatSectionTitle(key)}
            </Typography>
            <RecommendationValue value={nestedValue} />
          </Box>
        ))}
      </Stack>
    )
  }

  const { label, body } = splitLabel(value)

  return (
    <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
      {label ? (
        <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>
          {label}:{' '}
        </Box>
      ) : null}
      {body}
    </Typography>
  )
}

const AnalysisBlock = ({ value }) => {
  if (!value) {
    return null
  }

  const parsedValue = parseMaybeJson(value)

  if (parsedValue) {
    return (
      <Stack spacing={1.5}>
        {Object.entries(parsedValue).map(([key, sectionValue]) => (
          <Paper
            key={key}
            variant="outlined"
            sx={{ p: 2, bgcolor: 'rgba(15, 118, 110, 0.03)' }}
          >
            <Typography variant="h3" sx={{ mb: 1 }}>
              {formatSectionTitle(key)}
            </Typography>
            <RecommendationValue value={sectionValue} />
          </Paper>
        ))}
      </Stack>
    )
  }

  const sections = value
    .split(/\n{2,}/)
    .map((section) => section.trim())
    .filter(Boolean)

  return (
    <Stack spacing={1.5}>
      {sections.map((section, index) => {
        const { label, body } = splitLabel(section)

        return (
          <Paper key={`${label || 'analysis'}-${index}`} variant="outlined" sx={{ p: 2 }}>
            {label ? (
              <Typography variant="h3" sx={{ mb: 0.75 }}>
                {formatSectionTitle(label)}
              </Typography>
            ) : null}
            <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {body}
            </Typography>
          </Paper>
        )
      })}
    </Stack>
  )
}

const TextList = ({ title, items }) => {
  if (!items?.length) {
    return null
  }

  return (
    <Box>
      <Typography variant="h3" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Stack spacing={1.25}>
        {items.map((item, index) => (
          <Paper
            key={`${title}-${index}`}
            variant="outlined"
            sx={{ p: 1.5, bgcolor: 'rgba(255, 255, 255, 0.72)' }}
          >
            <RecommendationValue value={item} />
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

const ActivityDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activity, setActivity] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletingActivity, setIsDeletingActivity] = useState(false)
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [isDeletingRecommendations, setIsDeletingRecommendations] = useState(false)
  const [isRegeneratingRecommendation, setIsRegeneratingRecommendation] = useState(false)
  const [recommendationError, setRecommendationError] = useState('')
  const { token, userId } = useSelector((state) => state.auth)

  const loadRecommendations = useCallback(async () => {
    setIsLoadingRecommendations(true)
    setRecommendationError('')

    try {
      const recommendationData = await getActivityRecommendations(id, { token, userId })
      const nextRecommendations = Array.isArray(recommendationData)
        ? recommendationData
        : []
      setRecommendations(nextRecommendations)
      return nextRecommendations
    } catch (err) {
      setRecommendationError(
        err.message || 'Could not load recommendations. Check AiService.',
      )
      return []
    } finally {
      setIsLoadingRecommendations(false)
    }
  }, [id, token, userId])

  const handleDeleteRecommendations = async () => {
    setIsDeletingRecommendations(true)
    setRecommendationError('')

    try {
      await deleteActivityRecommendations(id, { token, userId })
      setRecommendations([])
    } catch (err) {
      setRecommendationError(
        err.message || 'Could not delete recommendations. Check AiService.',
      )
    } finally {
      setIsDeletingRecommendations(false)
    }
  }

  const handleRegenerateRecommendation = async () => {
    setIsRegeneratingRecommendation(true)
    setRecommendationError('')

    try {
      const recommendation = await regenerateActivityRecommendation(id, { token, userId })
      setRecommendations(recommendation ? [recommendation] : [])
    } catch (err) {
      setRecommendationError(
        err.message || 'Could not regenerate recommendations. Check AiService.',
      )
    } finally {
      setIsRegeneratingRecommendation(false)
    }
  }

  const handleDeleteActivity = async () => {
    setIsDeletingActivity(true)
    setError('')

    try {
      await deleteActivity(id, { token, userId })
      window.dispatchEvent(new Event('activity-created'))
      navigate('/activities')
    } catch (err) {
      setError(err.message || 'Could not delete activity')
      setIsDeletingActivity(false)
    }
  }

  useEffect(() => {
    const loadDetail = async () => {
      setIsLoading(true)
      setError('')
      try {
        const activityData = await getActivity(id, { token, userId })
        setActivity(activityData)
      } catch (err) {
        setError(err.message || 'Could not load activity detail')
      } finally {
        setIsLoading(false)
      }
    }

    loadDetail()
  }, [id, token, userId])

  useEffect(() => {
    let attempts = 0
    let timer
    let isCancelled = false

    const pollRecommendations = async () => {
      attempts += 1
      const data = await loadRecommendations()

      if (!isCancelled && data.length === 0 && attempts < 12) {
        timer = window.setTimeout(pollRecommendations, 5000)
      }
    }

    pollRecommendations()

    return () => {
      isCancelled = true
      window.clearTimeout(timer)
    }
  }, [loadRecommendations])

  if (isLoading) {
    return (
      <Box sx={{ p: 6, display: 'grid', placeItems: 'center' }}>
        <CircularProgress size={28} color="inherit" />
      </Box>
    )
  }

  if (error) {
    return (
      <Stack spacing={2}>
        <Button component={Link} to="/activities" variant="outlined" sx={{ alignSelf: 'flex-start' }}>
          Back to activities
        </Button>
        <Alert severity="error">{error}</Alert>
      </Stack>
    )
  }

  if (!activity) {
    return (
      <Stack spacing={2}>
        <Button component={Link} to="/activities" variant="outlined" sx={{ alignSelf: 'flex-start' }}>
          Back to activities
        </Button>
        <Alert severity="info">Activity not found.</Alert>
      </Stack>
    )
  }

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignSelf: 'flex-start' }}>
        <Button component={Link} to="/activities" variant="outlined">
          Back to activities
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleDeleteActivity}
          disabled={isDeletingActivity}
        >
          {isDeletingActivity ? 'Deleting...' : 'Delete activity'}
        </Button>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 3 },
          borderTop: 4,
          borderTopColor: 'primary.main',
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h1" sx={{ fontSize: { xs: 32, sm: 40 } }}>
                {formatType(activity.type)}
              </Typography>
              <Chip label={activity.id?.slice(0, 8) || 'Activity'} size="small" />
            </Stack>
            <Typography color="text.secondary">{formatDate(activity.startTime)}</Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            <DetailItem label="Duration" value={`${activity.duration || 0} min`} />
            <DetailItem label="Calories" value={activity.caloriesBurned || 0} />
            <DetailItem label="Updated" value={formatDate(activity.updatedAt)} />
          </Box>

          {activity.additionalMetrics &&
          Object.keys(activity.additionalMetrics).length > 0 ? (
            <Box>
              <Typography variant="h3" sx={{ mb: 1.5 }}>
                Additional metrics
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                  gap: 1,
                }}
              >
                {Object.entries(activity.additionalMetrics).map(([key, value]) => (
                  <Chip
                    key={key}
                    variant="outlined"
                    label={`${key}: ${String(value)}`}
                    sx={{ justifyContent: 'flex-start' }}
                  />
                ))}
              </Box>
            </Box>
          ) : null}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, overflow: 'hidden' }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h2">AI recommendations</Typography>
              <Typography color="text.secondary">
                Suggestions generated after AiService processes this activity.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              {recommendations.length > 0 ? (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDeleteRecommendations}
                  disabled={
                    isDeletingRecommendations ||
                    isLoadingRecommendations ||
                    isRegeneratingRecommendation
                  }
                >
                  {isDeletingRecommendations ? 'Deleting...' : 'Delete'}
                </Button>
              ) : null}
              <Button
                variant="contained"
                onClick={handleRegenerateRecommendation}
                disabled={
                  isLoadingRecommendations ||
                  isDeletingRecommendations ||
                  isRegeneratingRecommendation
                }
              >
                {isRegeneratingRecommendation ? 'Regenerating...' : 'Regenerate'}
              </Button>
              <Button
                variant="outlined"
                onClick={loadRecommendations}
                disabled={
                  isLoadingRecommendations ||
                  isDeletingRecommendations ||
                  isRegeneratingRecommendation
                }
              >
                {isLoadingRecommendations ? 'Checking...' : 'Refresh'}
              </Button>
            </Stack>
          </Stack>
          <Divider />

          {recommendationError ? (
            <Alert severity="warning">{recommendationError}</Alert>
          ) : null}

          {recommendations.length === 0 ? (
            <Typography color="text.secondary">
              Waiting for AiService. This can take a few seconds after saving an
              activity.
            </Typography>
          ) : (
            recommendations.map((item) => (
              <Stack key={item.id || item.activityId} spacing={2}>
                <AnalysisBlock value={item.recommendations} />
                <TextList title="Improvements" items={item.improvements} />
                <TextList title="Suggestions" items={item.suggestions} />
                <TextList title="Safety" items={item.safety} />
              </Stack>
            ))
          )}
        </Stack>
      </Paper>
    </Stack>
  )
}

export default ActivityDetail
