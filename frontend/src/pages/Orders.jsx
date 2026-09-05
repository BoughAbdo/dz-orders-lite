// frontend/src/pages/Orders.jsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { OrderCardSkeleton } from '../components/SkeletonCards'
import {
  FiPlus,
  FiPackage,
  FiMapPin,
  FiTag,
  FiFilter,
  FiSearch,
  FiX,
  FiDownload,
  FiCalendar,
  FiChevronDown,
  FiCheck,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckSquare,
  FiSquare,
  FiTruck,
} from 'react-icons/fi'

const statusLabels = {
  new: { label: 'جديد', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  confirmed: { label: 'مؤكد', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  shipped: { label: 'قيد التوصيل', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  delivered: { label: 'تم التسليم', color: 'bg-green-50 text-green-600 border-green-100' },
  returned: { label: 'رجع', color: 'bg-red-50 text-red-600 border-red-100' },
}

const deliveryCompanies = [
  { key: 'yalidine', name: 'Yalidine Express' },
  { key: 'zr', name: 'ZR Express' },
  { key: 'maystro', name: 'Maystro Delivery' },
  { key: 'procolis', name: 'Procolis / Ecom' },
]

const filters = [
  { key: 'all', label: 'الكل' },
  { key: 'new', label: 'جديد' },
  { key: 'confirmed', label: 'مؤكد' },
  { key: 'shipped', label: 'توصيل' },
  { key: 'delivered', label: 'مسلّم' },
  { key: 'returned', label: 'رجع' },
]

const dateFilters = [
  { key: 'all', label: 'كل التواريخ' },
  { key: 'today', label: 'اليوم' },
  { key: 'week', label: 'هذا الأسبوع' },
  { key: 'month', label: 'هذا الشهر' },
  { key: 'custom', label: 'تاريخ مخصص' },
]

const algerianWilayas = [
  'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار', 'البليدة', 'البويرة',
  'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر', 'الجلفة', 'جيجل', 'سطيف', 'سعيدة',
  'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة', 'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر',
  'ورقلة', 'وهران', 'البيض', 'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت',
  'الوادي', 'خنشلة', 'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تموشنت', 'غرداية',
  'غليزان', 'تيميمون', 'برج باجي مختار', 'أولاد جلال', 'بني عباس', 'عين صالح', 'عين قزام', 'تقرت',
  'جانت', 'المغير', 'المنيعة'
]

const getOrdersErrorMessage = (err) => {
  if (!err.response) {
    return {
      title: 'تعذر الاتصال بالخادم',
      description: 'تحقق من اتصال الإنترنت أو حاول مرة أخرى بعد لحظات.',
    }
  }
  if (err.response.status === 401) {
    return {
      title: 'انتهت جلسة الدخول',
      description: 'يرجى تسجيل الدخول مرة أخرى لمتابعة استخدام التطبيق.',
    }
  }
  return {
    title: 'تعذر تحميل الطلبات',
    description: err.response?.data?.message || 'لم نتمكن من تحميل الطلبات، حاول مرة أخرى.',
  }
}

function OrdersListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <OrderCardSkeleton />
      <OrderCardSkeleton />
      <OrderCardSkeleton />
      <OrderCardSkeleton />
    </div>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [limit] = useState(20)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)

  // Multi-select, Export & Bulk Action States
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedCompany, setSelectedCompany] = useState('yalidine')
  const [exportLoading, setExportLoading] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [showCompanyMenu, setShowCompanyMenu] = useState(false)
  const [exportMessage, setExportMessage] = useState(null)

  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [wilayaFilter, setWilayaFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [filter, debouncedSearch, wilayaFilter, dateFilter, dateFrom, dateTo])

  useEffect(() => {
    setLoading(true)
    setError(null)

    const params = new URLSearchParams()
    params.set('page', page)
    params.set('limit', limit)

    if (filter !== 'all') params.set('status', filter)
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (wilayaFilter !== 'all') params.set('wilaya', wilayaFilter)
    if (dateFilter !== 'all') params.set('dateFilter', dateFilter)
    if (dateFilter === 'custom') {
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
    }

    const queryString = params.toString()
    const url = queryString ? `/orders?${queryString}` : '/orders'

    api.get(url)
      .then(res => {
        setOrders(res.data.orders || [])
        setTotal(res.data.total || 0)
        setPages(res.data.pages || 1)
      })
      .catch(err => {
        console.error(err)
        setError(getOrdersErrorMessage(err))
        setOrders([])
        setTotal(0)
        setPages(1)
      })
      .finally(() => setLoading(false))
  }, [filter, debouncedSearch, wilayaFilter, dateFilter, dateFrom, dateTo, page, limit, retryKey])

  const toggleSelectOrder = (id, e) => {
    e.stopPropagation()
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const toggleSelectAllPage = () => {
    const currentPageIds = orders.map(o => o._id)
    const isAllSelected = currentPageIds.every(id => selectedIds.includes(id))

    if (isAllSelected) {
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)))
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentPageIds])))
    }
  }

  // تحويل الطلبات المؤكدة إلى قيد التوصيل دفعة واحدة
  const handleBulkShip = async () => {
    if (selectedIds.length === 0) return

    setBulkLoading(true)
    try {
      const res = await api.patch('/orders/bulk-status', {
        orderIds: selectedIds,
        status: 'shipped',
      })

      // تحديث حالة الطلبات المؤكدة المحددة إلى shipped محلياً
      setOrders(prev =>
        prev.map(order =>
          selectedIds.includes(order._id) && order.status === 'confirmed'
            ? { ...order, status: 'shipped' }
            : order
        )
      )

      setExportMessage({
        type: 'success',
        text: res.data.message || 'تم تحويل الطلبات إلى قيد التوصيل بنجاح!',
      })
      setTimeout(() => setExportMessage(null), 4000)
      setSelectedIds([])
    } catch (err) {
      setExportMessage({
        type: 'error',
        text: err.response?.data?.message || 'تعذر تحويل الطلبات، تأكد أنها بحالة مؤكد.',
      })
      setTimeout(() => setExportMessage(null), 5000)
    } finally {
      setBulkLoading(false)
    }
  }

  // تصدير الإكسل
  const handleExportExcel = async (provider = selectedCompany) => {
    const hasConfirmedOrders = orders.some(o => o.status === 'confirmed')

    if (selectedIds.length === 0 && !hasConfirmedOrders) {
      setExportMessage({
        type: 'warning',
        text: 'يرجى تحديد الطلبات المراد تصديرها، أو تأكيد الطلبات أولاً (يتم تصدير الطلبات المؤكدة فقط تلقائياً).'
      })
      setTimeout(() => setExportMessage(null), 6000)
      return
    }

    setExportLoading(true)
    setShowCompanyMenu(false)
    setExportMessage(null)

    try {
      const response = await api.post(
        '/orders/export-excel',
        {
          provider,
          orderIds: selectedIds.length > 0 ? selectedIds : undefined,
        },
        { responseType: 'blob' }
      )

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      const today = new Date().toISOString().slice(0, 10)
      link.href = url
      link.download = `${provider}_orders_${today}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setExportMessage({
        type: 'success',
        text: `تم تصدير ملف ${provider.toUpperCase()} بنجاح!`
      })
      setTimeout(() => setExportMessage(null), 4000)
    } catch (err) {
      let errorText = 'تعذر تصدير ملف الإكسل، حاول مرة أخرى.'

      if (err.response?.data instanceof Blob) {
        try {
          const rawText = await err.response.data.text()
          const jsonError = JSON.parse(rawText)
          errorText = jsonError.message || errorText
        } catch {
          // fallback
        }
      }

      setExportMessage({
        type: 'error',
        text: errorText
      })
      setTimeout(() => setExportMessage(null), 6000)
    } finally {
      setExportLoading(false)
    }
  }

  const hasActiveFilters =
    search.trim() ||
    filter !== 'all' ||
    wilayaFilter !== 'all' ||
    dateFilter !== 'all' ||
    dateFrom ||
    dateTo

  const resetFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setFilter('all')
    setWilayaFilter('all')
    setDateFilter('all')
    setDateFrom('')
    setDateTo('')
    setPage(1)
    setError(null)
  }

  const isCurrentPageAllSelected =
    orders.length > 0 && orders.every(o => selectedIds.includes(o._id))

  // حساب هل توجد طلبات مؤكدة ضمن الطلبات المحددة
  const hasConfirmedInSelection = orders.some(
    o => selectedIds.includes(o._id) && o.status === 'confirmed'
  )

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            الطلبات
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {total} طلب {selectedIds.length > 0 && `(تم تحديد ${selectedIds.length})`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCompanyMenu(!showCompanyMenu)}
              disabled={loading || orders.length === 0 || exportLoading}
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-extrabold text-emerald-700 transition hover:bg-emerald-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiDownload size={18} />
              <span>{exportLoading ? 'جاري التصدير...' : 'تصدير إكسل الشحن'}</span>
              <FiChevronDown size={14} />
            </button>

            {showCompanyMenu && (
              <div className="absolute left-0 top-full z-50 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-200">
                <p className="px-3 py-1.5 text-xs font-bold text-slate-400">
                  اختر شركة الشحن ({selectedIds.length > 0 ? `${selectedIds.length} محددة` : 'كل المؤكدة'}):
                </p>
                {deliveryCompanies.map(c => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => {
                      setSelectedCompany(c.key)
                      handleExportExcel(c.key)
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-right text-xs font-extrabold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span>{c.name}</span>
                    <FiDownload size={14} className="text-slate-400" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/orders/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99]"
          >
            <FiPlus size={18} />
            <span className="hidden sm:inline">طلب جديد</span>
          </Link>
        </div>
      </div>

      {/* Export & Bulk Feedback Toast */}
      {exportMessage && (
        <div
          className={`mb-4 flex items-center justify-between gap-3 rounded-2xl p-4 text-sm font-black transition-all ${
            exportMessage.type === 'error'
              ? 'border border-red-200 bg-red-50 text-red-700'
              : exportMessage.type === 'warning'
              ? 'border border-amber-200 bg-amber-50 text-amber-800'
              : 'border border-emerald-200 bg-emerald-50 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <FiAlertCircle size={18} className="shrink-0" />
            <span>{exportMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportMessage(null)}
            className="p-1 hover:opacity-75"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Select All Checkbox & Bulk Status Bar */}
      {orders.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAllPage}
              className="inline-flex items-center gap-2 text-xs font-black text-slate-700 hover:text-blue-600 transition"
            >
              {isCurrentPageAllSelected ? (
                <FiCheckSquare size={18} className="text-blue-600" />
              ) : (
                <FiSquare size={18} className="text-slate-400" />
              )}
              <span>تحديد جميع طلبات هذه الصفحة ({orders.length})</span>
            </button>

            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition"
              >
                إلغاء التحديد ({selectedIds.length})
              </button>
            )}
          </div>

          {/* زر وحيد ومباشر: تحويل الطلبات المؤكدة المحددة إلى قيد التوصيل */}
          {selectedIds.length > 0 && hasConfirmedInSelection && (
            <button
              type="button"
              disabled={bulkLoading}
              onClick={handleBulkShip}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-black text-white shadow-sm shadow-amber-500/20 hover:bg-amber-600 transition disabled:opacity-50"
            >
              <FiTruck size={14} />
              <span>{bulkLoading ? 'جاري التحويل...' : 'تحويل إلى قيد التوصيل'}</span>
            </button>
          )}
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-4">
        <FiSearch
          size={16}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث بالاسم، الهاتف، المنتج، الولاية، البلدية..."
          className="w-full rounded-2xl border border-slate-100 bg-white py-3 pl-10 pr-10 text-sm font-medium text-slate-700 shadow-sm transition placeholder:text-slate-400 focus:border-blue-300 focus:outline-none"
          dir="rtl"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* Status Filters */}
      <div className="mb-4 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-slate-500">
          <FiFilter size={16} />
          <span className="text-xs font-bold">تصفية حسب الحالة</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-bold transition duration-200
                ${filter === f.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'border border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="mb-5 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-500">
            <FiCalendar size={16} />
            <span className="text-xs font-bold">فلترة متقدمة</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-100"
            >
              <FiX size={14} />
              مسح الفلاتر
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <FilterDropdown
            label="الولاية"
            value={wilayaFilter}
            onChange={setWilayaFilter}
            options={[
              { key: 'all', label: 'كل الولايات' },
              ...algerianWilayas.map(w => ({ key: w, label: w })),
            ]}
          />

          <FilterDropdown
            label="التاريخ"
            value={dateFilter}
            onChange={setDateFilter}
            options={dateFilters}
          />
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="mb-4 rounded-3xl border border-red-100 bg-red-50 p-4 text-right">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-red-500">
              <FiAlertCircle size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-red-700">{error.title}</p>
              <p className="mt-1 text-xs font-bold leading-6 text-red-500">{error.description}</p>
              <button
                type="button"
                onClick={() => setRetryKey(k => k + 1)}
                className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-2 text-xs font-extrabold text-red-600 transition hover:bg-red-100"
              >
                <FiRefreshCw size={14} />
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <OrdersListSkeleton />
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
            <FiPackage size={30} />
          </div>
          <p className="text-lg font-black text-slate-900">
            {hasActiveFilters ? 'لا توجد نتائج' : 'لا يوجد طلبات'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => {
            const isSelected = selectedIds.includes(order._id)

            return (
              <div
                key={order._id}
                className={`relative rounded-3xl border bg-white p-4 shadow-sm transition-all duration-200 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/20 ring-2 ring-blue-500/20'
                    : 'border-slate-100 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Select Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => toggleSelectOrder(order._id, e)}
                      className="p-1 text-slate-400 hover:text-blue-600 transition"
                    >
                      {isSelected ? (
                        <FiCheckSquare size={22} className="text-blue-600" />
                      ) : (
                        <FiSquare size={22} />
                      )}
                    </button>

                    <Link to={`/orders/${order._id}`} className="block">
                      <h3 className="font-black leading-6 text-slate-900 hover:text-blue-600 transition">
                        {order.customerName}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-slate-400">
                        <FiMapPin size={13} />
                        <span className="text-xs font-bold">{order.wilaya} - {order.city}</span>
                        <span className="text-[11px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg">
                          {order.deliveryType === 'desk' ? 'مكتب' : 'منزل'}
                        </span>
                      </div>
                    </Link>
                  </div>

                  <span className={`rounded-full border px-3 py-1.5 text-xs font-extrabold ${statusLabels[order.status]?.color}`}>
                    {statusLabels[order.status]?.label}
                  </span>
                </div>

                <Link to={`/orders/${order._id}`} className="mt-3 block">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <div className="flex items-center gap-2 text-slate-600">
                      <FiPackage size={15} className="text-slate-400" />
                      <p className="line-clamp-1 text-sm font-bold">{order.product}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <FiTag size={13} />
                      <span className="text-xs font-bold">الإجمالي (شامل التوصيل)</span>
                    </div>
                    <span className="text-base font-black text-slate-900">
                      {(Number(order.price || 0) + Number(order.deliveryPrice || 0)).toLocaleString()} دج
                    </span>
                  </div>
                </Link>
              </div>
            )
          })}

          {/* Pagination */}
          {pages > 1 && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
              <button
                type="button"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page <= 1 || loading}
                className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200 disabled:opacity-50"
              >
                السابق
              </button>
              <p className="text-sm font-black text-slate-700">الصفحة {page} من {pages}</p>
              <button
                type="button"
                onClick={() => setPage(prev => Math.min(prev + 1, pages))}
                disabled={page >= pages || loading}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}

function FilterDropdown({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const selectedOption = options.find(option => option.key === value) || options[0]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className="relative">
      <label className="mb-2 block text-xs font-black text-slate-500">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 shadow-sm"
      >
        <span className="truncate">{selectedOption?.label}</span>
        <FiChevronDown size={15} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl">
          <div className="max-h-56 overflow-y-auto">
            {options.map(option => (
              <button
                key={option.key}
                type="button"
                onClick={() => { onChange(option.key); setOpen(false) }}
                className={`flex w-full items-center justify-between px-3 py-2 text-xs font-black rounded-xl transition ${
                  option.key === value ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>{option.label}</span>
                {option.key === value && <FiCheck size={12} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}