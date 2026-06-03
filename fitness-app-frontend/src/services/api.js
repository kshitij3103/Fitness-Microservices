const request = async (path, { token, userId, method = 'GET', body } = {}) => {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  if (userId) {
    headers['X-User-ID'] = userId
  }

  const response = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export const getActivities = (auth) => request('/api/activities', auth)

export const getActivity = (activityId, auth) =>
  request(`/api/activities/${activityId}`, auth)

export const createActivity = (activity, auth) =>
  request('/api/activities', {
    ...auth,
    method: 'POST',
    body: activity,
  })

export const getUserProfile = (auth) => request('/api/users/profile', auth)

export const updateFitnessProfile = (profile, auth) =>
  request('/api/users/profile', {
    ...auth,
    method: 'PUT',
    body: profile,
  })

export const deleteActivity = (activityId, auth) =>
  request(`/api/activities/${activityId}`, {
    ...auth,
    method: 'DELETE',
  })

export const getActivityRecommendations = (activityId, auth) =>
  request(`/api/recommendations/activity/${activityId}`, auth)

export const regenerateActivityRecommendation = (activityId, auth) =>
  request(`/api/recommendations/activity/${activityId}/regenerate`, {
    ...auth,
    method: 'POST',
  })

export const deleteActivityRecommendations = (activityId, auth) =>
  request(`/api/recommendations/activity/${activityId}`, {
    ...auth,
    method: 'DELETE',
  })

export const getUserRecommendations = (userId, auth) =>
  request(`/api/recommendations/user/${userId}`, auth)
