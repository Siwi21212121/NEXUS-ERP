import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const { loading } = useAuth()
  const token = localStorage.getItem('token')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base text-white">
        Loading authentication...
      </div>
    )
  }

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return children
}
