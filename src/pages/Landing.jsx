import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthForm from '../components/AuthForm.jsx'
import Logo from '../components/Logo.jsx'

// To use your own photo instead: save it as `public/restaurant.jpg`
// and change the value below to "/restaurant.jpg".
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80'

export default function Landing() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  if (loading) {
    return (
      <div className="full-screen-center">
        <div className="spinner" />
      </div>
    )
  }

  // Signed-in users go straight to their dashboard.
  if (user) return <Navigate to={from} replace />

  return (
    <div className="auth-split">
      {/* ---------- Left: image + overlay text ---------- */}
      <aside className="auth-image">
        <img className="auth-image__bg" src={HERO_IMAGE} alt="" />
        <div className="auth-image__overlay" aria-hidden="true" />
        <div className="auth-image__content">
          <div className="auth-image__brand">
            <Logo size={52} />
            <span className="auth-image__wordmark">Kitchen Manager</span>
          </div>

          <div className="auth-image__center">
            <h1 className="auth-image__title">Kitchen Manager</h1>
            <p className="auth-image__subtitle">
              Perform restaurant operations without the spreadsheet mess. Keep
              track of inventory, daily sales, staff shifts, biweekly timecards,
              labor reports, and manager tasks in one place.
            </p>
          </div>

          <div className="auth-image__foot">
            © {new Date().getFullYear()} Kitchen Manager
          </div>
        </div>
      </aside>

      {/* ---------- Right: auth panel ---------- */}
      <main className="auth-panel">
        <AuthForm />
      </main>
    </div>
  )
}
