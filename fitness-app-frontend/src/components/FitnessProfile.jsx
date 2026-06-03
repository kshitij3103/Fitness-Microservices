import { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
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
import { getUserProfile, updateFitnessProfile } from '../services/api'

const goals = [
  ['GENERAL_FITNESS', 'General fitness'],
  ['FAT_LOSS', 'Fat loss'],
  ['MUSCLE_GAIN', 'Muscle gain'],
  ['ENDURANCE', 'Endurance'],
  ['STRENGTH', 'Strength'],
]

const experienceLevels = [
  ['BEGINNER', 'Beginner'],
  ['INTERMEDIATE', 'Intermediate'],
  ['ADVANCED', 'Advanced'],
]

const initialForm = {
  age: '',
  heightCm: '',
  weightKg: '',
  fitnessGoal: 'GENERAL_FITNESS',
  experienceLevel: 'BEGINNER',
}

const FitnessProfile = () => {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { token, userId } = useSelector((state) => state.auth)

  const loadProfile = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const profile = await getUserProfile({ token, userId })
      setForm({
        age: profile.age ?? '',
        heightCm: profile.heightCm ?? '',
        weightKg: profile.weightKg ?? '',
        fitnessGoal: profile.fitnessGoal || 'GENERAL_FITNESS',
        experienceLevel: profile.experienceLevel || 'BEGINNER',
      })
    } catch (err) {
      setError(err.message || 'Could not load profile')
    } finally {
      setIsLoading(false)
    }
  }, [token, userId])

  useEffect(() => {
    const timer = window.setTimeout(loadProfile, 0)
    return () => window.clearTimeout(timer)
  }, [loadProfile])

  const updateField = (field) => (event) => {
    setSuccess('')
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSaving(true)

    try {
      await updateFitnessProfile(
        {
          age: form.age ? Number(form.age) : null,
          heightCm: form.heightCm ? Number(form.heightCm) : null,
          weightKg: form.weightKg ? Number(form.weightKg) : null,
          fitnessGoal: form.fitnessGoal,
          experienceLevel: form.experienceLevel,
        },
        { token, userId },
      )
      setSuccess('Profile saved. New AI recommendations will use it.')
    } catch (err) {
      setError(err.message || 'Could not save profile')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, md: 3 },
        borderTop: 4,
        borderTopColor: 'secondary.main',
      }}
    >
      <Stack spacing={3} component="form" onSubmit={handleSubmit}>
        <Box>
          <Typography variant="h2" sx={{ mb: 0.5 }}>
            Fitness profile
          </Typography>
          <Typography color="text.secondary">
            Used by AiService to personalize workout recommendations.
          </Typography>
        </Box>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {success ? <Alert severity="success">{success}</Alert> : null}

        {isLoading ? (
          <Box sx={{ py: 3, display: 'grid', placeItems: 'center' }}>
            <CircularProgress size={24} color="inherit" />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' },
                gap: 2,
              }}
            >
              <TextField
                label="Age"
                type="number"
                value={form.age}
                onChange={updateField('age')}
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Height"
                type="number"
                value={form.heightCm}
                onChange={updateField('heightCm')}
                inputProps={{ min: 1, step: 0.1 }}
                helperText="cm"
              />
              <TextField
                label="Weight"
                type="number"
                value={form.weightKg}
                onChange={updateField('weightKg')}
                inputProps={{ min: 1, step: 0.1 }}
                helperText="kg"
              />
              <FormControl fullWidth>
                <InputLabel id="fitness-goal-label">Goal</InputLabel>
                <Select
                  labelId="fitness-goal-label"
                  label="Goal"
                  value={form.fitnessGoal}
                  onChange={updateField('fitnessGoal')}
                >
                  {goals.map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="experience-level-label">Experience</InputLabel>
                <Select
                  labelId="experience-level-label"
                  label="Experience"
                  value={form.experienceLevel}
                  onChange={updateField('experienceLevel')}
                >
                  {experienceLevels.map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSaving}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {isSaving ? 'Saving...' : 'Save profile'}
              </Button>
            </Box>
          </>
        )}
      </Stack>
    </Paper>
  )
}

export default FitnessProfile
