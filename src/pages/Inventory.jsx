import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/format'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import EmptyState from '../components/EmptyState.jsx'

const empty = {
  item_name: '',
  category: '',
  quantity: 0,
  unit: '',
  reorder_level: 0,
  cost_per_unit: 0,
  supplier: ''
}

export default function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setErr('')
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('item_name', { ascending: true })
    if (error) setErr(error.message)
    setItems(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setForm(empty)
    setEditingId(null)
    setShowModal(true)
  }

  function openEdit(item) {
    setForm({
      item_name: item.item_name ?? '',
      category: item.category ?? '',
      quantity: item.quantity ?? 0,
      unit: item.unit ?? '',
      reorder_level: item.reorder_level ?? 0,
      cost_per_unit: item.cost_per_unit ?? 0,
      supplier: item.supplier ?? ''
    })
    setEditingId(item.id)
    setShowModal(true)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErr('')
    const payload = {
      ...form,
      quantity: Number(form.quantity),
      reorder_level: Number(form.reorder_level),
      cost_per_unit: Number(form.cost_per_unit)
    }
    let error
    if (editingId) {
      ;({ error } = await supabase.from('inventory_items').update(payload).eq('id', editingId))
    } else {
      const { data: userData } = await supabase.auth.getUser()
      ;({ error } = await supabase
        .from('inventory_items')
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
    if (!confirm('Delete this item?')) return
    const { error } = await supabase.from('inventory_items').delete().eq('id', id)
    if (error) {
      setErr(error.message)
      return
    }
    load()
  }

  const filtered = items.filter((i) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      i.item_name?.toLowerCase().includes(q) ||
      i.category?.toLowerCase().includes(q) ||
      i.supplier?.toLowerCase().includes(q)
    )
  })

  return (
    <div className="page">
      <PageHeader
        title="Inventory"
        subtitle="Track stock levels, reorder points, and suppliers"
        actions={
          <button className="btn btn--primary" onClick={openCreate}>
            + New Item
          </button>
        }
      />

      {err && <div className="alert alert--error">{err}</div>}

      <div className="toolbar">
        <input
          className="input input--search"
          placeholder="Search by name, category, or supplier"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <section className="card">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="I"
            title="No inventory yet"
            description="Add your first item to start tracking stock levels, reorder points, and suppliers."
            action={
              <button className="btn btn--primary" onClick={openCreate}>
                + New Item
              </button>
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th className="nowrap">Item</th>
                  <th className="nowrap">Category</th>
                  <th className="num">Quantity</th>
                  <th className="nowrap">Unit</th>
                  <th className="num">Reorder ≤</th>
                  <th className="num">Cost / Unit</th>
                  <th className="nowrap">Supplier</th>
                  <th className="nowrap">Status</th>
                  <th className="actions"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => {
                  const low = Number(i.quantity) <= Number(i.reorder_level)
                  return (
                    <tr key={i.id}>
                      <td className="nowrap">{i.item_name}</td>
                      <td className="nowrap">{i.category}</td>
                      <td className="num">{i.quantity}</td>
                      <td className="nowrap">{i.unit}</td>
                      <td className="num">{i.reorder_level}</td>
                      <td className="num">{formatCurrency(i.cost_per_unit)}</td>
                      <td className="nowrap">{i.supplier}</td>
                      <td className="nowrap">
                        {low ? (
                          <span className="badge badge--warn">Low stock</span>
                        ) : (
                          <span className="badge badge--ok">OK</span>
                        )}
                      </td>
                      <td className="actions">
                        <div className="row-actions">
                          <button className="btn btn--ghost btn--sm" onClick={() => openEdit(i)}>
                            Edit
                          </button>
                          <button
                            className="btn btn--danger btn--sm"
                            onClick={() => onDelete(i.id)}
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

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Item' : 'New Item'}
      >
        <form className="form" onSubmit={onSubmit}>
          <div className="grid grid--two">
            <label className="field">
              <span className="field__label">Item name</span>
              <input
                className="input"
                value={form.item_name}
                onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Category</span>
              <input
                className="input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Produce, Meat, Dry Goods"
              />
            </label>
            <label className="field">
              <span className="field__label">Quantity</span>
              <input
                className="input"
                type="number"
                step="0.01"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                required
              />
            </label>
            <label className="field">
              <span className="field__label">Unit</span>
              <input
                className="input"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                placeholder="lb, kg, case, ea"
              />
            </label>
            <label className="field">
              <span className="field__label">Reorder level</span>
              <input
                className="input"
                type="number"
                step="0.01"
                value={form.reorder_level}
                onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
              />
            </label>
            <label className="field">
              <span className="field__label">Cost per unit</span>
              <input
                className="input"
                type="number"
                step="0.01"
                value={form.cost_per_unit}
                onChange={(e) => setForm({ ...form, cost_per_unit: e.target.value })}
              />
            </label>
            <label className="field field--full">
              <span className="field__label">Supplier</span>
              <input
                className="input"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
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
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create item'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
