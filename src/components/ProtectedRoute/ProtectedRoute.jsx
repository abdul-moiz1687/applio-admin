import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/useAdminAuth'

export default function ProtectedRoute() {
  const { isAuthenticated } = useAdminAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
