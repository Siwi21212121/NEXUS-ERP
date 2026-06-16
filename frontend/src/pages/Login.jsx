import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutGrid, Lock, Mail, Eye, EyeOff } from 'lucide-react'
import axios from "axios"
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
 
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
  e.preventDefault()

  setError('')

  if (!email || !password) {
    setError('Please enter your email and password.')
    return
  }

  try {

    setLoading(true)

    const response = await axios.post(
      'http://localhost:5000/api/auth/login',
      {
        email,
        password,
      }
    )

    setSession(response.data.user, response.data.token)

    navigate('/dashboard', {
      replace: true,
    })

  } catch (error) {

    console.error(error)

    setError(
      error.response?.data?.message ||
      'Login Failed'
    )

  } finally {

    setLoading(false)

  }
}

  return (
    <div className="min-h-screen w-full bg-base flex items-center justify-center px-4 relative overflow-hidden">
      {/* Ambient background grid + glow */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-cyan/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
            <LayoutGrid size={18} className="text-white" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">Nexus ERP</p>
            <p className="text-[11px] uppercase tracking-widest text-muted leading-tight">
              Global Command
            </p>
          </div>
        </div>

        <div className="bg-panel border border-line rounded-xl2 shadow-panel p-8">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted mt-1 mb-6">
            Sign in to access your Enterprise Intelligence Center.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 text-danger text-sm px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-panel2 border border-line rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-muted/60 focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-panel2 border border-line rounded-lg pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-muted/60 focus:border-accent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted">
                <input type="checkbox" className="rounded border-line bg-panel2 accent-accent" />
                Remember me
              </label>
              <a href="#" className="text-accent hover:underline">
                Forgot password?
              </a>
            </div>

            <button
  type="submit"
  disabled={loading}
  className="w-full bg-accent hover:bg-accent/90 transition-colors text-white font-semibold rounded-lg py-2.5 text-sm disabled:opacity-50"
>
  {loading
    ? 'Signing In...'
    : 'Sign in'}
</button>
          </form>

          <p className="text-sm text-muted text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-accent hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          Nexus Enterprise Resource Planning &middot; V4.2.0
        </p>
      </div>
    </div>
  )
}
