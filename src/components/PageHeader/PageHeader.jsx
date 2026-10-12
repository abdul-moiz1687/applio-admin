export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="page-header" data-reveal="intro">
      <div className="page-heading">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="muted">{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  )
}
