// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiRefreshCcw,
  FiTrendingUp,
  FiAlertTriangle,
  FiArrowLeft,
} from 'react-icons/fi'

const statusLabels = {
  new: 'جديد',
  confirmed: 'مؤكد',
  shipped: 'قيد التوصيل',
  delivered: 'تم التسليم',
  returned: 'رجع',
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const getOrderAge = (createdAt) => {
    const createdDate = new Date(createdAt)
    const diffMs = Date.now() - createdDate.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays >= 1) {
      return `منذ ${diffDays} يوم`
    }

    return `منذ ${diffHours} ساعة`
  }

  const statCards = stats ? [
    {
      label: 'إجمالي الطلبات',
      value: stats.total,
      icon: FiPackage,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      label: 'جديدة',
      value: stats.newOrders,
      icon: FiClock,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      label: 'مؤكدة',
      value: stats.confirmed,
      icon: FiCheckCircle,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'قيد التوصيل',
      value: stats.shipped,
      icon: FiTruck,
      color: 'bg-violet-50 text-violet-600 border-violet-100',
    },
    {
      label: 'مسلّمة',
      value: stats.delivered,
      icon: FiCheckCircle,
      color: 'bg-green-50 text-green-600 border-green-100',
    },
    {
      label: 'راجعة',
      value: stats.returned,
      icon: FiRefreshCcw,
      color: 'bg-red-50 text-red-600 border-red-100',
    },
  ] : []

  return (
    <Layout>
      <div className="mb-7">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          أهلاً {user?.name} 👋
        </h2>

        <p className="text-slate-500 text-sm font-medium mt-1">
          نظرة عامة على متجرك
        </p>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-400 font-medium shadow-sm">
          جاري التحميل...
        </div>
      ) : (
        <>
          {/* Revenue Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-blue-800 text-white rounded-3xl p-6 mb-6 shadow-lg shadow-blue-600/20">
            <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-white/10"></div>
            <div className="absolute -bottom-12 -right-12 w-40 h-40 rounded-full bg-white/10"></div>

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-blue-100 text-sm font-semibold">
                  إجمالي المبيعات
                </p>

                <p className="text-4xl font-black tracking-tight mt-2">
                  {(stats?.revenue || 0).toLocaleString()} دج
                </p>

                <p className="text-blue-100 text-xs font-medium mt-3">
                  من الطلبات المسلّمة فقط
                </p>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
                <FiTrendingUp className="text-2xl text-white" />
              </div>
            </div>
          </div>

          {/* Attention Orders */}
          {stats?.attentionCount > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 mb-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <FiAlertTriangle size={22} />
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      طلبات تحتاج متابعة
                    </h3>

                    <p className="text-sm font-semibold text-amber-700 mt-1">
                      لديك {stats.attentionCount} طلب قديم يحتاج إلى إجراء.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {stats.attentionOrders?.map(order => (
                  <Link
                    key={order._id}
                    to={`/orders/${order._id}`}
                    className="group bg-white/80 hover:bg-white border border-amber-100 rounded-2xl p-3 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate">
                          {order.customerName}
                        </p>

                        <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate">
                          {order.product} — {statusLabels[order.status]}
                        </p>

                        <p className="text-xs font-medium text-amber-700 mt-1">
                          {order.reason}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-slate-400 group-hover:text-amber-600 transition">
                        <span className="text-xs font-bold">
                          {getOrderAge(order.createdAt)}
                        </span>

                        <FiArrowLeft size={16} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {stats.attentionCount > 5 && (
                <p className="text-xs font-semibold text-amber-700 mt-3">
                  يتم عرض أول 5 طلبات فقط. ادخل إلى صفحة الطلبات لمراجعة البقية.
                </p>
              )}
            </div>
          )}

          {/* No Attention Orders */}
          {stats?.attentionCount === 0 && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-4 mb-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FiCheckCircle size={20} />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-900">
                    كل الطلبات تحت السيطرة
                  </p>

                  <p className="text-xs font-semibold text-emerald-700 mt-0.5">
                    لا توجد طلبات قديمة تحتاج متابعة حالياً.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {statCards.map((card, i) => {
              const Icon = card.icon

              return (
                <div
                  key={i}
                  className={`group rounded-3xl p-4 border ${card.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-3xl font-black tracking-tight">
                        {card.value || 0}
                      </p>

                      <p className="text-sm font-bold mt-1 opacity-80">
                        {card.label}
                      </p>
                    </div>

                    <div className="w-10 h-10 rounded-2xl bg-white/70 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <Icon className="text-xl" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </Layout>
  )
}