export default function StatusBadge({ children, tone = 'muted' }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}
