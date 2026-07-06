
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutGrid, Lock, Mail, User, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'

export default function Signup() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)

      const response = await axios.post(
        'http://localhost:5000/api/auth/signup',
        {
          name,
          email,
          password,
        }
      )

      console.log('Signup Success:', response.data)

      alert('Account created successfully!')

      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')

      navigate('/login')
    } catch (error) {
      console.error(error)

      setError(
        error.response?.data?.message ||
          'Signup failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-base flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-cyan/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center">
            <LayoutGrid size={18} className="text-white" />
          </div>

          <div>
            <p className="text-lg font-bold leading-tight">
              ClarioNex ERP
            </p>

            <p className="text-[11px] uppercase tracking-widest text-muted leading-tight">
              Enterprise Intelligence
            </p>
          </div>
        </div>

        <div className="bg-panel border border-line rounded-xl2 shadow-panel p-8">
          <h1 className="text-2xl font-bold">
            Create your account
          </h1>

          <p className="text-sm text-muted mt-1 mb-6">
            Set up access to your organization's command center.
          </p>

          {error && (
            <div className="mb-4 rounded-lg border border-danger/30 bg-danger/10 text-danger text-sm px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-medium text-muted mb-1.5"
                htmlFor="name"
              >
                Full name
              </label>

              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Julian Thorne"
                  className="w-full bg-panel2 border border-line rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-muted/60 focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-muted mb-1.5"
                htmlFor="email"
              >
                Work email
              </label>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />

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
              <label
                className="block text-xs font-medium text-muted mb-1.5"
                htmlFor="password"
              >
                Password
              </label>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-panel2 border border-line rounded-lg pl-9 pr-9 py-2.5 text-sm text-white placeholder:text-muted/60 focus:border-accent transition-colors"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-muted mb-1.5"
                htmlFor="confirmPassword"
              >
                Confirm password
              </label>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />

                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Re-enter your password"
                  className="w-full bg-panel2 border border-line rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-muted/60 focus:border-accent transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accent/90 transition-colors text-white font-semibold rounded-lg py-2.5 text-sm disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-muted text-center mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-accent hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          ClarioNex Enterprise Resource Planning · V4.2.0
        </p>
      </div>
    </div>
  )
}
