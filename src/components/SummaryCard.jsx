export default function SummaryCard({ label, value, sub, tone = 'default' }) {
  return (
    <div className={`summary-card summary-card--${tone}`}>
      <div className="summary-card__label">{label}</div>
      <div className="summary-card__value">{value}</div>
      {sub != null && <div className="summary-card__sub">{sub}</div>}
    </div>
  )
}
