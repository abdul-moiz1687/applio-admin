export default function StatCard({ label, value, hint, icon: Icon, unavailable = false }) {
  const shown = unavailable || value === null || value === undefined ? '—' : value
  return (
    <section className="stat-card" aria-labelledby={`stat-${label.replace(/\s+/g, '-').toLowerCase()}`}>
      <div className="stat-top">
        {Icon && (
          <span className="stat-icon" aria-hidden="true">
            <Icon size={18} />
          </span>
        )}
        <h2 className="stat-label" id={`stat-${label.replace(/\s+/g, '-').toLowerCase()}`}>{label}</h2>
      </div>
      <p className="stat-value" aria-live="polite">{shown}</p>
      <p className="stat-hint">{hint}</p>
    </section>
  )
}
