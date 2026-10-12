import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import LoadingState from './components/LoadingState/LoadingState'
import Login from './pages/Login/Login'
import NotFound from './pages/NotFound/NotFound'

// Management pages and the layout (which pulls in GSAP) load on demand, keeping the login screen light.
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const Users = lazy(() => import('./pages/Users/Users'))
const Appliances = lazy(() => import('./pages/Appliances/Appliances'))
const ServiceRecords = lazy(() => import('./pages/ServiceRecords/ServiceRecords'))

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="route-fallback">
          <LoadingState label="Loading…" />
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/appliances" element={<Appliances />} />
            <Route path="/services" element={<ServiceRecords />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
