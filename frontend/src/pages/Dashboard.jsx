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
  FiMapPin,
  FiCheck,
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
  return {
    title: 'تعذر تحميل لوحة التحكم',
    description: err.response?.data?.message || 'حاول مرة أخرى بعد لحظات.',
  }
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
      .then((res) => setStats(res.data))
      .catch((err) => {
        console.error(err)
        setError(getDashboardErrorMessage(err))
      })
      .finally(() => setLoading(false))
  }, [retryKey])

  const getOrderAge = (createdAt) => {
    const diffMs = Date.now() - new Date(createdAt).getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays === 1) return 'منذ يوم'
    if (diffDays === 2) return 'منذ يومين'
    if (diffDays > 2) return `منذ ${diffDays} يوم`
    if (diffHours <= 0) return 'منذ قليل'
    return `منذ ${diffHours} ساعة`
  }

  const orderStatuses = stats ? [
    { label: 'الكل', value: stats.total, color: 'text-slate-900 bg-slate-100', icon: FiPackage },
    { label: 'جديدة', value: stats.newOrders, color: 'text-blue-600 bg-blue-50', icon: FiClock },
    { label: 'مؤكدة', value: stats.confirmed, color: 'text-emerald-600 bg-emerald-50', icon: FiCheck },
    { label: 'توصيل', value: stats.shipped, color: 'text-amber-600 bg-amber-50', icon: FiTruck },
    { label: 'مسلّمة', value: stats.delivered, color: 'text-green-600 bg-green-50', icon: FiCheckCircle },
    { label: 'راجعة', value: stats.returned, color: 'text-red-600 bg-red-50', icon: FiRefreshCcw },
  ] : []

  return (
    <Layout>
      {loading ? (
        <div className="space-y-4">
          <PageHeaderSkeleton />
          <div className="h-40 rounded-3xl bg-slate-100 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-red-50 text-red-500">
            <FiAlertCircle size={30} />
          </div>
          <p className="text-lg font-black text-slate-900">{error.title}</p>
          <p className="mt-2 text-sm font-bold leading-7 text-slate-500">{error.description}</p>
          <button
            type="button"
            onClick={() => setRetryKey((k) => k + 1)}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-red-50 px-5 py-3 text-sm font-extrabold text-red-600 hover:bg-red-100 transition"
          >
            <FiRefreshCw size={17} />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6 pb-20">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                مرحباً {user?.name || ''} 👋
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
                نظرة شاملة ومباشرة على نشاط متجرك ومبيعاتك
              </p>
            </div>
            <Link
              to="/orders/new"
              className="rounded-2xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition active:scale-95"
            >
              طلب جديد
            </Link>
          </div>

          {/* بطاقتي المالية: المبيعات وصافي الأرباح التقديرية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* إجمالي المبيعات */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-xl shadow-blue-600/15">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-100">إجمالي المبيعات المحققة</span>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight mt-1.5">
                    {(stats?.revenue || 0).toLocaleString()} <span className="text-lg font-bold text-blue-200">دج</span>
                  </h3>
                  <p className="mt-2 text-[11px] font-semibold text-blue-200">
                    محسوبة من الطلبات المسلّمة فقط
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <FiDollarSign className="text-2xl text-white" />
                </div>
              </div>
            </div>

            {/* صافي الربح التقديري */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 p-6 text-white shadow-xl shadow-emerald-600/15">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-100">صافي الربح التقديري</span>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight mt-1.5">
                    {(stats?.netProfit || 0).toLocaleString()} <span className="text-lg font-bold text-emerald-200">دج</span>
                  </h3>
                  <p className="mt-2 text-[11px] font-semibold text-emerald-200">
                    بعد خصم أسعار الجملة المسجلة بالكتالوج
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                  <FiTrendingUp className="text-2xl text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* شريط نسب التوصيل والنشاط السريع */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 block">نسبة التسليم</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                {stats?.deliveryRate || 0}%
              </p>
              <span className="text-[10px] font-semibold text-slate-400">من الطرود المنتهية</span>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 block">نسبة الراجع</span>
              <p className="text-xl sm:text-2xl font-black text-rose-500 mt-1">
                {stats?.returnRate || 0}%
              </p>
              <span className="text-[10px] font-semibold text-slate-400">من الطرود المنتهية</span>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 block">طلبات اليوم</span>
              <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
                {stats?.todayOrders || 0}
              </p>
              <span className="text-[10px] font-semibold text-slate-400">
                {(stats?.todayRevenue || 0).toLocaleString()} دج محققة
              </span>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 block">طلبات الأسبوع</span>
              <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">
                {stats?.weekOrders || 0}
              </p>
              <span className="text-[10px] font-semibold text-slate-400">
                {(stats?.weekRevenue || 0).toLocaleString()} دج محققة
              </span>
            </div>
          </div>

          {/* توزيع الحالات في مكان بارز */}
          <div>
            <h3 className="text-xs font-black text-slate-400 mb-2.5">توزيع حالات الطلبات</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {orderStatuses.map((st, i) => {
                const Icon = st.icon
                return (
                  <div
                    key={i}
                    className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm flex flex-col items-center text-center"
                  >
                    <div className={`h-8 w-8 rounded-xl flex items-center justify-center mb-1.5 ${st.color}`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-base sm:text-lg font-black text-slate-800">{st.value || 0}</span>
                    <span className="text-[11px] font-bold text-slate-400">{st.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* شبكة مشتركة: أكثر الولايات طلباً + تنبيهات المتابعة */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* أكثر الولايات طلباً */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FiMapPin size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">أكثر الولايات طلباً</h3>
                  <p className="text-[11px] font-semibold text-slate-400">تركز الزبائن حسب الموقع الجغرافي</p>
                </div>
              </div>

              {stats?.topWilayas?.length > 0 ? (
                <div className="space-y-3">
                  {stats.topWilayas.map((w, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-slate-700">{w.wilaya}</span>
                        <span className="text-slate-400">{w.count} طلب ({w.percentage}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-500"
                          style={{ width: `${w.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-400 py-4 text-center">لا توجد بيانات متاحة حالياً</p>
              )}
            </div>

            {/* طلبات تحتاج متابعة */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FiAlertTriangle size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">تحتاج إلى متابعة</h3>
                    <p className="text-[11px] font-semibold text-amber-600">
                      {stats?.attentionCount > 0 ? `${stats.attentionCount} طلب معلق` : 'الكل تحت السيطرة'}
                    </p>
                  </div>
                </div>

                <Link to="/orders" className="text-xs font-bold text-blue-600 hover:underline">
                  عرض الطلبات
                </Link>
              </div>

              {stats?.attentionOrders?.length > 0 ? (
                <div className="space-y-2">
                  {stats.attentionOrders.slice(0, 3).map((o) => (
                    <Link
                      key={o._id}
                      to={`/orders/${o._id}`}
                      className="block rounded-2xl border border-slate-100 bg-slate-50/60 p-2.5 transition hover:bg-slate-100 text-right"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-800">{o.customerName}</span>
                        <span className="text-[10px] font-bold text-slate-400">{getOrderAge(o.createdAt)}</span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">{o.product}</p>
                      <span className="text-[10px] font-black text-amber-700 block mt-1">
                        ⚠️ {o.reason}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <FiCheckCircle size={24} className="mx-auto text-emerald-500 mb-1" />
                  <p className="text-xs font-bold text-slate-600">لا توجد طلبات معلقة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}