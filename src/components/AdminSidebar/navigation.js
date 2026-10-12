import { LayoutDashboard, Smartphone, Users, Wrench } from 'lucide-react'

/** Single source of truth for admin navigation. Every entry maps to a real route in App.jsx. */
export const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Management',
    items: [
      { to: '/users', label: 'Users', icon: Users },
      { to: '/appliances', label: 'Appliances', icon: Smartphone },
      { to: '/services', label: 'Service records', icon: Wrench },
    ],
  },
]
