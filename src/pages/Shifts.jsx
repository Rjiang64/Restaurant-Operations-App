import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatDate, todayISO } from '../lib/format'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import EmptyState from '../components/EmptyState.jsx'

const empty = {
  employee_name: '',
  shift_date: todayISO(),
  start_time: '09:00',
  end_time: '17:00',
  role: '',
  notes: ''
}

const roles = ['Manager', 'Server', 'Bartender', 'Host', 'Cook', 'Dishwasher', 'Prep']

export default function Shifts() {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setErr('')
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .order('shift_date', { ascending: false })
      .order('start_time', { ascending: true })
    if (error) setErr(error.message)
    setShifts(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setForm(empty)
    setEditingId(null)
    setShowModal(true)
  }

  function openEdit(s) {
    setForm({
      employee_name: s.employee_name ?? '',
      shift_date: s.shift_date ?? todayISO(),
      start_time: s.start_time ?? '09:00',
      end_time: s.end_time ?? '17:00',
      role: s.role ?? '',
      notes: s.notes ?? ''
    })
    setEditingId(s.id)
    setShowModal(true)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErr('')
    const payload = { ...form }
    let error
    if (editingId) {
      ;({ error } = await supabase.from('shifts').update(payload).eq('id', editingId))
    } else {
      const { data: userData } = await supabase.auth.getUser()
      ;({ error } = await supabase
        .from('shifts')
        .insert({ ...payload, user_id: userData.user?.id }))
    }
    setSaving(false)
    if (error) {
      setErr(error.message)
      return
    }
    setShowModal(false)
    load()
  }

  async function onDelete(id) {
    if (!confirm('Delete this shift?')) return
    const { error } = await supabase.from('shifts').delete().eq('id', id)
    if (error) {
      setErr(error.message)
      return
    }
    load()
  }

  const filtered = dateFilter ? shifts.filter((s) => s.shift_date === dateFilter) : shifts

  return (
    <div className="page">
      <PageHeader
        title="Shifts"
        subtitle="Schedule and manage employee shifts"
        actions={
          <button className="btn btn--primary" onClick={openCreate}>
            + New Shift
          </button>
        }
      />

      {err && <div className="alert alert--error">{err}</div>}

      <div className="toolbar">
        <label className="field field--inline">
          <span className="field__label">Filter by date</span>
          <input
            type="date"
            className="input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </label>
        {dateFilter && (
          <button className="btn btn--ghost btn--sm" onClick={() => setDateFilter('')}>
            Clear
          </button>
        )}
      </div>

      <section className="card">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No shifts"
            description="Schedule your first employee shift."
            action={
              <button className="btn btn--primary" onClick={openCreate}>
                + New Shift
              </button>
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Role</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>{s.employee_name}</td>
                    <td>{formatDate(s.shift_date)}</td>
                    <td>{s.start_time}</td>
                    <td>{s.end_time}</td>
                    <td>
                      <span className="badge badge--neutral">{s.role}</span>
                    </td>
                    <td className="muted">{s.notes}</td>
                    <td className="row-actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => openEdit(s)}>
                        Edit
                      </button>
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => onDelete(s.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Shift' : 'New Shift'}
      >
        <form className="form" onSubmit={onSubmit}>
          <div className="grid grid--two">
            <label className="field">
              <span className="field__label">Employee name</span>
              <input
                className="input"
                value={form.employee_name}
                onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Role</span>
              <input
                className="input"
                list="role-options"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
              <datalist id="role-options">
                {roles.map((r) => (
                  <option key={r} value={r} />
                ))}
              </datalist>
            </label>
            <label className="field">
              <span className="field__label">Date</span>
              <input
                className="input"
                type="date"
                value={form.shift_date}
                onChange={(e) => setForm({ ...form, shift_date: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Start</span>
              <input
                className="input"
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">End</span>
              <input
                className="input"
                type="time"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                required
              />
            </label>
            <label className="field field--full">
              <span className="field__label">Notes</span>
              <textarea
                className="input textarea"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button className="btn btn--primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create shift'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
