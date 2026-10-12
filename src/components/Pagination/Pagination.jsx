export default function Pagination({ page, pageCount, total, pageSize, onPageChange }) {
  if (total === 0) return null
  const start = (page - 1) * pageSize + 1
  const end = Math.min(total, page * pageSize)

  return (
    <nav className="pagination" aria-label="Table pagination">
      <span className="muted">
        Showing {start}–{end} of {total}
      </span>
      <div className="pagination-controls">
        <button type="button" className="btn btn-ghost" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </button>
        <span className="muted">Page {page} of {pageCount}</span>
        <button type="button" className="btn btn-ghost" onClick={() => onPageChange(page + 1)} disabled={page >= pageCount}>
          Next
        </button>
      </div>
    </nav>
  )
}
