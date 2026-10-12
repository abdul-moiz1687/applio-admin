import { useEffect, useRef, useState } from 'react'
import { ChevronDown, LogOut, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/useAdminAuth'
import { NAV_GROUPS } from '../AdminSidebar/navigation'

const ALL_ITEMS = NAV_GROUPS.flatMap((group) => group.items)

export default function AdminHeader({ onMenuClick }) {
  const { user, logout } = useAdminAuth()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined
    const onDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  const current = ALL_ITEMS.find((item) => pathname.startsWith(item.to))
  const displayName = user?.name || user?.email || 'Administrator'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <header className="admin-header">
      <button type="button" className="icon-btn menu-btn" onClick={onMenuClick} aria-label="Open navigation">
        <Menu size={20} aria-hidden="true" />
      </button>
      <p className="header-title">{current?.label ?? 'Admin'}</p>
      <div className="header-spacer" />
      <div className="account" ref={menuRef}>
        <button
          ref={triggerRef}
          type="button"
          className="account-trigger"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="avatar" aria-hidden="true">{initial}</span>
          <span className="account-name">{displayName}</span>
          <ChevronDown size={16} aria-hidden="true" className={menuOpen ? 'chevron-open' : ''} />
        </button>
        {menuOpen && (
          <div className="account-menu" role="menu">
            <div className="account-meta">
              <strong>{displayName}</strong>
              {user?.email && <span>{user.email}</span>}
            </div>
            <button type="button" role="menuitem" className="menu-item" onClick={logout}>
              <LogOut size={16} aria-hidden="true" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
