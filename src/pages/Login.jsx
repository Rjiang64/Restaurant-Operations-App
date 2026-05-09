import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, loading, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    setErr('')
    setInfo('')
  }, [mode])

  if (!loading && user) return <Navigate to={from} replace />

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    setInfo('')
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate(from, { replace: true })
      } else {
        const { error, data } = await signUp(email, password)
        if (error) throw error
        if (data?.session) {
          navigate(from, { replace: true })
        } else {
          setInfo('Account created. Check your email to confirm, then sign in.')
          setMode('signin')
        }
      }
    } catch (e) {
      setErr(e.message || 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="brand-mark brand-mark--lg">KO</div>
          <div>
            <div className="auth-title">KitchenOps</div>
            <div className="auth-sub">Restaurant operations, simplified.</div>
          </div>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'signin' ? 'auth-tab--active' : ''}`}
            onClick={() => setMode('signin')}
            type="button"
          >
            Sign in
          </button>
          <button
            className={`auth-tab ${mode === 'signup' ? 'auth-tab--active' : ''}`}
            onClick={() => setMode('signup')}
            type="button"
          >
            Sign up
          </button>
        </div>

        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span className="field__label">Email</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="field">
            <span className="field__label">Password</span>
            <input
              className="input"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {err && <div className="alert alert--error">{err}</div>}
          {info && <div className="alert alert--info">{info}</div>}

          <button className="btn btn--primary btn--block" type="submit" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="auth-foot">
          Internal demo app. Use any email and a password of 6+ characters.
        </p>
      </div>
    </div>
  )
}
