import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
})

function clearAuthSession() {
  localStorage.removeItem('nexus_erp_session')
  localStorage.removeItem('clarionex_erp_session')
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('user')
  window.dispatchEvent(new Event('auth:logout'))
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message

    if (status === 401 && (message === 'Invalid token' || message === 'No token provided')) {
      clearAuthSession()
      if (window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
    }

    return Promise.reject(error)
  }
)

export default api
