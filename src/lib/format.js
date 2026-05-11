export function formatCurrency(value) {
  const n = Number(value ?? 0)
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export function formatDate(value) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function isoDaysFromNow(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// ---- Timecard helpers ----

// Returns minutes worked given HH:MM start/end and unpaid break minutes.
// Overnight shifts (end <= start) are interpreted as crossing midnight.
export function shiftMinutes(start, end, breakMin = 0) {
  if (!start || !end) return 0
  const [sh, sm] = String(start).split(':').map(Number)
  const [eh, em] = String(end).split(':').map(Number)
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return 0
  let mins = eh * 60 + em - (sh * 60 + sm)
  if (mins <= 0) mins += 24 * 60
  mins -= Number(breakMin || 0)
  return Math.max(0, mins)
}

export function minutesToHours(mins) {
  return Math.round((mins / 60) * 100) / 100
}

export function formatHours(mins) {
  const h = Math.floor(mins / 60)
  const m = Math.round(mins % 60)
  return `${h}h ${String(m).padStart(2, '0')}m`
}

export function formatTime12(t) {
  // "13:00" -> "1:00 PM"
  if (!t) return ''
  const [hStr, mStr = '00'] = String(t).split(':')
  const h = Number(hStr)
  if (Number.isNaN(h)) return t
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${mStr.padStart(2, '0')} ${period}`
}
