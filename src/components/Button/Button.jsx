import { forwardRef } from 'react'

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled = false, icon: Icon, children, className = '', type = 'button', ...rest },
  ref,
) {
  const classes = ['btn', `btn-${variant}`, `btn-${size}`, loading ? 'is-loading' : '', className].filter(Boolean).join(' ')
  const iconSize = size === 'sm' ? 14 : 16
  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <span className="spinner" aria-hidden="true" /> : Icon ? <Icon size={iconSize} aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  )
})

export default Button
