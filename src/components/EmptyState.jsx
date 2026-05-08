export default function EmptyState({ title, description, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state__title">{title}</div>
      {description && <div className="empty-state__desc">{description}</div>}
      {action}
    </div>
  )
}
