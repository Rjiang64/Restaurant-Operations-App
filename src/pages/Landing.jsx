import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    icon: 'I',
    tone: 'default',
    title: 'Inventory tracking',
    desc: 'Stock levels, reorder thresholds, and supplier info — with low-stock alerts at a glance.'
  },
  {
    icon: 'S',
    tone: 'accent',
    title: 'Daily sales',
    desc: 'Lunch, dinner, takeout, and delivery captured per day with auto-calculated totals and month filters.'
  },
  {
    icon: 'H',
    tone: 'default',
    title: 'Shift scheduling',
    desc: 'Schedule employees by date, time, and role. Filter by day to plan coverage at a glance.'
  },
  {
    icon: 'T',
    tone: 'success',
    title: 'Tasks & checklists',
    desc: 'Track manager follow-ups by priority and due date. Toggle complete inline.'
  },
  {
    icon: 'R',
    tone: 'accent',
    title: 'Reports',
    desc: 'Sales trend, channel breakdown, shifts by role, and low-stock summary — all live.'
  },
  {
    icon: '✓',
    tone: 'success',
    title: 'Secure by default',
    desc: 'Email auth via Supabase. Postgres row-level security keeps every account isolated.'
  }
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="landing">
      <header className="landing__nav">
        <Link to="/" className="landing__brand">
          <div className="brand-mark">KO</div>
          <div>
            <div className="landing__brand-name">KitchenOps</div>
            <div className="landing__brand-tag">Restaurant operations, simplified.</div>
          </div>
        </Link>
        <div className="landing__nav-spacer" />
        {user ? (
          <Link className="btn btn--primary" to="/dashboard">
            Open dashboard
          </Link>
        ) : (
          <>
            <Link className="btn btn--ghost" to="/login">
              Sign in
            </Link>
            <Link className="btn btn--primary" to="/login">
              Get started
            </Link>
          </>
        )}
      </header>

      <section className="landing__hero">
        <span className="landing__eyebrow">For restaurant managers</span>
        <h1 className="landing__title">
          Run your restaurant{' '}
          <span className="landing__title-accent">on one page.</span>
        </h1>
        <p className="landing__subtitle">
          KitchenOps replaces spreadsheets and clipboard sheets with a clean internal
          dashboard for inventory, daily sales, staff shifts, and operational tasks.
        </p>
        <div className="landing__ctas">
          {user ? (
            <Link className="btn btn--primary btn--lg" to="/dashboard">
              Open dashboard
            </Link>
          ) : (
            <>
              <Link className="btn btn--primary btn--lg" to="/login">
                Get started — it's free
              </Link>
              <a
                className="btn btn--ghost btn--lg"
                href="https://github.com/Rjiang64/Restaurant-Operations-App"
                target="_blank"
                rel="noreferrer"
              >
                View source on GitHub
              </a>
            </>
          )}
        </div>
      </section>

      <section className="landing__features">
        <div className="landing__features-grid">
          {features.map((f) => (
            <article key={f.title} className={`feature-card feature-card--${f.tone}`}>
              <div className="feature-card__icon">{f.icon}</div>
              <div className="feature-card__title">{f.title}</div>
              <div className="feature-card__desc">{f.desc}</div>
            </article>
          ))}
        </div>
      </section>

      <footer className="landing__footer">
        <div>© {new Date().getFullYear()} KitchenOps · Portfolio project</div>
        <div>
          Built with React, Supabase &amp; Vercel ·{' '}
          <a
            className="link"
            href="https://github.com/Rjiang64/Restaurant-Operations-App"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  )
}
