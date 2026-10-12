import { NavLink } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'
import { useAdminAuth } from '../../context/useAdminAuth'
import { NAV_GROUPS } from './navigation'

export default function AdminSidebar({ open, collapsed, onClose, onToggleCollapsed }) {
  const { user, logout } = useAdminAuth()
  const displayName = user?.name || user?.email || 'Administrator'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <>
      <div className={`sidebar-scrim ${open ? 'is-visible' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'is-open' : ''} ${collapsed ? 'is-collapsed' : ''}`} aria-label="Primary">
        <div className="sidebar-brand">
          <span className="brand-mark" aria-hidden="true">A</span>
          <div className="brand-text">
            <span className="brand-name">APPLIO</span>
            <span className="brand-tag">Admin console</span>
          </div>
          <button type="button" className="icon-btn sidebar-close" onClick={onClose} aria-label="Close navigation">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="nav-group">
              <p className="nav-group-label">{group.label}</p>
              <ul className="nav-list">
                {group.items.map(({ to, label, icon: Icon }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      title={collapsed ? label : undefined}
                      aria-label={collapsed ? label : undefined}
                      className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
                      onClick={onClose}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span className="nav-label">{label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="profile">
            <span className="avatar" aria-hidden="true">{initial}</span>
            <div className="profile-text">
              <strong>{displayName}</strong>
              {user?.email && <span>{user.email}</span>}
            </div>
            <button type="button" className="icon-btn" onClick={logout} aria-label="Sign out" title="Sign out">
              <LogOut size={16} aria-hidden="true" />
            </button>
          </div>
          <button
            type="button"
            className="collapse-toggle"
            onClick={onToggleCollapsed}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <span className="nav-label">{collapsed ? 'Expand' : 'Collapse'} sidebar</span>
          </button>
        </div>
      </aside>
    </>
  )
}
