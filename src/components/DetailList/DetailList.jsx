export default function DetailList({ items }) {
  return (
    <dl className="detail-list">
      {items.map(({ label, value }) => (
        <div key={label} className="detail-item">
          <dt>{label}</dt>
          <dd>{value === null || value === undefined || value === '' ? '—' : value}</dd>
        </div>
      ))}
    </dl>
  )
}
