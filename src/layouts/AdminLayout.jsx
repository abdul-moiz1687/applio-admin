import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import AdminSidebar from '../components/AdminSidebar/AdminSidebar'
import AdminHeader from '../components/AdminHeader/AdminHeader'
import { EASE, prefersReducedMotion, settle } from '../motion/motion'

const COLLAPSED_KEY = 'applioAdminSidebarCollapsed'

export default function AdminLayout() {
  const { pathname } = useLocation()
  const [navOpen, setNavOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(() => window.localStorage.getItem(COLLAPSED_KEY) === '1')
  const contentRef = useRef(null)
  const firstRender = useRef(true)

  useEffect(() => {
    window.localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0')
  }, [collapsed])

  // Close the mobile drawer on Escape.
  useEffect(() => {
    if (!navOpen) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setNavOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [navOpen])

  // Short fade when the route changes. Not on the first render, and skipped for reduced motion.
  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return undefined
    }
    if (prefersReducedMotion() || !contentRef.current) return undefined
    const tween = gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.28, ease: EASE, clearProps: 'opacity,transform' },
    )
    return () => settle(tween)
  }, [pathname])

  return (
    <div className={`admin-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <AdminSidebar
        open={navOpen}
        collapsed={collapsed}
        onClose={() => setNavOpen(false)}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
      />
      <div className="admin-main">
        <AdminHeader onMenuClick={() => setNavOpen(true)} />
        <main id="main" className="admin-content" tabIndex={-1}>
          <div ref={contentRef} className="route-content">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
