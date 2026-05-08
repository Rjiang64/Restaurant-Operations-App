import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate, todayISO } from '../lib/format'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import EmptyState from '../components/EmptyState.jsx'

const empty = {
  sale_date: todayISO(),
  lunch_sales: 0,
  dinner_sales: 0,
  takeout_sales: 0,
  delivery_sales: 0,
  notes: ''
}

export default function Sales() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [monthFilter, setMonthFilter] = useState('')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setErr('')
    const { data, error } = await supabase
      .from('sales_records')
      .select('*')
      .order('sale_date', { ascending: false })
    if (error) setErr(error.message)
    setRecords(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setForm(empty)
    setEditingId(null)
    setShowModal(true)
  }

  function openEdit(r) {
    setForm({
      sale_date: r.sale_date,
      lunch_sales: r.lunch_sales ?? 0,
      dinner_sales: r.dinner_sales ?? 0,
      takeout_sales: r.takeout_sales ?? 0,
      delivery_sales: r.delivery_sales ?? 0,
      notes: r.notes ?? ''
    })
    setEditingId(r.id)
    setShowModal(true)
  }

  const computedTotal = useMemo(() => {
    return (
      Number(form.lunch_sales || 0) +
      Number(form.dinner_sales || 0) +
      Number(form.takeout_sales || 0) +
      Number(form.delivery_sales || 0)
    )
  }, [form])

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErr('')
    const payload = {
      sale_date: form.sale_date,
      lunch_sales: Number(form.lunch_sales || 0),
      dinner_sales: Number(form.dinner_sales || 0),
      takeout_sales: Number(form.takeout_sales || 0),
      delivery_sales: Number(form.delivery_sales || 0),
      total_sales: computedTotal,
      notes: form.notes
    }
    let error
    if (editingId) {
      ;({ error } = await supabase.from('sales_records').update(payload).eq('id', editingId))
    } else {
      const { data: userData } = await supabase.auth.getUser()
      ;({ error } = await supabase
        .from('sales_records')
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
    if (!confirm('Delete this sales record?')) return
    const { error } = await supabase.from('sales_records').delete().eq('id', id)
    if (error) {
      setErr(error.message)
      return
    }
    load()
  }

  const filtered = monthFilter
    ? records.filter((r) => (r.sale_date || '').startsWith(monthFilter))
    : records

  const monthTotal = filtered.reduce((s, r) => s + Number(r.total_sales ?? 0), 0)

  return (
    <div className="page">
      <PageHeader
        title="Sales"
        subtitle="Daily sales by service period"
        actions={
          <button className="btn btn--primary" onClick={openCreate}>
            + New Record
          </button>
        }
      />

      {err && <div className="alert alert--error">{err}</div>}

      <div className="toolbar">
        <label className="field field--inline">
          <span className="field__label">Filter by month</span>
          <input
            type="month"
            className="input"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
          />
        </label>
        {monthFilter && (
          <button className="btn btn--ghost btn--sm" onClick={() => setMonthFilter('')}>
            Clear
          </button>
        )}
        <div className="toolbar__spacer" />
        <div className="muted">
          {filtered.length} record{filtered.length === 1 ? '' : 's'} · {formatCurrency(monthTotal)}{' '}
          total
        </div>
      </div>

      <section className="card">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No sales records"
            description="Add your first daily sales record."
            action={
              <button className="btn btn--primary" onClick={openCreate}>
                + New Record
              </button>
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Lunch</th>
                  <th>Dinner</th>
                  <th>Takeout</th>
                  <th>Delivery</th>
                  <th>Total</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDate(r.sale_date)}</td>
                    <td>{formatCurrency(r.lunch_sales)}</td>
                    <td>{formatCurrency(r.dinner_sales)}</td>
                    <td>{formatCurrency(r.takeout_sales)}</td>
                    <td>{formatCurrency(r.delivery_sales)}</td>
                    <td>
                      <strong>{formatCurrency(r.total_sales)}</strong>
                    </td>
                    <td className="muted">{r.notes}</td>
                    <td className="row-actions">
                      <button className="btn btn--ghost btn--sm" onClick={() => openEdit(r)}>
                        Edit
                      </button>
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => onDelete(r.id)}
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
        title={editingId ? 'Edit Sales Record' : 'New Sales Record'}
      >
        <form className="form" onSubmit={onSubmit}>
          <div className="grid grid--two">
            <label className="field">
              <span className="field__label">Date</span>
              <input
                className="input"
                type="date"
                value={form.sale_date}
                onChange={(e) => setForm({ ...form, sale_date: e.target.value })}
                required
              />
            </label>
            <div className="field">
              <span className="field__label">Auto total</span>
              <div className="input input--readonly">{formatCurrency(computedTotal)}</div>
            </div>
            <label className="field">
              <span className="field__label">Lunch sales</span>
              <input
                className="input"
                type="number"
                step="0.01"
                value={form.lunch_sales}
                onChange={(e) => setForm({ ...form, lunch_sales: e.target.value })}
              />
            </label>
            <label className="field">
              <span className="field__label">Dinner sales</span>
              <input
                className="input"
                type="number"
                step="0.01"
                value={form.dinner_sales}
                onChange={(e) => setForm({ ...form, dinner_sales: e.target.value })}
              />
            </label>
            <label className="field">
              <span className="field__label">Takeout sales</span>
              <input
                className="input"
                type="number"
                step="0.01"
                value={form.takeout_sales}
                onChange={(e) => setForm({ ...form, takeout_sales: e.target.value })}
              />
            </label>
            <label className="field">
              <span className="field__label">Delivery sales</span>
              <input
                className="input"
                type="number"
                step="0.01"
                value={form.delivery_sales}
                onChange={(e) => setForm({ ...form, delivery_sales: e.target.value })}
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
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
