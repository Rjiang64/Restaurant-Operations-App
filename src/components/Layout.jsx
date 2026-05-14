import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo.jsx'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'D' },
  { to: '/inventory', label: 'Inventory', icon: 'I' },
  { to: '/sales',     label: 'Sales',     icon: 'S' },
  { to: '/shifts',    label: 'Shifts',    icon: 'H' },
  { to: '/tasks',     label: 'Tasks',     icon: 'T' },
  { to: '/reports',   label: 'Reports',   icon: 'R' }
]

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="layout">
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__brand">
          <Logo size={38} />
          <div>
            <div className="brand-title">Kitchen Manager</div>
            <div className="brand-sub">Operations console</div>
          </div>
        </div>
        <nav className="sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-link__icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__footer">
          <div className="user-chip" title={user?.email ?? ''}>
            <div className="user-chip__avatar">
              {(user?.email ?? '?').charAt(0).toUpperCase()}
            </div>
            <div className="user-chip__email">{user?.email}</div>
          </div>
          <button className="btn btn--ghost btn--block" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <button
            className="icon-btn topbar__menu"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
          <div className="topbar__title">Kitchen Manager</div>
          <div className="topbar__spacer" />
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
