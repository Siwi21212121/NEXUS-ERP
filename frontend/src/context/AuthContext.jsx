import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const USERS_KEY = 'nexus_erp_users'
const SESSION_KEY = 'nexus_erp_session'

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || []
  } catch {
    return []
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const session =
        JSON.parse(localStorage.getItem(SESSION_KEY)) ||
        JSON.parse(localStorage.getItem('user'))

      if (session && session.role) {
        setUser(session)
      }
    } catch {
      // ignore corrupted session
    } finally {
      setLoading(false)
    }
  }, [])

  function signup({ name, email, password }) {
    const users = readUsers()
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (exists) {
      return { ok: false, error: 'An account with this email already exists.' }
    }
    const newUser = { name, email, password }
    writeUsers([...users, newUser])
    const session = { name, email, role: 'EMPLOYEE' }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setUser(session)
    return { ok: true }
  }

  function login({ email, password }) {
    const users = readUsers()
    const match = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!match) {
      return { ok: false, error: 'Invalid email or password.' }
    }
    const session = {
      name: match.name,
      email: match.email,
      role: match.role,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    localStorage.setItem('role', match.role)
    setUser(session)
    return { ok: true }
  }

  function setSession(session, token) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    localStorage.setItem('user', JSON.stringify(session))
    localStorage.setItem('role', session.role)

    if (token) {
      localStorage.setItem('token', token)
    }

    setUser(session)
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user')
    setUser(null)
  }

  const authValue = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    signup,
    login,
    setSession,
    logout,
  }

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
