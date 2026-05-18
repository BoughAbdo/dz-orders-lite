// src/components/Layout.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  FiBarChart2,
  FiPackage,
  FiPlusCircle,
  FiLogOut,
  FiSettings, 
} from 'react-icons/fi'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', label: 'الرئيسية', icon: FiBarChart2 },
    { path: '/orders', label: 'الطلبات', icon: FiPackage },
    { path: '/orders/new', label: 'طلب جديد', icon: FiPlusCircle },
    { path: '/settings', label: 'الإعدادات', icon: FiSettings },
  ]

  const isNavItemActive = (path) => {
    if (path === '/orders') {
      return (
        location.pathname === '/orders' ||
        (
          location.pathname.startsWith('/orders/') &&
          location.pathname !== '/orders/new'
        )
      )
    }

    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link
            to="/dashboard"
            className="flex min-w-0 items-center gap-3"
            aria-label="الذهاب إلى لوحة التحكم"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
              <img
                src="/logo.png"
                alt="طلبيات"
                className="h-8 w-8 object-contain"
              />
            </div>

            <div className="min-w-0">
              <h1 className="text-lg font-black leading-6 tracking-tight text-slate-900">
                طلبيات
              </h1>

              <p className="max-w-[180px] truncate text-xs font-semibold text-slate-400">
                {user?.businessName || 'متجرك'}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-red-50 px-3 py-2 text-sm font-extrabold text-red-600 transition hover:bg-red-100 active:scale-[0.98]"
            aria-label="تسجيل الخروج"
          >
            <FiLogOut size={16} />
            خروج
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 pb-28">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-100 bg-white/95 shadow-[0_-10px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = isNavItemActive(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                aria-label={item.label}
                className={`group flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-xs font-extrabold transition duration-200
                  ${isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-700'
                  }`}
              >
                <Icon
                  size={22}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`}
                />

                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}