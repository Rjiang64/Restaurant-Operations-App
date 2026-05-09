import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { formatDate, todayISO } from '../lib/format'
import PageHeader from '../components/PageHeader.jsx'
import Modal from '../components/Modal.jsx'
import EmptyState from '../components/EmptyState.jsx'

const empty = {
  task_name: '',
  category: '',
  priority: 'medium',
  due_date: todayISO(),
  completed: false
}

const priorities = ['low', 'medium', 'high']
const categories = ['Opening', 'Closing', 'Maintenance', 'Inventory', 'Compliance', 'Staffing', 'Other']

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('open')

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setErr('')
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('completed', { ascending: true })
      .order('due_date', { ascending: true })
    if (error) setErr(error.message)
    setTasks(data ?? [])
    setLoading(false)
  }

  function openCreate() {
    setForm(empty)
    setEditingId(null)
    setShowModal(true)
  }

  function openEdit(t) {
    setForm({
      task_name: t.task_name ?? '',
      category: t.category ?? '',
      priority: t.priority ?? 'medium',
      due_date: t.due_date ?? todayISO(),
      completed: !!t.completed
    })
    setEditingId(t.id)
    setShowModal(true)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setErr('')
    const payload = { ...form }
    let error
    if (editingId) {
      ;({ error } = await supabase.from('tasks').update(payload).eq('id', editingId))
    } else {
      const { data: userData } = await supabase.auth.getUser()
      ;({ error } = await supabase
        .from('tasks')
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

  async function toggleComplete(t) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !t.completed })
      .eq('id', t.id)
    if (error) {
      setErr(error.message)
      return
    }
    load()
  }

  async function onDelete(id) {
    if (!confirm('Delete this task?')) return
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) {
      setErr(error.message)
      return
    }
    load()
  }

  const filtered = tasks.filter((t) => {
    if (filter === 'open') return !t.completed
    if (filter === 'done') return t.completed
    return true
  })

  return (
    <div className="page">
      <PageHeader
        title="Tasks"
        subtitle="Manager checklist and operational follow-ups"
        actions={
          <button className="btn btn--primary" onClick={openCreate}>
            + New Task
          </button>
        }
      />

      {err && <div className="alert alert--error">{err}</div>}

      <div className="toolbar">
        <div className="segmented">
          <button
            className={`segmented__btn ${filter === 'open' ? 'segmented__btn--active' : ''}`}
            onClick={() => setFilter('open')}
          >
            Open
          </button>
          <button
            className={`segmented__btn ${filter === 'done' ? 'segmented__btn--active' : ''}`}
            onClick={() => setFilter('done')}
          >
            Done
          </button>
          <button
            className={`segmented__btn ${filter === 'all' ? 'segmented__btn--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>
      </div>

      <section className="card">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="T"
            title="No tasks"
            description="Create a manager task with priority and a due date to get started."
            action={
              <button className="btn btn--primary" onClick={openCreate}>
                + New Task
              </button>
            }
          />
        ) : (
          <ul className="task-list">
            {filtered.map((t) => (
              <li key={t.id} className={`task ${t.completed ? 'task--done' : ''}`}>
                <label className="task__check">
                  <input
                    type="checkbox"
                    checked={!!t.completed}
                    onChange={() => toggleComplete(t)}
                  />
                </label>
                <div className="task__main">
                  <div className="task__title">{t.task_name}</div>
                  <div className="task__meta">
                    {t.category && <span className="badge badge--neutral">{t.category}</span>}
                    <span className={`badge badge--prio-${t.priority}`}>{t.priority}</span>
                    <span className="muted">Due {formatDate(t.due_date)}</span>
                  </div>
                </div>
                <div className="row-actions">
                  <button className="btn btn--ghost btn--sm" onClick={() => openEdit(t)}>
                    Edit
                  </button>
                  <button className="btn btn--danger btn--sm" onClick={() => onDelete(t.id)}>
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Edit Task' : 'New Task'}
      >
        <form className="form" onSubmit={onSubmit}>
          <label className="field">
            <span className="field__label">Task</span>
            <input
              className="input"
              value={form.task_name}
              onChange={(e) => setForm({ ...form, task_name: e.target.value })}
              required
            />
          </label>
          <div className="grid grid--two">
            <label className="field">
              <span className="field__label">Category</span>
              <input
                className="input"
                list="task-cat-options"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <datalist id="task-cat-options">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label className="field">
              <span className="field__label">Priority</span>
              <select
                className="input"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {priorities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span className="field__label">Due date</span>
              <input
                className="input"
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </label>
            <label className="field field--checkbox">
              <input
                type="checkbox"
                checked={form.completed}
                onChange={(e) => setForm({ ...form, completed: e.target.checked })}
              />
              <span>Mark as completed</span>
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
              {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
