// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  StatCardSkeleton,
  OrderCardSkeleton,
  PageHeaderSkeleton,
} from '../components/SkeletonCards'
import {
  FiPackage,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiRefreshCcw,
  FiTrendingUp,
  FiAlertTriangle,
  FiArrowLeft,
  FiCalendar,
  FiDollarSign,
  FiPercent,
  FiRefreshCw,
  FiAlertCircle,
} from 'react-icons/fi'

const statusLabels = {
  new: 'جديد',
  confirmed: 'مؤكد',
  shipped: 'قيد التوصيل',
  delivered: 'تم التسليم',
  returned: 'رجع',
}

const getDashboardErrorMessage = (err) => {
  if (!err.response) {
    return {
      title: 'تعذر الاتصال بالخادم',
      description: 'تحقق من اتصال الإنترنت أو حاول مرة أخرى بعد لحظات.',
    }
  }

  if (err.response.status === 401) {
    return {
      title: 'انتهت جلسة الدخول',
      description: 'يرجى تسجيل الدخول مرة أخرى لعرض لوحة التحكم.',
    }
  }

  if (err.response.status === 403) {
    return {
      title: 'لا تملك صلاحية الوصول',
      description: 'لا يمكنك عرض هذه البيانات بهذا الحساب.',
    }
  }

  if (err.response.status >= 500) {
    return {
      title: 'حدث خطأ في الخادم',
      description: 'الخدمة غير متاحة مؤقتًا، حاول مرة أخرى بعد قليل.',
    }
  }

  return {
    title: 'تعذر تحميل لوحة التحكم',
    description:
      err.response?.data?.message ||
      'لم نتمكن من تحميل الإحصائيات، حاول مرة أخرى بعد لحظات.',
  }
}

const getAttentionCountText = (count) => {
  if (count === 1) {
    return 'لديك طلب واحد يحتاج إلى متابعة.'
  }

  if (count === 2) {
    return 'لديك طلبان يحتاجان إلى متابعة.'
  }

  return `لديك ${count} طلب تحتاج إلى متابعة.`
}

function DashboardSkeleton() {
  return (
    <>
      <div className="mb-7">
        <PageHeaderSkeleton />
      </div>

      {/* Revenue Skeleton */}
      <div className="mb-6 animate-pulse rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="mb-4 h-4 w-28 rounded-full bg-slate-100" />
            <div className="mb-4 h-10 w-44 rounded-full bg-slate-200" />
            <div className="h-3 w-32 rounded-full bg-slate-100" />
          </div>

          <div className="h-12 w-12 rounded-2xl bg-slate-100" />
        </div>
      </div>

      {/* Quick Stats Skeleton */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Attention Orders Skeleton */}
      <div className="mb-6 rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex animate-pulse items-start gap-3">
          <div className="h-11 w-11 shrink-0 rounded-2xl bg-slate-100" />

          <div className="min-w-0 flex-1">
            <div className="mb-3 h-4 w-36 rounded-full bg-slate-200" />
            <div className="h-3 w-56 rounded-full bg-slate-100" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
    </>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  const { user } = useAuth()

  useEffect(() => {
    setLoading(true)
    setError(null)

    api.get('/dashboard')
      .then(res => {
        setStats(res.data)
      })
      .catch(err => {
        console.error(err)
        setStats(null)
        setError(getDashboardErrorMessage(err))
      })
      .finally(() => setLoading(false))
  }, [retryKey])

  const retryLoadingDashboard = () => {
    setRetryKey(prev => prev + 1)
  }

  const getOrderAge = (createdAt) => {
    const createdDate = new Date(createdAt)
    const diffMs = Date.now() - createdDate.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays === 1) {
      return 'منذ يوم'
    }

    if (diffDays === 2) {
      return 'منذ يومين'
    }

    if (diffDays >= 3 && diffDays <= 10) {
      return `منذ ${diffDays} أيام`
    }

    if (diffDays > 10) {
      return `منذ ${diffDays} يوم`
    }

    if (diffHours <= 0) {
      return 'منذ قليل'
    }

    if (diffHours === 1) {
      return 'منذ ساعة'
    }

    if (diffHours === 2) {
      return 'منذ ساعتين'
    }

    if (diffHours >= 3 && diffHours <= 10) {
      return `منذ ${diffHours} ساعات`
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

  const quickStats = stats ? [
    {
      label: 'طلبات اليوم',
      value: stats.todayOrders || 0,
      suffix: 'طلب',
      icon: FiCalendar,
      color: 'bg-sky-50 text-sky-600 border-sky-100',
    },
    {
      label: 'مبيعات اليوم',
      value: (stats.todayRevenue || 0).toLocaleString(),
      suffix: 'دج',
      icon: FiDollarSign,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'طلبات هذا الأسبوع',
      value: stats.weekOrders || 0,
      suffix: 'طلب',
      icon: FiCalendar,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      label: 'مبيعات هذا الأسبوع',
      value: (stats.weekRevenue || 0).toLocaleString(),
      suffix: 'دج',
      icon: FiTrendingUp,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    {
      label: 'نسبة الرجوع',
      value: stats.returnRate || 0,
      suffix: '%',
      icon: FiPercent,
      color: 'bg-rose-50 text-rose-600 border-rose-100',
    },
  ] : []

  return (
    <Layout>
      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-500">
            <FiAlertCircle size={30} />
          </div>

          <p className="text-lg font-black text-slate-900">
            {error.title}
          </p>

          <p className="mt-2 text-sm font-bold leading-7 text-slate-500">
            {error.description}
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={retryLoadingDashboard}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-extrabold text-red-600 transition hover:bg-red-100 active:scale-[0.99]"
            >
              <FiRefreshCw size={18} />
              إعادة المحاولة
            </button>

            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200 active:scale-[0.99]"
            >
              الذهاب إلى الطلبات
              <FiArrowLeft size={18} />
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-7">
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              مرحباً {user?.name || ''}
            </h2>

            <p className="mt-1 text-sm font-medium text-slate-500">
              نظرة عامة على متجرك
            </p>
          </div>

          {/* Revenue Card */}
          <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-blue-800 p-6 text-white shadow-lg shadow-blue-600/20">
            <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/10"></div>
            <div className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-white/10"></div>

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-100">
                  إجمالي المبيعات
                </p>

                <p className="mt-2 text-4xl font-black tracking-tight">
                  {(stats?.revenue || 0).toLocaleString()} دج
                </p>

                <p className="mt-3 text-xs font-medium text-blue-100">
                  من الطلبات المسلّمة فقط
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <FiTrendingUp className="text-2xl text-white" />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
            {quickStats.map((card, i) => {
              const Icon = card.icon

              return (
                <div
                  key={i}
                  className={`group rounded-3xl border p-4 ${card.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-2xl font-black tracking-tight">
                        {card.value}
                        <span className="mr-1 text-xs font-extrabold opacity-80">
                          {card.suffix}
                        </span>
                      </p>

                      <p className="mt-1 text-xs font-bold opacity-80">
                        {card.label}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 transition-transform duration-300 group-hover:scale-110">
                      <Icon className="text-xl" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Attention Orders */}
          {stats?.attentionCount > 0 && (
            <div className="mb-6 rounded-3xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <FiAlertTriangle size={22} />
                </div>

                <div className="min-w-0">
                  <h3 className="text-base font-black text-slate-900">
                    طلبات تحتاج متابعة
                  </h3>

                  <p className="mt-1 text-sm font-semibold leading-6 text-amber-700">
                    {getAttentionCountText(stats.attentionCount)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                {stats.attentionOrders?.map(order => (
                  <Link
                    key={order._id}
                    to={`/orders/${order._id}`}
                    className="group rounded-2xl border border-amber-100 bg-white/85 p-3 transition hover:bg-white active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-black text-slate-900">
                          {order.customerName}
                        </p>

                        <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                          {order.product} — {statusLabels[order.status] || order.status}
                        </p>

                        <p className="mt-1 line-clamp-2 text-xs font-bold leading-5 text-amber-700">
                          {order.reason}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-slate-400 transition group-hover:text-amber-600">
                        <span className="whitespace-nowrap text-xs font-black">
                          {getOrderAge(order.createdAt)}
                        </span>

                        <FiArrowLeft size={16} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {stats.attentionCount > 5 && (
                <p className="mt-3 text-xs font-bold leading-6 text-amber-700">
                  يتم عرض أول 5 طلبات فقط. راجع صفحة الطلبات لمتابعة البقية.
                </p>
              )}
            </div>
          )}

          {/* No Attention Orders */}
          {stats?.attentionCount === 0 && (
            <div className="mb-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <FiCheckCircle size={20} />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-900">
                    كل الطلبات تحت السيطرة
                  </p>

                  <p className="mt-0.5 text-xs font-semibold text-emerald-700">
                    لا توجد طلبات تحتاج متابعة حالياً.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {statCards.map((card, i) => {
              const Icon = card.icon

              return (
                <div
                  key={i}
                  className={`group rounded-3xl border p-4 ${card.color} transition-all duration-300 hover:-translate-y-1 hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-3xl font-black tracking-tight">
                        {card.value || 0}
                      </p>

                      <p className="mt-1 text-sm font-bold opacity-80">
                        {card.label}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 transition-transform duration-300 group-hover:scale-110">
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