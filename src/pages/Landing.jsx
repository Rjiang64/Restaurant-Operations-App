import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    tag: 'IN',
    tone: 'primary',
    title: 'Inventory tracking',
    desc: 'Track stock by item, unit, supplier, and cost. Items at or below their reorder level get flagged on the dashboard.'
  },
  {
    tag: 'SA',
    tone: 'accent',
    title: 'Daily sales records',
    desc: 'Record daily sales by lunch, dinner, takeout, and delivery. The day total rolls up automatically.'
  },
  {
    tag: 'SH',
    tone: 'primary',
    title: 'Shift scheduling',
    desc: 'Schedule shifts by date, time, and role. Filter by day to plan coverage at a glance.'
  },
  {
    tag: 'TC',
    tone: 'accent',
    title: 'Biweekly timecards',
    desc: 'Monday-anchored two-week pay periods. Hours, unpaid breaks, and estimated pay per employee, plus a CSV export.'
  },
  {
    tag: 'LR',
    tone: 'primary',
    title: 'Labor reports',
    desc: 'See labor cost as a percent of sales, sales per labor hour, hours by role, and an employee leaderboard for any period.'
  },
  {
    tag: 'TA',
    tone: 'accent',
    title: 'Manager tasks',
    desc: 'Keep manager tasks in one place by priority, category, and due date. Toggle complete inline.'
  }
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
            KitchenOps helps small restaurant managers track inventory, sales,
            shifts, timecards, labor reports, and daily tasks in one place.
          </p>
          <div className="landing-hero__ctas">
            {user ? (
              <Link className="btn btn--primary btn--lg" to="/dashboard">
                Open dashboard
              </Link>
            ) : (
              <>
                <Link className="btn btn--primary btn--lg" to="/login">
                  Get started
                </Link>
                <a
                  className="btn btn--ghost btn--lg"
                  href="https://github.com/Rjiang64/Restaurant-Operations-App"
                  target="_blank"
                  rel="noreferrer"
                >
                  View GitHub
                </a>
              </>
            )}
          </div>
        </div>

        <div className="landing-hero__preview" aria-hidden="true">
          <PreviewCard />
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="landing-section">
        <div className="landing-section__head">
          <h2 className="landing-section__title">What's inside</h2>
          <p className="landing-section__sub">
            Six modules, built around how a manager actually closes out a day.
          </p>
        </div>
        <div className="landing-features">
          {features.map((f) => (
            <article key={f.title} className="landing-feature">
              <span className={`landing-feature__tag landing-feature__tag--${f.tone}`}>
                {f.tag}
              </span>
              <h3 className="landing-feature__title">{f.title}</h3>
              <p className="landing-feature__desc">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------- Story ---------- */}
      <section className="landing-story">
        <div className="landing-story__inner">
          <h2 className="landing-section__title">Built from real restaurant workflows</h2>
          <p className="landing-story__text">
            This project was inspired by real small-restaurant operations: checking
            stock before lunch, recording the daily sales split at close, planning
            shifts for a two-week period, and keeping track of the manager tasks that
            normally live on a clipboard or a sticky note.
          </p>
          <p className="landing-story__text">
            The data model and screens follow how shift managers actually run a day —
            lunch and dinner split, reorder thresholds, Monday-anchored biweekly pay
            periods, labor cost as a percent of sales. It's a portfolio project,
            focused on the parts that matter, with no enterprise scaffolding.
          </p>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
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

/* -------------------------------------------------------------
   PreviewCard
   A static, believable mini-dashboard. Realistic numbers, no
   animation, no fake claims. Designed to look like a screenshot
   of the real app, not a marketing illustration.
------------------------------------------------------------- */
function PreviewCard() {
  return (
    <div className="preview-card">
      <div className="preview-card__chrome">
        <span className="preview-card__dot" />
        <span className="preview-card__dot" />
        <span className="preview-card__dot" />
        <span className="preview-card__crumb">kitchenops · Dashboard · Today</span>
      </div>
      <div className="preview-card__body">
        <div className="preview-card__grid">
          <div className="preview-stat preview-stat--primary">
            <div className="preview-stat__label">Today's Sales</div>
            <div className="preview-stat__value">$3,610</div>
            <svg
              className="preview-spark"
              viewBox="0 0 100 24"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polyline
                points="0,18 10,15 20,13 30,14 40,10 50,8 60,11 70,6 80,9 90,4 100,7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="preview-stat">
            <div className="preview-stat__label">Labor % of Sales</div>
            <div className="preview-stat__value">28.4%</div>
            <div className="preview-stat__sub">Within 25–35%</div>
          </div>
          <div className="preview-stat">
            <div className="preview-stat__label">Low Stock</div>
            <div className="preview-stat__value">5 items</div>
            <div className="preview-stat__sub preview-stat__sub--warn">Reorder list ready</div>
          </div>
          <div className="preview-stat">
            <div className="preview-stat__label">Upcoming Shifts</div>
            <div className="preview-stat__value">12</div>
            <div className="preview-stat__sub">Next 7 days</div>
          </div>
        </div>

        <div className="preview-tasks">
          <div className="preview-tasks__head">
            <span>Tasks due</span>
            <span className="preview-tasks__count">3 open</span>
          </div>
          <ul className="preview-tasks__list">
            <li>
              <span className="preview-dot preview-dot--high" />
              <span className="preview-tasks__name">Order produce — Local Farms</span>
              <span className="preview-tasks__when">Today</span>
            </li>
            <li>
              <span className="preview-dot preview-dot--high" />
              <span className="preview-tasks__name">Schedule next 2-week period</span>
              <span className="preview-tasks__when">Tomorrow</span>
            </li>
            <li>
              <span className="preview-dot preview-dot--med" />
              <span className="preview-tasks__name">Deep clean walk-in cooler</span>
              <span className="preview-tasks__when">Fri</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
