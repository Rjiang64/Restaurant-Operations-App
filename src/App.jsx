import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Inventory from './pages/Inventory.jsx'
import Sales from './pages/Sales.jsx'
import Shifts from './pages/Shifts.jsx'
import Tasks from './pages/Tasks.jsx'
import Reports from './pages/Reports.jsx'

export default function App() {
  return (
    <Routes>
      {/* Landing IS the login page (split screen, image left, form right). */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Landing />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/shifts" element={<Shifts />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
