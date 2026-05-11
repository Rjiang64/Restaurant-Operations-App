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
import { formatCurrency, formatHours, shiftMinutes } from '../lib/format'
import { getReportRange, inRange } from '../lib/payPeriod'
import PageHeader from '../components/PageHeader.jsx'

const PIE_COLORS = ['#8B1E1E', '#D97706', '#2F855A', '#B7791F']

const FILTERS = [
  { key: 'this-week',  label: 'This Week' },
  { key: 'last-week',  label: 'Last Week' },
  { key: 'this-month', label: 'This Month' },
  { key: 'current-pp', label: 'Pay Period' },
  { key: 'all-time',   label: 'All Time' }
]

function formatPct(value) {
  if (!Number.isFinite(value) || value <= 0) return '—'
  return `${(value * 100).toFixed(1)}%`
}

export default function Reports() {
  const [filter, setFilter] = useState('current-pp')
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const [sales, setSales] = useState([])
  const [inventory, setInventory] = useState([])
  const [shifts, setShifts] = useState([])
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    setErr('')
    const [s, i, sh, em] = await Promise.all([
      supabase.from('sales_records').select('*').order('sale_date', { ascending: true }),
      supabase.from('inventory_items').select('*'),
      supabase.from('shifts').select('*, employee:employees(title)'),
      supabase.from('employees').select('*')
    ])
    const e1 = s.error || i.error || sh.error || em.error
    if (e1) setErr(e1.message)
    setSales(s.data ?? [])
    setInventory(i.data ?? [])
    setShifts(sh.data ?? [])
    setEmployees(em.data ?? [])
    setLoading(false)
  }

  // ---------- Range ----------
  const range = useMemo(() => getReportRange(filter), [filter])

  const filteredSales = useMemo(
    () => sales.filter((r) => inRange(r.sale_date, range)),
    [sales, range]
  )
  const filteredShifts = useMemo(
    () => shifts.filter((s) => inRange(s.shift_date, range)),
    [shifts, range]
  )

  const empMap = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees])

  // ---------- Sales metrics ----------
  const totalSales = filteredSales.reduce((sum, r) => sum + Number(r.total_sales || 0), 0)
  const daysWithSales = filteredSales.length
  const avgDailySales = daysWithSales > 0 ? totalSales / daysWithSales : 0

  const breakdown = useMemo(() => {
    const sums = { Lunch: 0, Dinner: 0, Takeout: 0, Delivery: 0 }
    filteredSales.forEach((r) => {
      sums.Lunch    += Number(r.lunch_sales    || 0)
      sums.Dinner   += Number(r.dinner_sales   || 0)
      sums.Takeout  += Number(r.takeout_sales  || 0)
      sums.Delivery += Number(r.delivery_sales || 0)
    })
    return Object.entries(sums).map(([name, value]) => ({ name, value }))
  }, [filteredSales])

  const trendData = useMemo(
    () =>
      filteredSales.map((r) => ({
        date: r.sale_date,
        total: Number(r.total_sales || 0)
      })),
    [filteredSales]
  )

  // ---------- Labor metrics ----------
  const labor = useMemo(() => {
    let totalMins = 0
    let totalBillableMins = 0
    let totalCost = 0
    for (const s of filteredShifts) {
      const mins = shiftMinutes(s.start_time, s.end_time, s.unpaid_break_minutes)
      totalMins += mins
      const emp = s.employee_id ? empMap.get(s.employee_id) : null
      if (emp?.hourly_rate != null) {
        totalBillableMins += mins
        totalCost += (mins / 60) * Number(emp.hourly_rate)
      }
    }
    return { totalMins, totalBillableMins, totalCost }
  }, [filteredShifts, empMap])

  const laborHours = labor.totalMins / 60
  const laborPctOfSales = totalSales > 0 ? labor.totalCost / totalSales : 0
  const salesPerLaborHour = laborHours > 0 ? totalSales / laborHours : 0

  // ---------- Labor by role / shifts by role ----------
  const laborByRole = useMemo(() => {
    const map = {}
    for (const s of filteredShifts) {
      const emp = s.employee_id ? empMap.get(s.employee_id) : null
      const role = s.role || emp?.title || s.employee?.title || 'Unknown'
      const mins = shiftMinutes(s.start_time, s.end_time, s.unpaid_break_minutes)
      map[role] = (map[role] || 0) + mins
    }
    return Object.entries(map)
      .map(([role, mins]) => ({ role, hours: Math.round((mins / 60) * 10) / 10 }))
      .sort((a, b) => b.hours - a.hours)
  }, [filteredShifts, empMap])

  const shiftsByRole = useMemo(() => {
    const map = {}
    for (const s of filteredShifts) {
      const emp = s.employee_id ? empMap.get(s.employee_id) : null
      const role = s.role || emp?.title || s.employee?.title || 'Unknown'
      map[role] = (map[role] || 0) + 1
    }
    return Object.entries(map)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)
  }, [filteredShifts, empMap])

  // ---------- Leaderboard ----------
  const leaderboard = useMemo(() => {
    const data = new Map()
    for (const s of filteredShifts) {
      if (!s.employee_id) continue
      const e = empMap.get(s.employee_id)
      if (!e) continue
      const mins = shiftMinutes(s.start_time, s.end_time, s.unpaid_break_minutes)
      const entry = data.get(e.id) || { employee: e, shifts: 0, mins: 0 }
      entry.shifts += 1
      entry.mins += mins
      data.set(e.id, entry)
    }
    return Array.from(data.values())
      .map((entry) => {
        const hours = entry.mins / 60
        const pay = entry.employee.hourly_rate
          ? hours * Number(entry.employee.hourly_rate)
          : null
        return { ...entry, hours, pay }
      })
      .sort((a, b) => b.mins - a.mins)
      .slice(0, 10)
  }, [filteredShifts, empMap])

  // ---------- Inventory ----------
  const lowStock = useMemo(
    () => inventory.filter((i) => Number(i.quantity) <= Number(i.reorder_level)),
    [inventory]
  )

  // ---------- Insights ----------
  const insights = useMemo(() => {
    const items = []

    const positive = breakdown.filter((b) => b.value > 0)
    if (positive.length) {
      const top = positive.reduce((a, b) => (a.value > b.value ? a : b))
      const totalChannels = positive.reduce((s, b) => s + b.value, 0)
      const share = (top.value / totalChannels) * 100
      items.push({
        tone: 'primary',
        icon: '$',
        text: `${top.name} is your highest-revenue service period at ${share.toFixed(0)}% of sales for ${range.label}.`
      })
    }

    if (lowStock.length > 0) {
      items.push({
        tone: 'warn',
        icon: '!',
        text: `${lowStock.length} inventory item${lowStock.length === 1 ? '' : 's'} at or below reorder threshold — needs purchasing attention.`
      })
    } else if (inventory.length > 0) {
      items.push({
        tone: 'success',
        icon: '✓',
        text: 'All inventory items are above reorder threshold.'
      })
    }

    if (laborByRole.length > 0) {
      const top = laborByRole[0]
      items.push({
        tone: 'accent',
        icon: 'H',
        text: `${top.role} has the most scheduled hours this period (${formatHours(top.hours * 60)} across ${shiftsByRole.find((r) => r.role === top.role)?.count ?? 0} shifts).`
      })
    }

    if (totalSales > 0 && labor.totalCost > 0) {
      items.push({
        tone: laborPctOfSales > 0.35 ? 'warn' : 'success',
        icon: '%',
        text: `Labor cost is ${formatPct(laborPctOfSales)} of sales (${formatCurrency(labor.totalCost)} on ${formatCurrency(totalSales)} of revenue).`
      })
    }

    if (laborHours > 0 && totalSales > 0) {
      items.push({
        tone: 'success',
        icon: '⌁',
        text: `Sales per labor hour is ${formatCurrency(salesPerLaborHour)} (${formatHours(labor.totalMins)} scheduled).`
      })
    }

    return items
  }, [
    breakdown,
    lowStock,
    inventory.length,
    laborByRole,
    shiftsByRole,
    totalSales,
    labor.totalCost,
    laborPctOfSales,
    laborHours,
    salesPerLaborHour,
    labor.totalMins,
    range.label
  ])

  const hasAnyData =
    filteredSales.length > 0 || filteredShifts.length > 0 || inventory.length > 0

  return (
    <div className="page">
      <PageHeader
        title="Reports"
        subtitle="Operational summaries, labor cost, and efficiency metrics."
      />

      {err && <div className="alert alert--error">{err}</div>}

      {/* ----------------- Filter bar ----------------- */}
      <div className="report-filterbar">
        <div className="segmented report-filterbar__seg" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`segmented__btn ${filter === f.key ? 'segmented__btn--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="report-filterbar__label">
          <span className="muted">Showing:</span> <strong>{range.label}</strong>
        </div>
      </div>

      {/* ----------------- KPI cards ----------------- */}
      <div className="grid grid--cards">
        <div className="summary-card summary-card--primary">
          <div className="summary-card__label">Total Sales</div>
          <div className="summary-card__value">{formatCurrency(totalSales)}</div>
          <div className="summary-card__sub">
            {daysWithSales} day{daysWithSales === 1 ? '' : 's'} recorded
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card__label">Avg Daily Sales</div>
          <div className="summary-card__value">{formatCurrency(avgDailySales)}</div>
          <div className="summary-card__sub">Across {daysWithSales || 0} day(s)</div>
        </div>
        <div className="summary-card summary-card--accent">
          <div className="summary-card__label">Labor Cost</div>
          <div className="summary-card__value">{formatCurrency(labor.totalCost)}</div>
          <div className="summary-card__sub">
            {labor.totalBillableMins > 0
              ? `${formatHours(labor.totalBillableMins)} at hourly rate`
              : 'Set hourly rates to populate'}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card__label">Labor Hours</div>
          <div className="summary-card__value">{formatHours(labor.totalMins)}</div>
          <div className="summary-card__sub">{filteredShifts.length} shift(s)</div>
        </div>
        <div className="summary-card summary-card--warn">
          <div className="summary-card__label">Labor % of Sales</div>
          <div className="summary-card__value">{formatPct(laborPctOfSales)}</div>
          <div className="summary-card__sub">
            {totalSales > 0 && labor.totalCost > 0
              ? 'Typical range: 25–35%'
              : 'Needs sales + labor data'}
          </div>
        </div>
        <div className="summary-card summary-card--success">
          <div className="summary-card__label">Sales / Labor Hour</div>
          <div className="summary-card__value">
            {laborHours > 0 && totalSales > 0 ? formatCurrency(salesPerLaborHour) : '—'}
          </div>
          <div className="summary-card__sub">Revenue per scheduled hour</div>
        </div>
        <div className="summary-card">
          <div className="summary-card__label">Inventory SKUs</div>
          <div className="summary-card__value">{inventory.length}</div>
          <div className="summary-card__sub">
            {lowStock.length > 0 ? `${lowStock.length} low stock` : 'All above reorder'}
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card__label">Active Employees</div>
          <div className="summary-card__value">
            {employees.filter((e) => e.active).length}
          </div>
          <div className="summary-card__sub">{employees.length} total in roster</div>
        </div>
      </div>

      {/* ----------------- Insights ----------------- */}
      <section className="card">
        <div className="card__header">
          <h2 className="card__title">Manager Insights</h2>
        </div>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : insights.length === 0 ? (
          <p className="muted">
            No data yet for {range.label}. Switch filter or add sales / shifts to see insights.
          </p>
        ) : (
          <ul className="insights-list">
            {insights.map((ins, idx) => (
              <li key={idx} className={`insight insight--${ins.tone}`}>
                <span className="insight__icon">{ins.icon}</span>
                <span className="insight__text">{ins.text}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ----------------- Charts grid ----------------- */}
      <div className="grid grid--two">
        <section className="card">
          <div className="card__header">
            <h2 className="card__title">Sales Trend</h2>
            <span className="muted" style={{ fontSize: 12 }}>{range.label}</span>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : trendData.length === 0 ? (
            <p className="muted">No sales in this range.</p>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={trendData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#8B1E1E"
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#8B1E1E' }}
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
            <span className="muted" style={{ fontSize: 12 }}>By service period</span>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : breakdown.every((b) => b.value === 0) ? (
            <p className="muted">No sales in this range.</p>
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
            <h2 className="card__title">Labor Hours by Role</h2>
            <span className="muted" style={{ fontSize: 12 }}>{range.label}</span>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : laborByRole.length === 0 ? (
            <p className="muted">No shifts in this range.</p>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={laborByRole} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
                  <XAxis dataKey="role" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => `${v}h`} />
                  <Legend />
                  <Bar dataKey="hours" name="Hours" fill="#8B1E1E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">Shifts by Role</h2>
            <span className="muted" style={{ fontSize: 12 }}>{range.label}</span>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : shiftsByRole.length === 0 ? (
            <p className="muted">No shifts in this range.</p>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={shiftsByRole}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
                  <XAxis dataKey="role" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Shifts" fill="#D97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {/* ----------------- Tables ----------------- */}
      <div className="grid grid--two">
        <section className="card">
          <div className="card__header">
            <h2 className="card__title">Employee Hours Leaderboard</h2>
            <span className="muted" style={{ fontSize: 12 }}>{range.label}</span>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : leaderboard.length === 0 ? (
            <p className="muted">No employee shifts in this range.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th className="nowrap">Employee</th>
                    <th className="nowrap">Title</th>
                    <th className="num">Shifts</th>
                    <th className="num">Hours</th>
                    <th className="num">Est. Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map(({ employee, shifts: count, mins, pay }) => (
                    <tr key={employee.id}>
                      <td className="nowrap">{employee.name}</td>
                      <td className="nowrap">
                        <span className="badge badge--neutral">{employee.title}</span>
                      </td>
                      <td className="num">{count}</td>
                      <td className="num">{formatHours(mins)}</td>
                      <td className="num">{pay != null ? formatCurrency(pay) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="card">
          <div className="card__header">
            <h2 className="card__title">Low Stock Items</h2>
            <span className="muted" style={{ fontSize: 12 }}>Current inventory state</span>
          </div>
          {loading ? (
            <p className="muted">Loading…</p>
          ) : lowStock.length === 0 ? (
            <p className="muted">All items above reorder level.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th className="num">Qty</th>
                    <th className="num">Reorder ≤</th>
                    <th className="nowrap">Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((i) => (
                    <tr key={i.id}>
                      <td className="nowrap">{i.item_name}</td>
                      <td className="num">
                        {i.quantity} {i.unit}
                      </td>
                      <td className="num">{i.reorder_level}</td>
                      <td className="nowrap">{i.supplier}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {!loading && !hasAnyData && (
        <section className="card">
          <p className="muted">
            No sales, shifts, or inventory yet. Add records or run <code>seed.sql</code> to populate
            demo data.
          </p>
        </section>
      )}
    </div>
  )
}
