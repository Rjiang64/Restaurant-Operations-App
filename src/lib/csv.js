// Tiny client-side CSV builder + download helper.

function escapeCell(value) {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export function toCSV(rows) {
  return rows.map((row) => row.map(escapeCell).join(',')).join('\r\n')
}

export function downloadCSV(filename, rows) {
  const csv = toCSV(rows)
  // BOM helps Excel detect UTF-8 cleanly.
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Give Safari a tick before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
