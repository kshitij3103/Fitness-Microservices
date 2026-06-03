import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useSelector } from 'react-redux'
import { createActivity } from '../services/api'

const activityTypes = [
  'RUNNING',
  'WALKING',
  'CYCLING',
  'SWIMMING',
  'WEIGHT_TRAINING',
  'YOGA',
  'HIIT',
  'CARDIO',
  'STRETCHING',
  'OTHER',
]

const initialForm = {
  type: 'RUNNING',
  duration: '',
  caloriesBurned: '',
  startTime: '',
  distance: '',
  intensity: '',
  notes: '',
}

const labelForType = (value) =>
  value
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const toLocalDateTime = (value) => {
  if (!value) {
    return null
  }

  return value.length === 16 ? `${value}:00` : value
}

const ActivityForm = ({ onActivityAdded }) => {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { token, userId } = useSelector((state) => state.auth)

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const additionalMetrics = {}
    if (form.distance) {
      additionalMetrics.distance = Number(form.distance)
    }
    if (form.intensity) {
      additionalMetrics.intensity = form.intensity
    }
    if (form.notes) {
      additionalMetrics.notes = form.notes
    }

    try {
      await createActivity(
        {
          userId,
          type: form.type,
          duration: Number(form.duration),
          caloriesBurned: Number(form.caloriesBurned),
          startTime: toLocalDateTime(form.startTime) || new Date().toISOString().slice(0, 19),
          additionalMetrics,
        },
        { token, userId },
      )
      setForm(initialForm)
      onActivityAdded?.()
      window.dispatchEvent(new Event('activity-created'))
    } catch (err) {
      setError(err.message || 'Could not save activity')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, md: 3 },
        borderTop: 4,
        borderTopColor: 'primary.main',
      }}
    >
      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        <Box>
          <Typography variant="h2" sx={{ mb: 0.5 }}>
            Add activity
          </Typography>
          <Typography color="text.secondary">
            Keep the log simple. Add the basics, and the AI service can handle
            recommendations after processing.
          </Typography>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          <FormControl fullWidth>
            <InputLabel id="activity-type-label">Activity type</InputLabel>
            <Select
              labelId="activity-type-label"
              label="Activity type"
              value={form.type}
              onChange={updateField('type')}
            >
              {activityTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {labelForType(type)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Duration"
            type="number"
            value={form.duration}
            onChange={updateField('duration')}
            required
            inputProps={{ min: 1 }}
            helperText="Minutes"
          />

          <TextField
            label="Calories burned"
            type="number"
            value={form.caloriesBurned}
            onChange={updateField('caloriesBurned')}
            required
            inputProps={{ min: 0 }}
          />

          <TextField
            label="Start time"
            type="datetime-local"
            value={form.startTime}
            onChange={updateField('startTime')}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Distance"
            type="number"
            value={form.distance}
            onChange={updateField('distance')}
            inputProps={{ min: 0, step: 0.1 }}
            helperText="Optional"
          />

          <TextField
            label="Intensity"
            value={form.intensity}
            onChange={updateField('intensity')}
            placeholder="Easy, moderate, hard"
          />
        </Box>

        <TextField
          label="Notes"
          value={form.notes}
          onChange={updateField('notes')}
          multiline
          minRows={2}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {isSubmitting ? 'Saving...' : 'Save activity'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  )
}

export default ActivityForm
