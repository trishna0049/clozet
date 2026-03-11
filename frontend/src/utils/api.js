import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
})

// Inject token from localStorage
api.interceptors.request.use((config) => {
  try {
    const auth = JSON.parse(localStorage.getItem('clozet-auth') || '{}')
    const token = auth?.state?.token
    if (token) config.headers.Authorization = `Bearer ${token}`
  } catch (e) {}
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('clozet-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
