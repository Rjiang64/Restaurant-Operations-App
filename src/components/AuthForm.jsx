import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthForm() {
  const { signIn, signUp, signInWithGoogle } = useAuth()
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

  async function onGoogle() {
    setBusy(true)
    setErr('')
    setInfo('')
    const { error } = await signInWithGoogle()
    // If the call kicks off a browser redirect, this component unmounts.
    // We only reach the next lines if Supabase returned an error first.
    if (error) {
      setErr(error.message)
      setBusy(false)
    }
  }

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

      <button
        type="button"
        className="btn btn--google btn--block btn--lg"
        onClick={onGoogle}
        disabled={busy}
      >
        <GoogleIcon />
        Continue with Google
      </button>

      <div className="auth-divider"><span>or continue with email</span></div>

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

function GoogleIcon() {
  return (
    <svg
      className="btn--google__icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width="18"
      height="18"
      aria-hidden="true"
    >
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}
