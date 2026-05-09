import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatCurrency, formatDate, todayISO, isoDaysFromNow } from '../lib/format'
import PageHeader from '../components/PageHeader.jsx'
import SummaryCard from '../components/SummaryCard.jsx'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [stats, setStats] = useState({
    todaySales: 0,
    inventoryCount: 0,
    lowStockCount: 0,
    upcomingShifts: 0,
    openTasks: 0
  })
  const [recentSales, setRecentSales] = useState([])
  const [lowStock, setLowStock] = useState([])
  const [todayShifts, setTodayShifts] = useState([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setErr('')
    try {
      const today = todayISO()
      const weekOut = isoDaysFromNow(7)

      const [salesToday, sales5, inv, shiftsUpcoming, tasksOpen, shiftsToday] = await Promise.all([
        supabase.from('sales_records').select('total_sales').eq('sale_date', today),
        supabase
          .from('sales_records')
          .select('*')
          .order('sale_date', { ascending: false })
          .limit(5),
        supabase.from('inventory_items').select('id, item_name, quantity, reorder_level, unit'),
        supabase
          .from('shifts')
          .select('id')
          .gte('shift_date', today)
          .lte('shift_date', weekOut),
        supabase.from('tasks').select('id').eq('completed', false),
        supabase
          .from('shifts')
          .select('*')
          .eq('shift_date', today)
          .order('start_time', { ascending: true })
      ])

      const errors = [salesToday, sales5, inv, shiftsUpcoming, tasksOpen, shiftsToday]
        .map((r) => r.error)
        .filter(Boolean)
      if (errors.length) throw errors[0]

      const todayTotal = (salesToday.data ?? []).reduce(
        (sum, r) => sum + Number(r.total_sales ?? 0),
        0
      )
      const lowStockItems = (inv.data ?? []).filter(
        (i) => Number(i.quantity) <= Number(i.reorder_level)
      )

      setStats({
        todaySales: todayTotal,
        inventoryCount: (inv.data ?? []).length,
        lowStockCount: lowStockItems.length,
        upcomingShifts: (shiftsUpcoming.data ?? []).length,
        openTasks: (tasksOpen.data ?? []).length
      })
      setRecentSales(sales5.data ?? [])
      setLowStock(lowStockItems.slice(0, 5))
      setTodayShifts(shiftsToday.data ?? [])
    } catch (e) {
      setErr(e.message || 'Failed to load dashboard.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <PageHeader
        title="Dashboard"
        subtitle="A snapshot of today's restaurant operations."
      />

      {err && <div className="alert alert--error">{err}</div>}

      <div className="grid grid--cards">
        <SummaryCard
          label="Today's Sales"
          value={formatCurrency(stats.todaySales)}
          sub={loading ? 'Loading…' : 'All channels combined'}
          tone="primary"
        />
        <SummaryCard
          label="Inventory Items"
          value={stats.inventoryCount}
          sub={loading ? 'Loading…' : 'Total tracked SKUs'}
        />
        <SummaryCard
          label="Low Stock"
          value={stats.lowStockCount}
          sub={loading ? 'Loading…' : 'At or below reorder level'}
          tone={stats.lowStockCount > 0 ? 'warn' : 'default'}
        />
        <SummaryCard
          label="Upcoming Shifts"
          value={stats.upcomingShifts}
          sub={loading ? 'Loading…' : 'Next 7 days'}
        />
        <SummaryCard
          label="Open Tasks"
          value={stats.openTasks}
          sub={loading ? 'Loading…' : 'Incomplete items'}
          tone={stats.openTasks > 0 ? 'accent' : 'default'}
        />
      </div>

      <div className="grid grid--two">
        <section className="card">
          <div className="card__header">
            <h2 className="card__title">Recent Sales</h2>
            <Link className="link" to="/sales">View all →</Link>
          </div>
          {recentSales.length === 0 ? (
            <p className="muted">No sales recorded yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Lunch</th>
                  <th>Dinner</th>
                  <th>Takeout</th>
                  <th>Delivery</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDate(r.sale_date)}</td>
                    <td>{formatCurrency(r.lunch_sales)}</td>
                    <td>{formatCurrency(r.dinner_sales)}</td>
                    <td>{formatCurrency(r.takeout_sales)}</td>
                    <td>{formatCurrency(r.delivery_sales)}</td>
                    <td><strong>{formatCurrency(r.total_sales)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">Low Stock Items</h2>
            <Link className="link" to="/inventory">Manage →</Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="muted">All items above reorder level. Nice work.</p>
          ) : (
            <ul className="list">
              {lowStock.map((i) => (
                <li key={i.id} className="list-row">
                  <span>{i.item_name}</span>
                  <span className="badge badge--warn">
                    {i.quantity} {i.unit} · reorder ≤ {i.reorder_level}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card">
        <div className="card__header">
          <h2 className="card__title">Today's Shifts</h2>
          <Link className="link" to="/shifts">Manage →</Link>
        </div>
        {todayShifts.length === 0 ? (
          <p className="muted">No shifts scheduled for today.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Start</th>
                <th>End</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {todayShifts.map((s) => (
                <tr key={s.id}>
                  <td>{s.employee_name}</td>
                  <td>{s.role}</td>
                  <td>{s.start_time}</td>
                  <td>{s.end_time}</td>
                  <td className="muted">{s.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
