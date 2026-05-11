import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import {
  formatCurrency,
  formatDate,
  formatHours,
  formatTime12,
  shiftMinutes,
  todayISO
} from '../lib/format'
import {
  getPayPeriod,
  shiftPayPeriod,
  formatPeriodLabel,
  toISODate,
  isInPeriod
} from '../lib/payPeriod'
import { downloadCSV } from '../lib/csv'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import EmptyState from '../components/EmptyState.jsx'
import EmployeeDetailModal from '../components/EmployeeDetailModal.jsx'

const ROLES = ['Manager', 'Server', 'Bartender', 'Host', 'Cook', 'Dishwasher', 'Cashier', 'Prep']

const emptyShift = {
  employee_id: '',
  shift_date: todayISO(),
  start_time: '09:00',
  end_time: '17:00',
  role: '',
  unpaid_break_minutes: 0,
  notes: ''
}

const emptyEmployee = {
  name: '',
  title: '',
  phone: '',
  email: '',
  hourly_rate: '',
  active: true
}

export default function Shifts() {
  const [tab, setTab] = useState('timecards')
  const [period, setPeriod] = useState(() => getPayPeriod(new Date()))
  const [employees, setEmployees] = useState([])
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  // Shift form modal
  const [shiftModalOpen, setShiftModalOpen] = useState(false)
  const [shiftForm, setShiftForm] = useState(emptyShift)
  const [editingShiftId, setEditingShiftId] = useState(null)
  const [savingShift, setSavingShift] = useState(false)

  // Employee management modal
  const [empModalOpen, setEmpModalOpen] = useState(false)
  const [empForm, setEmpForm] = useState(emptyEmployee)
  const [editingEmpId, setEditingEmpId] = useState(null)
  const [savingEmp, setSavingEmp] = useState(false)

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailEmployeeId, setDetailEmployeeId] = useState(null)

  // All Shifts tab filters
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setErr('')
    const [empRes, shiftRes] = await Promise.all([
      supabase.from('employees').select('*').order('name', { ascending: true }),
      supabase
        .from('shifts')
        .select('*')
        .order('shift_date', { ascending: false })
        .order('start_time', { ascending: true })
    ])
    if (empRes.error) setErr(empRes.error.message)
    else if (shiftRes.error) setErr(shiftRes.error.message)
    setEmployees(empRes.data ?? [])
    setShifts(shiftRes.data ?? [])
    setLoading(false)
  }

  // ---------- pay period nav ----------
  const periodStartISO = toISODate(period.start)
  const periodEndISO = toISODate(period.end)
  const shiftsInPeriod = useMemo(
    () => shifts.filter((s) => s.shift_date >= periodStartISO && s.shift_date <= periodEndISO),
    [shifts, periodStartISO, periodEndISO]
  )

  function prevPeriod() {
    setPeriod((p) => shiftPayPeriod(p, -1))
  }
  function nextPeriod() {
    setPeriod((p) => shiftPayPeriod(p, +1))
  }
  function resetPeriod() {
    setPeriod(getPayPeriod(new Date()))
  }

  // ---------- per-employee stats ----------
  const employeeStats = useMemo(() => {
    const map = new Map()
    for (const e of employees) {
      map.set(e.id, { employee: e, shifts: [], minutes: 0, breakMin: 0 })
    }
    for (const s of shiftsInPeriod) {
      if (!s.employee_id) continue
      const entry = map.get(s.employee_id)
      if (!entry) continue
      const mins = shiftMinutes(s.start_time, s.end_time, s.unpaid_break_minutes)
      entry.shifts.push(s)
      entry.minutes += mins
      entry.breakMin += Number(s.unpaid_break_minutes || 0)
    }
    return Array.from(map.values())
  }, [employees, shiftsInPeriod])

  const activeStats = employeeStats.filter((e) => e.employee.active)

  // ---------- summary ----------
  const totalScheduledMins = activeStats.reduce((sum, e) => sum + e.minutes, 0)
  const totalShifts = activeStats.reduce((sum, e) => sum + e.shifts.length, 0)
  const totalEstPay = activeStats.reduce((sum, e) => {
    if (!e.employee.hourly_rate) return sum
    return sum + (e.minutes / 60) * Number(e.employee.hourly_rate)
  }, 0)

  // ---------- shift CRUD ----------
  function openCreateShift() {
    setShiftForm(emptyShift)
    setEditingShiftId(null)
    setShiftModalOpen(true)
  }
  function openEditShift(s) {
    setShiftForm({
      employee_id: s.employee_id ?? '',
      shift_date: s.shift_date ?? todayISO(),
      start_time: s.start_time ?? '09:00',
      end_time: s.end_time ?? '17:00',
      role: s.role ?? '',
      unpaid_break_minutes: s.unpaid_break_minutes ?? 0,
      notes: s.notes ?? ''
    })
    setEditingShiftId(s.id)
    setShiftModalOpen(true)
  }

  const shiftFormValid = useMemo(() => {
    if (!shiftForm.employee_id) return false
    if (!shiftForm.shift_date) return false
    if (!shiftForm.start_time || !shiftForm.end_time) return false
    return true
  }, [shiftForm])

  const shiftFormPreviewMins = useMemo(
    () =>
      shiftMinutes(shiftForm.start_time, shiftForm.end_time, shiftForm.unpaid_break_minutes),
    [shiftForm.start_time, shiftForm.end_time, shiftForm.unpaid_break_minutes]
  )

  async function onSubmitShift(e) {
    e.preventDefault()
    if (!shiftFormValid) {
      setErr('Pick an employee and fill in date / start / end.')
      return
    }
    setSavingShift(true)
    setErr('')
    const emp = employees.find((x) => x.id === shiftForm.employee_id)
    const payload = {
      employee_id: shiftForm.employee_id,
      employee_name: emp?.name ?? '',
      shift_date: shiftForm.shift_date,
      start_time: shiftForm.start_time,
      end_time: shiftForm.end_time,
      role: shiftForm.role || emp?.title || '',
      unpaid_break_minutes: Number(shiftForm.unpaid_break_minutes || 0),
      notes: shiftForm.notes
    }
    let error
    if (editingShiftId) {
      ;({ error } = await supabase.from('shifts').update(payload).eq('id', editingShiftId))
    } else {
      const { data: userData } = await supabase.auth.getUser()
      ;({ error } = await supabase
        .from('shifts')
        .insert({ ...payload, user_id: userData.user?.id }))
    }
    setSavingShift(false)
    if (error) {
      setErr(error.message)
      return
    }
    setShiftModalOpen(false)
    load()
  }

  async function deleteShift(id) {
    if (!confirm('Delete this shift?')) return
    const { error } = await supabase.from('shifts').delete().eq('id', id)
    if (error) {
      setErr(error.message)
      return
    }
    load()
  }

  // ---------- employee CRUD ----------
  function openCreateEmployee() {
    setEmpForm(emptyEmployee)
    setEditingEmpId(null)
  }
  function openEditEmployee(e) {
    setEmpForm({
      name: e.name ?? '',
      title: e.title ?? '',
      phone: e.phone ?? '',
      email: e.email ?? '',
      hourly_rate: e.hourly_rate ?? '',
      active: !!e.active
    })
    setEditingEmpId(e.id)
  }
  function cancelEmpForm() {
    setEmpForm(emptyEmployee)
    setEditingEmpId(null)
  }

  async function onSubmitEmployee(e) {
    e.preventDefault()
    if (!empForm.name.trim() || !empForm.title.trim()) {
      setErr('Name and title are required.')
      return
    }
    setSavingEmp(true)
    setErr('')
    const payload = {
      name: empForm.name.trim(),
      title: empForm.title.trim(),
      phone: empForm.phone || null,
      email: empForm.email || null,
      hourly_rate: empForm.hourly_rate === '' ? null : Number(empForm.hourly_rate),
      active: empForm.active
    }
    let error
    if (editingEmpId) {
      ;({ error } = await supabase.from('employees').update(payload).eq('id', editingEmpId))
    } else {
      const { data: userData } = await supabase.auth.getUser()
      ;({ error } = await supabase
        .from('employees')
        .insert({ ...payload, user_id: userData.user?.id }))
    }
    setSavingEmp(false)
    if (error) {
      setErr(error.message)
      return
    }
    cancelEmpForm()
    load()
  }

  async function toggleEmployeeActive(emp) {
    const { error } = await supabase
      .from('employees')
      .update({ active: !emp.active })
      .eq('id', emp.id)
    if (error) {
      setErr(error.message)
      return
    }
    load()
  }

  async function deleteEmployee(emp) {
    if (
      !confirm(
        `Delete ${emp.name}? All of their shifts (including past timecards) will be removed.`
      )
    )
      return
    const { error } = await supabase.from('employees').delete().eq('id', emp.id)
    if (error) {
      setErr(error.message)
      return
    }
    load()
  }

  // ---------- CSV export ----------
  function exportTimecardsCSV() {
    const header = [
      'employee_name',
      'title',
      'shift_date',
      'start_time',
      'end_time',
      'unpaid_break_minutes',
      'shift_hours',
      'role',
      'notes',
      'pay_period_start',
      'pay_period_end',
      'total_period_hours',
      'hourly_rate',
      'estimated_pay'
    ]
    const rows = [header]
    for (const entry of employeeStats) {
      const { employee, shifts: empShifts, minutes } = entry
      const totalH = minutes / 60
      const estPay = employee.hourly_rate ? totalH * Number(employee.hourly_rate) : ''
      if (empShifts.length === 0) {
        rows.push([
          employee.name,
          employee.title,
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          periodStartISO,
          periodEndISO,
          totalH.toFixed(2),
          employee.hourly_rate ?? '',
          estPay === '' ? '' : Number(estPay).toFixed(2)
        ])
        continue
      }
      for (const s of empShifts) {
        const mins = shiftMinutes(s.start_time, s.end_time, s.unpaid_break_minutes)
        rows.push([
          employee.name,
          employee.title,
          s.shift_date,
          s.start_time,
          s.end_time,
          s.unpaid_break_minutes ?? 0,
          (mins / 60).toFixed(2),
          s.role ?? '',
          s.notes ?? '',
          periodStartISO,
          periodEndISO,
          totalH.toFixed(2),
          employee.hourly_rate ?? '',
          estPay === '' ? '' : Number(estPay).toFixed(2)
        ])
      }
    }
    downloadCSV(`timecards_${periodStartISO}_to_${periodEndISO}.csv`, rows)
  }

  // ---------- detail modal ----------
  const detailEmployee = employees.find((e) => e.id === detailEmployeeId) || null
  const detailShifts = detailEmployeeId
    ? shiftsInPeriod.filter((s) => s.employee_id === detailEmployeeId)
    : []

  // ---------- "All Shifts" tab ----------
  const filteredAll = useMemo(() => {
    return shifts.filter((s) => {
      if (dateFilter && s.shift_date !== dateFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const name = (s.employee_name || '').toLowerCase()
        const role = (s.role || '').toLowerCase()
        if (!name.includes(q) && !role.includes(q)) return false
      }
      return true
    })
  }, [shifts, dateFilter, search])

  const hasEmployees = employees.length > 0

  return (
    <div className="page">
      <PageHeader
        title="Shifts"
        subtitle="Biweekly timecards and shift schedule."
        actions={
          <>
            <button className="btn btn--ghost" onClick={() => setEmpModalOpen(true)}>
              Manage Employees
            </button>
            <button
              className="btn btn--primary"
              onClick={openCreateShift}
              disabled={!hasEmployees}
              title={!hasEmployees ? 'Add employees first' : ''}
            >
              + New Shift
            </button>
          </>
        }
      />

      {err && <div className="alert alert--error">{err}</div>}

      <div className="segmented" role="tablist">
        <button
          className={`segmented__btn ${tab === 'timecards' ? 'segmented__btn--active' : ''}`}
          onClick={() => setTab('timecards')}
        >
          Timecards
        </button>
        <button
          className={`segmented__btn ${tab === 'shifts' ? 'segmented__btn--active' : ''}`}
          onClick={() => setTab('shifts')}
        >
          All Shifts
        </button>
      </div>

      {/* ============================== TIMECARDS ============================== */}
      {tab === 'timecards' && (
        <>
          <div className="period-bar">
            <div className="period-nav">
              <button
                className="icon-btn"
                onClick={prevPeriod}
                aria-label="Previous pay period"
              >
                ‹
              </button>
              <div className="period-nav__label">
                <div className="period-nav__title">{formatPeriodLabel(period)}</div>
                <div className="period-nav__sub">
                  Pay period · {totalShifts} shifts · {formatHours(totalScheduledMins)}
                </div>
              </div>
              <button className="icon-btn" onClick={nextPeriod} aria-label="Next pay period">
                ›
              </button>
              <button className="btn btn--ghost btn--sm" onClick={resetPeriod}>
                Today
              </button>
            </div>
            <div className="period-bar__spacer" />
            <button
              className="btn btn--ghost"
              onClick={exportTimecardsCSV}
              disabled={activeStats.length === 0}
            >
              Export Timecards CSV
            </button>
          </div>

          <div className="grid grid--cards">
            <div className="summary-card summary-card--primary">
              <div className="summary-card__label">Total Employees</div>
              <div className="summary-card__value">{activeStats.length}</div>
              <div className="summary-card__sub">Active in roster</div>
            </div>
            <div className="summary-card summary-card--accent">
              <div className="summary-card__label">Scheduled Hours</div>
              <div className="summary-card__value">{formatHours(totalScheduledMins)}</div>
              <div className="summary-card__sub">Across this pay period</div>
            </div>
            <div className="summary-card">
              <div className="summary-card__label">Total Shifts</div>
              <div className="summary-card__value">{totalShifts}</div>
              <div className="summary-card__sub">In this pay period</div>
            </div>
            <div className="summary-card summary-card--success">
              <div className="summary-card__label">Estimated Payroll</div>
              <div className="summary-card__value">{formatCurrency(totalEstPay)}</div>
              <div className="summary-card__sub">Where hourly rate is set</div>
            </div>
          </div>

          {loading ? (
            <section className="card">
              <p className="muted">Loading timecards…</p>
            </section>
          ) : !hasEmployees ? (
            <section className="card">
              <EmptyState
                icon="E"
                title="No employees yet"
                description="Add employees first, then schedule shifts against them to see their timecard."
                action={
                  <button className="btn btn--primary" onClick={() => setEmpModalOpen(true)}>
                    Manage Employees
                  </button>
                }
              />
            </section>
          ) : activeStats.length === 0 ? (
            <section className="card">
              <EmptyState
                icon="E"
                title="No active employees"
                description="Reactivate an employee or add a new one to start scheduling."
                action={
                  <button className="btn btn--primary" onClick={() => setEmpModalOpen(true)}>
                    Manage Employees
                  </button>
                }
              />
            </section>
          ) : (
            <div className="timecard-grid">
              {activeStats.map(({ employee, shifts: s, minutes }) => {
                const hours = minutes / 60
                const est = employee.hourly_rate ? hours * Number(employee.hourly_rate) : null
                return (
                  <article key={employee.id} className="timecard-card">
                    <div className="timecard-card__head">
                      <div className="timecard-card__avatar">
                        {(employee.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="timecard-card__title">
                        <div className="timecard-card__name">{employee.name}</div>
                        <div className="timecard-card__meta">
                          <span className="badge badge--neutral">{employee.title}</span>
                          <span className="badge badge--ok">Active</span>
                        </div>
                      </div>
                    </div>
                    <div className="timecard-card__stats">
                      <div className="timecard-stat">
                        <div className="timecard-stat__label">Shifts</div>
                        <div className="timecard-stat__value">{s.length}</div>
                      </div>
                      <div className="timecard-stat">
                        <div className="timecard-stat__label">Hours</div>
                        <div className="timecard-stat__value">{formatHours(minutes)}</div>
                      </div>
                      <div className="timecard-stat">
                        <div className="timecard-stat__label">Est. Pay</div>
                        <div className="timecard-stat__value">
                          {est != null ? formatCurrency(est) : '—'}
                        </div>
                      </div>
                    </div>
                    <button
                      className="btn btn--ghost btn--block"
                      onClick={() => {
                        setDetailEmployeeId(employee.id)
                        setDetailOpen(true)
                      }}
                    >
                      View timecard →
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* ============================== ALL SHIFTS ============================== */}
      {tab === 'shifts' && (
        <>
          <div className="toolbar">
            <input
              className="input input--search"
              placeholder="Search employee or role"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <label className="field field--inline">
              <span className="field__label">Date</span>
              <input
                type="date"
                className="input"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </label>
            {(dateFilter || search) && (
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => {
                  setDateFilter('')
                  setSearch('')
                }}
              >
                Clear
              </button>
            )}
          </div>

          <section className="card">
            {loading ? (
              <p className="muted">Loading…</p>
            ) : filteredAll.length === 0 ? (
              <EmptyState
                icon="H"
                title="No shifts"
                description="Schedule a shift to see it here."
                action={
                  hasEmployees && (
                    <button className="btn btn--primary" onClick={openCreateShift}>
                      + New Shift
                    </button>
                  )
                }
              />
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="nowrap">Employee</th>
                      <th className="nowrap">Date</th>
                      <th className="nowrap">Start</th>
                      <th className="nowrap">End</th>
                      <th className="num">Break</th>
                      <th className="num">Hours</th>
                      <th className="nowrap">Role</th>
                      <th>Notes</th>
                      <th className="actions"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAll.map((s) => {
                      const mins = shiftMinutes(s.start_time, s.end_time, s.unpaid_break_minutes)
                      return (
                        <tr key={s.id}>
                          <td className="nowrap">{s.employee_name || '—'}</td>
                          <td className="nowrap">{formatDate(s.shift_date)}</td>
                          <td className="nowrap">{formatTime12(s.start_time)}</td>
                          <td className="nowrap">{formatTime12(s.end_time)}</td>
                          <td className="num">{s.unpaid_break_minutes || 0}m</td>
                          <td className="num">{formatHours(mins)}</td>
                          <td className="nowrap">
                            {s.role && <span className="badge badge--neutral">{s.role}</span>}
                          </td>
                          <td className="muted">{s.notes}</td>
                          <td className="actions">
                            <div className="row-actions">
                              <button
                                className="btn btn--ghost btn--sm"
                                onClick={() => openEditShift(s)}
                              >
                                Edit
                              </button>
                              <button
                                className="btn btn--danger btn--sm"
                                onClick={() => deleteShift(s.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {/* ============================== Shift Modal ============================== */}
      <Modal
        open={shiftModalOpen}
        onClose={() => setShiftModalOpen(false)}
        title={editingShiftId ? 'Edit Shift' : 'New Shift'}
      >
        {!hasEmployees ? (
          <EmptyState
            icon="E"
            title="Add employees first"
            description="You need at least one employee before you can create shifts."
            action={
              <button
                className="btn btn--primary"
                onClick={() => {
                  setShiftModalOpen(false)
                  setEmpModalOpen(true)
                }}
              >
                Manage Employees
              </button>
            }
          />
        ) : (
          <form className="form" onSubmit={onSubmitShift}>
            <label className="field">
              <span className="field__label">Employee</span>
              <select
                className="input"
                value={shiftForm.employee_id}
                onChange={(e) => {
                  const emp = employees.find((x) => x.id === e.target.value)
                  setShiftForm({
                    ...shiftForm,
                    employee_id: e.target.value,
                    role: shiftForm.role || emp?.title || ''
                  })
                }}
                required
              >
                <option value="">Select an employee…</option>
                {employees
                  .filter((e) => e.active || e.id === shiftForm.employee_id)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.title}
                      {!e.active ? ' (inactive)' : ''}
                    </option>
                  ))}
              </select>
            </label>
            <div className="grid grid--two">
              <label className="field">
                <span className="field__label">Date</span>
                <input
                  className="input"
                  type="date"
                  value={shiftForm.shift_date}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, shift_date: e.target.value })
                  }
                  required
                />
              </label>
              <label className="field">
                <span className="field__label">Role</span>
                <input
                  className="input"
                  list="role-options"
                  value={shiftForm.role}
                  onChange={(e) => setShiftForm({ ...shiftForm, role: e.target.value })}
                />
                <datalist id="role-options">
                  {ROLES.map((r) => (
                    <option key={r} value={r} />
                  ))}
                </datalist>
              </label>
              <label className="field">
                <span className="field__label">Start</span>
                <input
                  className="input"
                  type="time"
                  value={shiftForm.start_time}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, start_time: e.target.value })
                  }
                  required
                />
              </label>
              <label className="field">
                <span className="field__label">End</span>
                <input
                  className="input"
                  type="time"
                  value={shiftForm.end_time}
                  onChange={(e) => setShiftForm({ ...shiftForm, end_time: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span className="field__label">Unpaid break (minutes)</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="1"
                  value={shiftForm.unpaid_break_minutes}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, unpaid_break_minutes: e.target.value })
                  }
                />
              </label>
              <div className="field">
                <span className="field__label">Calculated hours</span>
                <div className="input input--readonly">{formatHours(shiftFormPreviewMins)}</div>
              </div>
              <label className="field field--full">
                <span className="field__label">Notes</span>
                <textarea
                  className="input textarea"
                  rows={2}
                  value={shiftForm.notes}
                  onChange={(e) => setShiftForm({ ...shiftForm, notes: e.target.value })}
                />
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setShiftModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn--primary"
                type="submit"
                disabled={savingShift || !shiftFormValid}
              >
                {savingShift ? 'Saving…' : editingShiftId ? 'Save changes' : 'Create shift'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ============================== Employee Modal ============================== */}
      <Modal
        open={empModalOpen}
        onClose={() => {
          setEmpModalOpen(false)
          cancelEmpForm()
        }}
        title="Manage Employees"
      >
        <div className="emp-manager">
          <form className="form emp-manager__form" onSubmit={onSubmitEmployee}>
            <div className="grid grid--two">
              <label className="field">
                <span className="field__label">Name</span>
                <input
                  className="input"
                  value={empForm.name}
                  onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span className="field__label">Title</span>
                <input
                  className="input"
                  list="role-options"
                  value={empForm.title}
                  onChange={(e) => setEmpForm({ ...empForm, title: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span className="field__label">Phone</span>
                <input
                  className="input"
                  value={empForm.phone}
                  onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                />
              </label>
              <label className="field">
                <span className="field__label">Email</span>
                <input
                  className="input"
                  type="email"
                  value={empForm.email}
                  onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                />
              </label>
              <label className="field">
                <span className="field__label">Hourly rate</span>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={empForm.hourly_rate}
                  onChange={(e) => setEmpForm({ ...empForm, hourly_rate: e.target.value })}
                />
              </label>
              <label className="field field--checkbox">
                <input
                  type="checkbox"
                  checked={empForm.active}
                  onChange={(e) => setEmpForm({ ...empForm, active: e.target.checked })}
                />
                <span>Active</span>
              </label>
            </div>
            <div className="modal-actions">
              {editingEmpId && (
                <button type="button" className="btn btn--ghost" onClick={cancelEmpForm}>
                  Cancel edit
                </button>
              )}
              <button className="btn btn--primary" type="submit" disabled={savingEmp}>
                {savingEmp ? 'Saving…' : editingEmpId ? 'Save changes' : '+ Add employee'}
              </button>
            </div>
          </form>

          <div className="emp-manager__list">
            <div className="card__header">
              <h3 className="card__title">Roster ({employees.length})</h3>
            </div>
            {employees.length === 0 ? (
              <p className="muted">No employees yet. Add your first one above.</p>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="nowrap">Name</th>
                      <th className="nowrap">Title</th>
                      <th className="num">Rate</th>
                      <th className="nowrap">Status</th>
                      <th className="actions"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((e) => (
                      <tr key={e.id}>
                        <td className="nowrap">{e.name}</td>
                        <td className="nowrap">
                          <span className="badge badge--neutral">{e.title}</span>
                        </td>
                        <td className="num">
                          {e.hourly_rate != null ? formatCurrency(e.hourly_rate) : '—'}
                        </td>
                        <td className="nowrap">
                          {e.active ? (
                            <span className="badge badge--ok">Active</span>
                          ) : (
                            <span className="badge badge--warn">Inactive</span>
                          )}
                        </td>
                        <td className="actions">
                          <div className="row-actions">
                            <button
                              className="btn btn--ghost btn--sm"
                              onClick={() => openEditEmployee(e)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn--ghost btn--sm"
                              onClick={() => toggleEmployeeActive(e)}
                            >
                              {e.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              className="btn btn--danger btn--sm"
                              onClick={() => deleteEmployee(e)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <EmployeeDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        employee={detailEmployee}
        shifts={detailShifts}
        period={period}
      />
    </div>
  )
}
