import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/', label: 'الرئيسية', icon: '📊' },
    { path: '/orders', label: 'الطلبات', icon: '📦' },
    { path: '/orders/new', label: 'طلب جديد', icon: '➕' },
  ]

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-gray-800 text-lg">DZ Orders</h1>
          <p className="text-xs text-gray-400">{user?.businessName}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-600"
        >
          خروج
        </button>
      </header>

      <main className="p-4 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex-1 flex flex-col items-center py-3 text-xs transition
              ${location.pathname === item.path
                ? 'text-blue-500 font-medium'
                : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <span className="text-xl mb-0.5">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}