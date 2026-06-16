import { useMemo } from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export default function useRole() {
  const { user } = useAuth()

  const role = useMemo(() => {
    if (user?.role) return user.role

    try {
      const storedRole = localStorage.getItem('role')
      const storedUser = JSON.parse(localStorage.getItem('user'))

      return storedRole || storedUser?.role || null
    } catch {
      return localStorage.getItem('role')
    }
  }, [user?.role])

  return {
    role,
    isOwner: role === 'OWNER',
    isHR: role === 'HR_MANAGER',
    isFinance: role === 'FINANCE_MANAGER',
    isProjectManager: role === 'PROJECT_MANAGER',
    isEmployee: role === 'EMPLOYEE',
  }
}
