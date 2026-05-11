import Modal from './Modal.jsx'
import { formatDate } from '../lib/format'
import { formatCurrency } from '../lib/format'
import { formatHours, formatTime12, shiftMinutes } from '../lib/format'
import { formatPeriodLabel } from '../lib/payPeriod'

export default function EmployeeDetailModal({ open, onClose, employee, shifts, period }) {
  if (!employee) return null

  const rows = shifts.map((s) => {
    const mins = shiftMinutes(s.start_time, s.end_time, s.unpaid_break_minutes)
    return { ...s, _mins: mins }
  })
  const totalMins = rows.reduce((sum, r) => sum + r._mins, 0)
  const totalHours = totalMins / 60
  const estPay = employee.hourly_rate ? totalHours * Number(employee.hourly_rate) : null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${employee.name} — Timecard`}
    >
      <div className="timecard-detail">
        <div className="timecard-detail__head">
          <div>
            <div className="timecard-detail__name">{employee.name}</div>
            <div className="timecard-detail__sub">
              <span className="badge badge--neutral">{employee.title}</span>
              <span className="muted">Pay period: {formatPeriodLabel(period)}</span>
            </div>
          </div>
        </div>

        <div className="grid grid--cards" style={{ marginTop: 16 }}>
          <div className="summary-card summary-card--primary">
            <div className="summary-card__label">Shifts</div>
            <div className="summary-card__value">{rows.length}</div>
            <div className="summary-card__sub">In this pay period</div>
          </div>
          <div className="summary-card summary-card--accent">
            <div className="summary-card__label">Total Hours</div>
            <div className="summary-card__value">{formatHours(totalMins)}</div>
            <div className="summary-card__sub">After unpaid breaks</div>
          </div>
          <div className="summary-card summary-card--success">
            <div className="summary-card__label">Estimated Pay</div>
            <div className="summary-card__value">
              {estPay != null ? formatCurrency(estPay) : '—'}
            </div>
            <div className="summary-card__sub">
              {employee.hourly_rate
                ? `${formatCurrency(employee.hourly_rate)}/hr`
                : 'No hourly rate set'}
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <p className="muted" style={{ marginTop: 16 }}>
            No shifts scheduled for this employee in this pay period.
          </p>
        ) : (
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table className="table">
              <thead>
                <tr>
                  <th className="nowrap">Date</th>
                  <th className="nowrap">Start</th>
                  <th className="nowrap">End</th>
                  <th className="num">Break</th>
                  <th className="num">Hours</th>
                  <th className="nowrap">Role</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="nowrap">{formatDate(r.shift_date)}</td>
                    <td className="nowrap">{formatTime12(r.start_time)}</td>
                    <td className="nowrap">{formatTime12(r.end_time)}</td>
                    <td className="num">{r.unpaid_break_minutes || 0}m</td>
                    <td className="num">
                      <strong>{formatHours(r._mins)}</strong>
                    </td>
                    <td className="nowrap">
                      {r.role && <span className="badge badge--neutral">{r.role}</span>}
                    </td>
                    <td className="muted">{r.notes}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="muted">
                    Total
                  </td>
                  <td className="num">
                    <strong>{formatHours(totalMins)}</strong>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </Modal>
  )
}
