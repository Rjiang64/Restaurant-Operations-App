export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <div className="empty-state__title">{title}</div>
      {description && <div className="empty-state__desc">{description}</div>}
      {action}
    </div>
  )
}
