import { AlertTriangle } from 'lucide-react'
import Button from '../Button/Button'

export default function ErrorState({ error, onRetry, title = 'Something went wrong' }) {
  const message = error?.message || 'An unexpected error occurred.'
  return (
    <div className="error-state" role="alert">
      <AlertTriangle size={20} aria-hidden="true" />
      <div className="error-state-body">
        <strong>{title}</strong>
        <p>{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
