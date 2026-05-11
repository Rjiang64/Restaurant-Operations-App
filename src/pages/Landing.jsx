import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// To use your own photo: save it as `public/restaurant.jpg` and change
// the src below to "/restaurant.jpg".
const HERO_IMAGE =
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1100&q=80'

const bullets = [
  'Track inventory before items run low',
  'Record lunch, dinner, takeout, and delivery sales',
  'Schedule shifts and review hours by pay period',
  'See labor cost and sales per labor hour',
  'Keep manager tasks in one place'
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="landing">
      {/* ---------- Navbar ---------- */}
      <header className="landing-nav">
        <Link to="/" className="landing-nav__brand">
          <div className="brand-mark">KO</div>
          <span className="landing-nav__name">KitchenOps</span>
        </Link>
        <div className="landing-nav__spacer" />
        <nav className="landing-nav__actions">
          {user ? (
            <Link className="btn btn--primary" to="/dashboard">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link className="btn btn--ghost landing-nav__signin" to="/login">
                Sign in
              </Link>
              <Link className="btn btn--primary" to="/login">
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="landing-hero">
        <div className="landing-hero__copy">
          <span className="landing-pill">Built for small restaurant teams</span>

          <h1 className="landing-hero__title">
            Restaurant operations without the spreadsheet mess.
          </h1>

          <p className="landing-hero__subtitle">
            KitchenOps helps small restaurant managers keep track of inventory,
            daily sales, staff shifts, biweekly timecards, labor reports, and
            manager tasks in one place.
          </p>

          <ul className="landing-hero__bullets">
            {bullets.map((b) => (
              <li key={b} className="landing-hero__bullet">
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <div className="landing-hero__cta">
            <Link className="btn btn--primary btn--lg" to={user ? '/dashboard' : '/login'}>
              {user ? 'Open dashboard' : 'Get started'}
            </Link>
            <p className="landing-hero__caption">
              Simple internal tools for day-to-day restaurant operations.
            </p>
          </div>
        </div>

        <figure className="landing-hero__image" aria-hidden="true">
          <img
            src={HERO_IMAGE}
            alt=""
            loading="lazy"
          />
        </figure>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="landing__footer">
        <div>© {new Date().getFullYear()} KitchenOps</div>
      </footer>
    </div>
  )
}
