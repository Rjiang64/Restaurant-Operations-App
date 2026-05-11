// Pay period logic — Monday-anchored, 14 days.
//
// We anchor the entire biweekly grid to a fixed Monday far in the past
// (2024-01-01 was a Monday). Any date in history or future maps to
// exactly one pay period via integer division on the day delta.

const ANCHOR = new Date(Date.UTC(2024, 0, 1)) // 2024-01-01 (Monday) in UTC
const MS_PER_DAY = 1000 * 60 * 60 * 24
const PERIOD_DAYS = 14

function toUTCDate(d) {
  // Normalize any date to UTC midnight so day-math is timezone-stable.
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
}

function addDays(d, days) {
  const r = new Date(d)
  r.setUTCDate(r.getUTCDate() + days)
  return r
}

export function getPayPeriod(reference = new Date()) {
  const ref = toUTCDate(reference)
  const days = Math.floor((ref - ANCHOR) / MS_PER_DAY)
  const index = Math.floor(days / PERIOD_DAYS)
  const start = addDays(ANCHOR, index * PERIOD_DAYS)
  const end = addDays(start, PERIOD_DAYS - 1)
  return { start, end, index }
}

export function shiftPayPeriod(period, deltaPeriods) {
  const start = addDays(period.start, deltaPeriods * PERIOD_DAYS)
  const end = addDays(start, PERIOD_DAYS - 1)
  return { start, end, index: period.index + deltaPeriods }
}

// YYYY-MM-DD (UTC) — the format Postgres `date` columns use.
export function toISODate(d) {
  const utc = toUTCDate(d)
  const y = utc.getUTCFullYear()
  const m = String(utc.getUTCMonth() + 1).padStart(2, '0')
  const day = String(utc.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function formatPeriodLabel(period) {
  const opts = { month: 'short', day: 'numeric', year: 'numeric' }
  const start = period.start.toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' })
  const end = period.end.toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' })
  return `${start} – ${end}`
}

// Build a list of 14 ISO dates (period_start .. period_start + 13).
export function periodDates(period) {
  return Array.from({ length: PERIOD_DAYS }, (_, i) => toISODate(addDays(period.start, i)))
}

// Is the given ISO date string (YYYY-MM-DD) inside the period?
export function isInPeriod(isoDate, period) {
  if (!isoDate) return false
  return isoDate >= toISODate(period.start) && isoDate <= toISODate(period.end)
}

// ----- Report-style date ranges (local, not UTC) -----
function toLocalISO(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Returns { startISO, endISO, label }. `startISO === null` means no lower bound (all-time).
export function getReportRange(filter, now = new Date()) {
  const t = new Date(now)
  if (filter === 'all-time') {
    return { startISO: null, endISO: null, label: 'All time' }
  }
  if (filter === 'current-pp') {
    const p = getPayPeriod(t)
    return {
      startISO: toISODate(p.start),
      endISO: toISODate(p.end),
      label: formatPeriodLabel(p)
    }
  }
  if (filter === 'this-week' || filter === 'last-week') {
    const dow = t.getDay() // 0=Sun..6=Sat
    const sinceMonday = (dow + 6) % 7
    const monday = new Date(t.getFullYear(), t.getMonth(), t.getDate() - sinceMonday)
    if (filter === 'last-week') monday.setDate(monday.getDate() - 7)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    const opts = { month: 'short', day: 'numeric', year: 'numeric' }
    const label = `${monday.toLocaleDateString('en-US', opts)} – ${sunday.toLocaleDateString('en-US', opts)}`
    return { startISO: toLocalISO(monday), endISO: toLocalISO(sunday), label }
  }
  if (filter === 'this-month') {
    const first = new Date(t.getFullYear(), t.getMonth(), 1)
    const last = new Date(t.getFullYear(), t.getMonth() + 1, 0)
    const label = first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    return { startISO: toLocalISO(first), endISO: toLocalISO(last), label }
  }
  return { startISO: null, endISO: null, label: 'All time' }
}

export function inRange(isoDate, range) {
  if (!isoDate) return false
  if (!range.startISO && !range.endISO) return true
  if (range.startISO && isoDate < range.startISO) return false
  if (range.endISO && isoDate > range.endISO) return false
  return true
}
