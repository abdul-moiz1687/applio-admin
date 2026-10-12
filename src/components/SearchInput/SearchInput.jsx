import { Search, X } from 'lucide-react'

export default function SearchInput({ value, onChange, placeholder, label }) {
  return (
    <div className="search-input">
      <Search size={16} aria-hidden="true" />
      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button type="button" className="icon-btn search-clear" onClick={() => onChange('')} aria-label="Clear search">
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
