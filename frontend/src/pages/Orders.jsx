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
} from 'react-icons/fi'

const statusLabels = {
  new: { label: 'جديد', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  confirmed: { label: 'مؤكد', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  shipped: { label: 'قيد التوصيل', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  delivered: { label: 'تم التسليم', color: 'bg-green-50 text-green-600 border-green-100' },
  returned: { label: 'رجع', color: 'bg-red-50 text-red-600 border-red-100' },
}

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
  'أدرار',
  'الشلف',
  'الأغواط',
  'أم البواقي',
  'باتنة',
  'بجاية',
  'بسكرة',
  'بشار',
  'البليدة',
  'البويرة',
  'تمنراست',
  'تبسة',
  'تلمسان',
  'تيارت',
  'تيزي وزو',
  'الجزائر',
  'الجلفة',
  'جيجل',
  'سطيف',
  'سعيدة',
  'سكيكدة',
  'سيدي بلعباس',
  'عنابة',
  'قالمة',
  'قسنطينة',
  'المدية',
  'مستغانم',
  'المسيلة',
  'معسكر',
  'ورقلة',
  'وهران',
  'البيض',
  'إليزي',
  'برج بوعريريج',
  'بومرداس',
  'الطارف',
  'تندوف',
  'تيسمسيلت',
  'الوادي',
  'خنشلة',
  'سوق أهراس',
  'تيبازة',
  'ميلة',
  'عين الدفلى',
  'النعامة',
  'عين تموشنت',
  'غرداية',
  'غليزان',
  'تيميمون',
  'برج باجي مختار',
  'أولاد جلال',
  'بني عباس',
  'عين صالح',
  'عين قزام',
  'تقرت',
  'جانت',
  'المغير',
  'المنيعة',
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

  if (err.response.status === 403) {
    return {
      title: 'لا تملك صلاحية الوصول',
      description: 'لا يمكنك عرض هذه الطلبات بهذا الحساب.',
    }
  }

  if (err.response.status === 404) {
    return {
      title: 'لم يتم العثور على الطلبات',
      description: 'تأكد من أن الرابط صحيح ثم حاول مرة أخرى.',
    }
  }

  if (err.response.status >= 500) {
    return {
      title: 'حدث خطأ في الخادم',
      description: 'الخدمة غير متاحة مؤقتًا، حاول مرة أخرى بعد قليل.',
    }
  }

  return {
    title: 'تعذر تحميل الطلبات',
    description:
      err.response?.data?.message ||
      'لم نتمكن من تحميل الطلبات، حاول مرة أخرى بعد لحظات.',
  }
}

function OrdersListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <OrderCardSkeleton />
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

    if (filter !== 'all') {
      params.set('status', filter)
    }

    if (debouncedSearch) {
      params.set('search', debouncedSearch)
    }

    if (wilayaFilter !== 'all') {
      params.set('wilaya', wilayaFilter)
    }

    if (dateFilter !== 'all') {
      params.set('dateFilter', dateFilter)
    }

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
  }, [
    filter,
    debouncedSearch,
    wilayaFilter,
    dateFilter,
    dateFrom,
    dateTo,
    page,
    limit,
    retryKey,
  ])

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

  const retryLoadingOrders = () => {
    setRetryKey(prev => prev + 1)
  }

  const escapeCSVValue = (value) => {
    const safeValue = value === undefined || value === null ? '' : String(value)
    return `"${safeValue.replace(/"/g, '""')}"`
  }

  const formatPhoneForCSV = (phone) => {
    if (!phone) return ''

    const cleanPhone = String(phone).trim()

    // نجعل الهاتف نصاً داخل Excel / Google Sheets حتى لا يُحذف الصفر الأول
    return `="${cleanPhone}"`
  }

  const exportToCSV = () => {
    if (orders.length === 0) return

    const headers = [
      'اسم الزبون',
      'رقم الهاتف',
      'الولاية',
      'البلدية',
      'المنتج',
      'السعر',
      'سعر التوصيل',
      'الإجمالي',
      'الحالة',
      'ملاحظات',
      'تاريخ الطلب',
    ]

    const rows = orders.map(order => {
      const price = Number(order.price || 0)
      const deliveryPrice = Number(order.deliveryPrice || 0)
      const totalPrice = price + deliveryPrice
      const createdAt = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('ar-DZ')
        : ''

      return [
        order.customerName || '',
        formatPhoneForCSV(order.phone),
        order.wilaya || '',
        order.city || '',
        order.product || '',
        price,
        deliveryPrice,
        totalPrice,
        statusLabels[order.status]?.label || order.status || '',
        order.notes || '',
        createdAt,
      ]
    })

    const csvContent = [
      headers.map(escapeCSVValue).join(','),
      ...rows.map(row => row.map(escapeCSVValue).join(',')),
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const today = new Date().toISOString().slice(0, 10)

    link.href = url
    link.download = `orders-page-${page}-${today}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            الطلبات
          </h2>

          <p className="mt-1 text-sm font-medium text-slate-500">
            {total} طلب
          </p>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={exportToCSV}
            disabled={loading || orders.length === 0}
            className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-extrabold text-emerald-600 transition hover:bg-emerald-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          >
            <FiDownload size={18} />
            تحميل الصفحة الحالية
          </button>

          <Link
            to="/orders/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99]"
          >
            <FiPlus size={18} />
            طلب جديد
          </Link>
        </div>
      </div>

      {/* Search */}
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

      {/* Download button on mobile */}
      <div className="mb-4 sm:hidden">
        <button
          type="button"
          onClick={exportToCSV}
          disabled={loading || orders.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-600 transition hover:bg-emerald-100 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
        >
          <FiDownload size={18} />
          تحميل القائمة الظاهرة
        </button>
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
              ...algerianWilayas.map(wilaya => ({
                key: wilaya,
                label: wilaya,
              })),
            ]}
          />

          <FilterDropdown
            label="التاريخ"
            value={dateFilter}
            onChange={setDateFilter}
            options={dateFilters}
          />
        </div>

        {dateFilter === 'custom' && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-500">
                من
              </label>

              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-500">
                إلى
              </label>

              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
              />
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-3xl border border-red-100 bg-red-50 p-4 text-right">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-red-500">
              <FiAlertCircle size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-red-700">
                {error.title}
              </p>

              <p className="mt-1 text-xs font-bold leading-6 text-red-500">
                {error.description}
              </p>

              <button
                type="button"
                onClick={retryLoadingOrders}
                disabled={loading}
                className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-white px-4 py-2 text-xs font-extrabold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiRefreshCw size={14} />
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <OrdersListSkeleton />
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
            <FiPackage size={30} />
          </div>

          <p className="text-lg font-black text-slate-900">
            {error ? error.title : hasActiveFilters ? 'لا توجد نتائج' : 'لا يوجد طلبات'}
          </p>

          <p className="mt-1 text-sm font-medium text-slate-500">
            {error
              ? error.description
              : hasActiveFilters
                ? 'لا يوجد طلبات تطابق الفلاتر الحالية'
                : 'ابدأ بإضافة أول طلب لمتجرك'
            }
          </p>

          {error && (
            <button
              type="button"
              onClick={retryLoadingOrders}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-extrabold text-red-600 transition hover:bg-red-100 active:scale-[0.99]"
            >
              <FiRefreshCw size={18} />
              إعادة المحاولة
            </button>
          )}

          {hasActiveFilters && !error && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200 active:scale-[0.99]"
            >
              <FiX size={18} />
              مسح الفلاتر
            </button>
          )}

          {!hasActiveFilters && !error && (
            <Link
              to="/orders/new"
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99]"
            >
              <FiPlus size={18} />
              إضافة طلب
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="group rounded-3xl border border-slate-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black leading-6 text-slate-900">
                    {order.customerName}
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5 text-slate-400">
                    <FiMapPin size={14} />

                    <span className="text-xs font-bold">
                      {order.wilaya || 'بدون ولاية'}
                    </span>
                  </div>
                </div>

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs font-extrabold ${statusLabels[order.status]?.color}`}
                >
                  {statusLabels[order.status]?.label}
                </span>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <FiPackage size={16} className="text-slate-400" />

                  <p className="line-clamp-1 text-sm font-bold">
                    {order.product}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <FiTag size={14} />
                  <span className="text-xs font-bold">السعر</span>
                </div>

                <span className="text-base font-black text-slate-900">
                  {Number(order.price || 0).toLocaleString()} دج
                </span>
              </div>
            </Link>
          ))}

          {pages > 1 && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-3xl border border-slate-100 bg-white p-3 shadow-sm">
              <button
                type="button"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page <= 1 || loading}
                className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                السابق
              </button>

              <div className="text-center">
                <p className="text-sm font-black text-slate-700">
                  الصفحة {page} من {pages}
                </p>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  إجمالي النتائج: {total}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPage(prev => Math.min(prev + 1, pages))}
                disabled={page >= pages || loading}
                className="rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                التالي
              </button>
            </div>
          )}
        </div>
      )}

      <Link
        to="/orders/new"
        className="fixed bottom-20 left-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95 sm:hidden"
        aria-label="إضافة طلب جديد"
      >
        <FiPlus size={26} />
      </Link>
    </Layout>
  )
}

function FilterDropdown({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  const selectedOption =
    options.find(option => option.key === value) || options[0]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSelect = (key) => {
    onChange(key)
    setOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <label className="mb-2 block text-xs font-black text-slate-500">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-black shadow-sm transition-all duration-200
          ${open
            ? 'border-blue-300 bg-white text-slate-900 ring-4 ring-blue-100/70'
            : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-blue-200 hover:bg-white hover:shadow-md'
          }`}
      >
        <span className="truncate">
          {selectedOption?.label}
        </span>

        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition duration-200
            ${open ? 'bg-blue-50 text-blue-600' : 'bg-white text-slate-400'}
          `}
        >
          <FiChevronDown
            size={15}
            className={`transition duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-300/50">
          <div className="max-h-56 overflow-y-auto rounded-xl">
            {options.map(option => {
              const active = option.key === value

              return (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleSelect(option.key)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-right text-xs font-black transition-all duration-150
                    ${active
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  <span className="truncate">
                    {option.label}
                  </span>

                  {active && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
                      <FiCheck size={12} />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}