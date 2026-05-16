import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthForm() {
  const { signIn, signUp } = useAuth()
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
    <div className="auth-panel__inner">
      <div className="auth-panel__head">
        <h2 className="auth-panel__title">
          {mode === 'signin' ? 'Sign in' : 'Create your account'}
        </h2>
        <p className="auth-panel__sub">
          {mode === 'signin'
            ? 'Welcome back. Enter your details to continue.'
            : 'Set up a new account to get started.'}
        </p>
      </div>

      <div className="auth-tabs">
        <button
          type="button"
          className={`auth-tab ${mode === 'signin' ? 'auth-tab--active' : ''}`}
          onClick={() => setMode('signin')}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`auth-tab ${mode === 'signup' ? 'auth-tab--active' : ''}`}
          onClick={() => setMode('signup')}
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

        <button
          className="btn btn--primary btn--block btn--lg"
          type="submit"
          disabled={busy}
        >
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>

    </div>
  )
}
