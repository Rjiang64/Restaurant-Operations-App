import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/format'
import PageHeader from '../components/PageHeader.jsx'

const PIE_COLORS = ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2']

export default function Reports() {
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [sales, setSales] = useState([])
  const [inventory, setInventory] = useState([])
  const [shifts, setShifts] = useState([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setErr('')
    const [s, i, sh] = await Promise.all([
      supabase.from('sales_records').select('*').order('sale_date', { ascending: true }),
      supabase.from('inventory_items').select('*'),
      supabase.from('shifts').select('*')
    ])
    if (s.error || i.error || sh.error) {
      setErr((s.error || i.error || sh.error).message)
    }
    setSales(s.data ?? [])
    setInventory(i.data ?? [])
    setShifts(sh.data ?? [])
    setLoading(false)
  }

  const trendData = useMemo(
    () =>
      sales.slice(-30).map((r) => ({
        date: r.sale_date,
        total: Number(r.total_sales ?? 0)
      })),
    [sales]
  )

  const breakdown = useMemo(() => {
    const sums = { Lunch: 0, Dinner: 0, Takeout: 0, Delivery: 0 }
    sales.forEach((r) => {
      sums.Lunch += Number(r.lunch_sales ?? 0)
      sums.Dinner += Number(r.dinner_sales ?? 0)
      sums.Takeout += Number(r.takeout_sales ?? 0)
      sums.Delivery += Number(r.delivery_sales ?? 0)
    })
    return Object.entries(sums).map(([name, value]) => ({ name, value }))
  }, [sales])

  const lowStock = useMemo(
    () => inventory.filter((i) => Number(i.quantity) <= Number(i.reorder_level)),
    [inventory]
  )

  const shiftsByRole = useMemo(() => {
    const map = {}
    shifts.forEach((s) => {
      const key = s.role || 'Unknown'
      map[key] = (map[key] || 0) + 1
    })
    return Object.entries(map).map(([role, count]) => ({ role, count }))
  }, [shifts])

  const totalSalesAll = sales.reduce((sum, r) => sum + Number(r.total_sales ?? 0), 0)
  const avgDaily = sales.length ? totalSalesAll / sales.length : 0

  return (
    <div className="page">
      <PageHeader title="Reports" subtitle="Operational summaries from your data" />

      {err && <div className="alert alert--error">{err}</div>}

      <div className="grid grid--cards">
        <div className="summary-card summary-card--primary">
          <div className="summary-card__label">Total Sales</div>
          <div className="summary-card__value">{formatCurrency(totalSalesAll)}</div>
          <div className="summary-card__sub">All recorded days</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__label">Avg Daily Sales</div>
          <div className="summary-card__value">{formatCurrency(avgDaily)}</div>
          <div className="summary-card__sub">Across {sales.length} day(s)</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__label">Inventory SKUs</div>
          <div className="summary-card__value">{inventory.length}</div>
          <div className="summary-card__sub">{lowStock.length} low stock</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__label">Shifts Logged</div>
          <div className="summary-card__value">{shifts.length}</div>
          <div className="summary-card__sub">All time</div>
        </div>
      </div>

      <div className="grid grid--two">
        <section className="card">
          <div className="card__header">
            <h2 className="card__title">Sales Trend (last 30 records)</h2>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : trendData.length === 0 ? (
            <p className="muted">No sales data yet.</p>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">Sales Breakdown</h2>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : breakdown.every((b) => b.value === 0) ? (
            <p className="muted">No sales data yet.</p>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label={(d) => d.name}
                  >
                    {breakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">Shifts by Role</h2>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : shiftsByRole.length === 0 ? (
            <p className="muted">No shifts yet.</p>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={shiftsByRole}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="role" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Shifts" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">Low Stock Items</h2>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : lowStock.length === 0 ? (
            <p className="muted">All items above reorder level.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Reorder ≤</th>
                  <th>Supplier</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((i) => (
                  <tr key={i.id}>
                    <td>{i.item_name}</td>
                    <td>
                      {i.quantity} {i.unit}
                    </td>
                    <td>{i.reorder_level}</td>
                    <td>{i.supplier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  )
}
