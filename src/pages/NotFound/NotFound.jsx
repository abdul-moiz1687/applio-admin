import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">404</p>
        <h1>Page not found</h1>
        <p className="muted">The page you requested does not exist in the Admin console.</p>
        <Link to="/dashboard" className="btn btn-primary btn-md">Back to dashboard</Link>
      </div>
    </div>
  )
}
