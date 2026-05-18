// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import NewOrder from './pages/NewOrder'
import OrderDetail from './pages/OrderDetail'
import Settings from './pages/Settings'

function AppLoadingScreen() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-50 px-6"
      dir="rtl"
    >
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 text-2xl font-black text-white shadow-lg shadow-blue-600/20">
          ط
        </div>

        <h1 className="text-xl font-black text-slate-900">
          طلبيات
        </h1>

        <p className="mt-2 text-sm font-bold text-slate-500">
          جاري تجهيز التطبيق...
        </p>

        <div className="mx-auto mt-5 h-2 w-36 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-blue-600" />
        </div>
      </div>
    </div>
  )
}

function PrivateRoute({ children }) {
  const { loading } = useAuth()
  const token = localStorage.getItem('token')

  if (loading) {
    return <AppLoadingScreen />
  }

  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <PrivateRoute>
            <Orders />
          </PrivateRoute>
        }
      />

      <Route
        path="/orders/new"
        element={
          <PrivateRoute>
            <NewOrder />
          </PrivateRoute>
        }
      />

      <Route
        path="/orders/:id"
        element={
          <PrivateRoute>
            <OrderDetail />
          </PrivateRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}