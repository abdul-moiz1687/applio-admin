export const PAGE_SIZE = 10

export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

/** Shows cost as a number without assuming a currency; the backend's currency convention is unverified. */
export function formatAmount(value) {
  if (value === null || value === undefined || value === '') return '—'
  const number = Number(value)
  return Number.isFinite(number)
    ? number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : String(value)
}

/** @param {string[]} fields @param {string} query lowercase, already trimmed */
export function includesQuery(fields, query) {
  return fields.some((field) => String(field ?? '').toLowerCase().includes(query))
}

export function paginate(items, page, pageSize = PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const start = (safePage - 1) * pageSize
  return { items: items.slice(start, start + pageSize), page: safePage, pageCount }
}
