// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  StatCardSkeleton,
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
  FiDollarSign,
  FiRefreshCw,
  FiAlertCircle,
  FiMapPin,
  FiCheck,
  FiPlus,
  FiLayers,
  FiBarChart2,
} from 'react-icons/fi'

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
  const [hoveredDay, setHoveredDay] = useState(null)

  const { user } = useAuth()
  const navigate = useNavigate()

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

  // بطاقات الحالات مع مفاتيح الفلترة الخاصة بها
  const orderStatuses = stats ? [
    { key: 'all', label: 'الكل', value: stats.total, color: 'text-slate-900 bg-slate-100 hover:bg-slate-200 border-slate-200', icon: FiPackage },
    { key: 'new', label: 'جديدة', value: stats.newOrders, color: 'text-blue-600 bg-blue-50 hover:bg-blue-100 border-blue-200', icon: FiClock },
    { key: 'confirmed', label: 'مؤكدة', value: stats.confirmed, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-200', icon: FiCheck },
    { key: 'shipped', label: 'توصيل', value: stats.shipped, color: 'text-amber-600 bg-amber-50 hover:bg-amber-100 border-amber-200', icon: FiTruck },
    { key: 'delivered', label: 'مسلّمة', value: stats.delivered, color: 'text-green-600 bg-green-50 hover:bg-green-100 border-green-200', icon: FiCheckCircle },
    { key: 'returned', label: 'راجعة', value: stats.returned, color: 'text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200', icon: FiRefreshCcw },
  ] : []

  // حساب النسبة المئوية لأعمدة الرسم البياني
  const maxDayOrders = Math.max(...(stats?.last7Days?.map((d) => d.ordersCount) || [1]), 1)

  return (
    <Layout>
      {loading ? (
        <div className="space-y-4">
          <PageHeaderSkeleton />
          <div className="h-44 rounded-3xl bg-slate-100 animate-pulse" />
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
        <div className="space-y-6 pb-24">
          {/* Header ترحيبي مع أزرار اختصار سريعة */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  مرحباً {user?.name || ''} 👋
                </h2>
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" title="متصل الآن" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-400 mt-0.5">
                متابعة فورية للمبيعات، الأرباح، وتدفق الطلبيات
              </p>
            </div>

            {/* أزرار الإجراءات السريعة */}
            <div className="flex items-center gap-2">
              <Link
                to="/orders"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-700 shadow-sm hover:bg-slate-50 transition active:scale-95"
              >
                <FiLayers size={15} className="text-blue-600" />
                <span>إدارة الطلبات</span>
              </Link>
              <Link
                to="/orders/new"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 transition active:scale-95"
              >
                <FiPlus size={16} />
                <span>طلب جديد</span>
              </Link>
            </div>
          </div>

          {/* بطاقات المؤشرات المالية الرئيسية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* بطاقة المبيعات */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl shadow-blue-600/15 group transition hover:shadow-2xl hover:shadow-blue-600/25">
              <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl group-hover:scale-125 transition-transform duration-500" />
              <div className="relative flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-100 flex items-center gap-1.5">
                    <FiDollarSign size={14} /> إجمالي المبيعات المحققة
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">
                    {(stats?.revenue || 0).toLocaleString()} <span className="text-lg font-bold text-blue-200">دج</span>
                  </h3>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-lg bg-white/15 px-2 py-0.5 text-[11px] font-bold text-blue-100">
                      من الطلبات المسلّمة ({stats?.delivered || 0} طلب)
                    </span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <FiDollarSign className="text-2xl text-white" />
                </div>
              </div>
            </div>

            {/* بطاقة صافي الربح */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 text-white shadow-xl shadow-emerald-600/15 group transition hover:shadow-2xl hover:shadow-emerald-600/25">
              <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl group-hover:scale-125 transition-transform duration-500" />
              <div className="relative flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-100 flex items-center gap-1.5">
                    <FiTrendingUp size={14} /> صافي الأرباح التقديرية
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-black tracking-tight mt-2">
                    {(stats?.netProfit || 0).toLocaleString()} <span className="text-lg font-bold text-emerald-200">دج</span>
                  </h3>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-lg bg-white/15 px-2 py-0.5 text-[11px] font-bold text-emerald-100">
                      بعد خصم تكلفة السلع المسجلة
                    </span>
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                  <FiTrendingUp className="text-2xl text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* شريط الإحصائيات الحركي ونسب النجاح */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-emerald-200 transition">
              <span className="text-[11px] font-bold text-slate-400 block">نسبة التسليم</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 mt-1">
                {stats?.deliveryRate || 0}%
              </p>
              <span className="text-[10px] font-semibold text-slate-400">من الطرود المنتهية</span>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-rose-200 transition">
              <span className="text-[11px] font-bold text-slate-400 block">نسبة الراجع</span>
              <p className="text-xl sm:text-2xl font-black text-rose-500 mt-1">
                {stats?.returnRate || 0}%
              </p>
              <span className="text-[10px] font-semibold text-slate-400">من الطرود المنتهية</span>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-blue-200 transition">
              <span className="text-[11px] font-bold text-slate-400 block">طلبات اليوم</span>
              <p className="text-xl sm:text-2xl font-black text-blue-600 mt-1">
                {stats?.todayOrders || 0}
              </p>
              <span className="text-[10px] font-semibold text-slate-400">
                {(stats?.todayRevenue || 0).toLocaleString()} دج مبيعات
              </span>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:border-indigo-200 transition">
              <span className="text-[11px] font-bold text-slate-400 block">طلبات هذا الأسبوع</span>
              <p className="text-xl sm:text-2xl font-black text-indigo-600 mt-1">
                {stats?.weekOrders || 0}
              </p>
              <span className="text-[10px] font-semibold text-slate-400">
                {(stats?.weekRevenue || 0).toLocaleString()} دج مبيعات
              </span>
            </div>
          </div>

          {/* الرسم البياني التفاعلي لآخر 7 أيام (Interactive Activity Chart) */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <FiBarChart2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900">حركة ونشاط آخر 7 أيام</h3>
                  <p className="text-[11px] font-semibold text-slate-400">عدد الطلبيات المسجلة يومياً (مرر الماوس للتفاصيل)</p>
                </div>
              </div>
              {hoveredDay && (
                <div className="rounded-xl bg-slate-900 px-3 py-1.5 text-white text-xs font-black animate-in fade-in shadow-md">
                  <span>{hoveredDay.dayName}: {hoveredDay.ordersCount} طلبات ({hoveredDay.revenue.toLocaleString()} دج مسلّم)</span>
                </div>
              )}
            </div>

            {/* أعمدة الرسم البياني */}
            <div className="flex items-end justify-between gap-2 sm:gap-4 pt-6 h-40 border-b border-slate-100 px-2">
              {stats?.last7Days?.map((d, index) => {
                const heightPercent = maxDayOrders > 0 ? Math.round((d.ordersCount / maxDayOrders) * 100) : 0
                const isHovered = hoveredDay?.date === d.date

                return (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredDay(d)}
                    onMouseLeave={() => setHoveredDay(null)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                  >
                    <span className={`text-[10px] font-extrabold mb-1.5 transition ${
                      isHovered ? 'text-blue-600 scale-110 font-black' : 'text-slate-400 opacity-0 group-hover:opacity-100'
                    }`}>
                      {d.ordersCount}
                    </span>

                    <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl h-full flex items-end overflow-hidden p-1">
                      <div
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          isHovered
                            ? 'bg-gradient-to-t from-blue-700 to-indigo-500 shadow-lg shadow-blue-500/30'
                            : 'bg-gradient-to-t from-blue-500 to-blue-400 group-hover:from-blue-600 group-hover:to-blue-500'
                        }`}
                        style={{ height: `${Math.max(heightPercent, 10)}%` }}
                      />
                    </div>

                    <span className={`mt-2 text-[11px] font-bold transition ${
                      isHovered ? 'text-blue-600 font-black' : 'text-slate-500'
                    }`}>
                      {d.dayName}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* شريط توزيع الحالات التفاعلي (الانتقال الفوري بضغطة زر) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-black text-slate-400">توزيع حالات الطلبات (انقر للفلترة والانتقال المباشر)</h3>
              <span className="text-[11px] font-bold text-blue-600">انتقال سريع</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {orderStatuses.map((st, i) => {
                const Icon = st.icon
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => navigate('/orders')}
                    className={`rounded-2xl border p-3 shadow-sm flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md active:scale-95 ${st.color}`}
                  >
                    <div className="h-8 w-8 rounded-xl flex items-center justify-center mb-1.5">
                      <Icon size={16} />
                    </div>
                    <span className="text-base sm:text-lg font-black text-slate-800">{st.value || 0}</span>
                    <span className="text-[11px] font-bold text-slate-500">{st.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* شبكة ثنائية: أكثر الولايات + أكثر المنتجات مبيعاً */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* أكثر الولايات */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FiMapPin size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">أكثر الولايات طلباً</h3>
                  <p className="text-[11px] font-semibold text-slate-400">تركز الشحن والطلبيات</p>
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

            {/* أكثر المنتجات طلباً */}
            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FiPackage size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">أكثر المنتجات طلباً</h3>
                  <p className="text-[11px] font-semibold text-slate-400">السلع الأعلى تحقيقاً للمبيعات</p>
                </div>
              </div>

              {stats?.topProducts?.length > 0 ? (
                <div className="space-y-2.5">
                  {stats.topProducts.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-2xl bg-slate-50/70 p-2.5 border border-slate-100"
                    >
                      <div className="min-w-0 pr-1">
                        <p className="text-xs font-black text-slate-800 truncate">{p.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{p.count} طلبية مسجلة</p>
                      </div>
                      <span className="text-xs font-black text-emerald-600 shrink-0">
                        {p.totalAmount?.toLocaleString()} دج
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-semibold text-slate-400 py-4 text-center">لا توجد منتجات مسجلة بعد</p>
              )}
            </div>
          </div>

          {/* قسم الطلبات التي تحتاج متابعة */}
          {stats?.attentionCount > 0 && (
            <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50 to-orange-50/40 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <FiAlertTriangle size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900">طلبات تحتاج متابعة عاجلة</h3>
                    <p className="text-xs font-bold text-amber-700">
                      لديك {stats.attentionCount} طلبات معلقة تجاوزت المهلة المحددة
                    </p>
                  </div>
                </div>

                <Link
                  to="/orders"
                  className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-black text-amber-800 shadow-sm hover:bg-amber-100 transition"
                >
                  <span>عرض الكل</span>
                  <FiArrowLeft size={14} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {stats.attentionOrders?.slice(0, 3).map((o) => (
                  <Link
                    key={o._id}
                    to={`/orders/${o._id}`}
                    className="block rounded-2xl border border-amber-200/60 bg-white p-3 shadow-sm hover:border-amber-400 transition"
                  >
                    <div className="flex items-center justify-between text-xs font-black">
                      <span className="text-slate-800 truncate">{o.customerName}</span>
                      <span className="text-[10px] text-slate-400">{getOrderAge(o.createdAt)}</span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-500 truncate mt-1">{o.product}</p>
                    <span className="mt-2 block rounded-lg bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-800">
                      ⚠️ {o.reason}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}