import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAdminAuth } from '../../context/useAdminAuth'
import Button from '../../components/Button/Button'

export default function Login() {
  const { isAuthenticated, login, notice, clearNotice } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={location.state?.from || '/dashboard'} replace />
  }

  const validate = () => {
    const next = {}
    if (!email.trim()) next.email = 'Enter your administrator email.'
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address.'
    if (!password) next.password = 'Enter your password.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (submitting) return
    clearNotice()
    setFormError(null)
    if (!validate()) return
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate(location.state?.from || '/dashboard', { replace: true })
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card login-card">
        <div className="auth-brand">
          <span className="brand-mark" aria-hidden="true">A</span>
          <div className="brand-text">
            <span className="brand-name">APPLIO</span>
            <span className="brand-tag">Admin console</span>
          </div>
        </div>

        <h1>Administrator sign in</h1>
        <p className="muted">Access is limited to accounts authorised by APPLIO.</p>

        {notice && <div className="alert alert-info" role="status">{notice}</div>}
        {formError && <div className="alert alert-error" role="alert">{formError}</div>}

        <form onSubmit={handleSubmit} noValidate className="form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              disabled={submitting}
              autoFocus
            />
            {errors.email && <p id="email-error" className="field-error">{errors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
                disabled={submitting}
              />
              <button
                type="button"
                className="icon-btn password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                disabled={submitting}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            {errors.password && <p id="password-error" className="field-error">{errors.password}</p>}
          </div>

          <Button type="submit" variant="primary" size="lg" className="btn-block" loading={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
