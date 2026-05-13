// frontend/src/pages/Orders.jsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
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

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [wilayaFilter, setWilayaFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    setLoading(true)

    const params = filter !== 'all' ? `?status=${filter}` : ''

    api.get(`/orders${params}`)
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [filter])

  const uniqueWilayas = Array.from(
    new Set(
      orders
        .map(order => order.wilaya)
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b, 'ar'))

  const isSameDay = (dateA, dateB) => {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    )
  }

  const getStartOfWeek = (date) => {
    const start = new Date(date)
    const day = start.getDay()
    const diffToMonday = day === 0 ? 6 : day - 1

    start.setDate(start.getDate() - diffToMonday)
    start.setHours(0, 0, 0, 0)

    return start
  }

  const matchesDateFilter = (order) => {
    if (dateFilter === 'all') return true
    if (!order.createdAt) return false

    const orderDate = new Date(order.createdAt)
    const now = new Date()

    if (dateFilter === 'today') {
      return isSameDay(orderDate, now)
    }

    if (dateFilter === 'week') {
      const startOfWeek = getStartOfWeek(now)
      return orderDate >= startOfWeek
    }

    if (dateFilter === 'month') {
      return (
        orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth()
      )
    }

    if (dateFilter === 'custom') {
      if (dateFrom) {
        const from = new Date(dateFrom)
        from.setHours(0, 0, 0, 0)

        if (orderDate < from) return false
      }

      if (dateTo) {
        const to = new Date(dateTo)
        to.setHours(23, 59, 59, 999)

        if (orderDate > to) return false
      }

      return true
    }

    return true
  }

  const filteredOrders = orders.filter(order => {
    const q = search.trim().toLowerCase()

    const matchesSearch = !q || (
      order.customerName?.toLowerCase().includes(q) ||
      order.phone?.includes(q) ||
      order.product?.toLowerCase().includes(q) ||
      order.wilaya?.toLowerCase().includes(q) ||
      order.city?.toLowerCase().includes(q)
    )

    const matchesWilaya =
      wilayaFilter === 'all' || order.wilaya === wilayaFilter

    return matchesSearch && matchesWilaya && matchesDateFilter(order)
  })

  const hasActiveFilters =
    search.trim() ||
    filter !== 'all' ||
    wilayaFilter !== 'all' ||
    dateFilter !== 'all' ||
    dateFrom ||
    dateTo

  const resetFilters = () => {
    setSearch('')
    setFilter('all')
    setWilayaFilter('all')
    setDateFilter('all')
    setDateFrom('')
    setDateTo('')
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
    if (filteredOrders.length === 0) return

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

    const rows = filteredOrders.map(order => {
      const price = Number(order.price || 0)
      const deliveryPrice = Number(order.deliveryPrice || 0)
      const total = price + deliveryPrice
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
        total,
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
    link.download = `orders-${today}.csv`
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

          <p className="text-slate-500 text-sm font-medium mt-1">
            {filteredOrders.length} طلب
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={exportToCSV}
            disabled={loading || filteredOrders.length === 0}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-sm font-extrabold text-emerald-600 border border-emerald-100 transition hover:bg-emerald-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <FiDownload size={18} />
            تحميل القائمة
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
          className="w-full bg-white border border-slate-100 rounded-2xl py-3 pr-10 pl-10 text-sm font-medium text-slate-700 placeholder:text-slate-400 shadow-sm focus:outline-none focus:border-blue-300 transition"
          dir="rtl"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* Download button on mobile */}
      <div className="sm:hidden mb-4">
        <button
          type="button"
          onClick={exportToCSV}
          disabled={loading || filteredOrders.length === 0}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-extrabold text-emerald-600 border border-emerald-100 transition hover:bg-emerald-100 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <FiDownload size={18} />
          تحميل القائمة الظاهرة
        </button>
      </div>

      {/* Status Filters */}
      <div className="bg-white border border-slate-100 rounded-3xl p-3 mb-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-slate-500">
          <FiFilter size={16} />
          <span className="text-xs font-bold">تصفية حسب الحالة</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition duration-200
                ${filter === f.key
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100 hover:text-slate-700'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white border border-slate-100 rounded-3xl p-3 mb-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <FilterDropdown
            label="الولاية"
            value={wilayaFilter}
            onChange={setWilayaFilter}
            options={[
              { key: 'all', label: 'كل الولايات' },
              ...uniqueWilayas.map(wilaya => ({
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
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">
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
              <label className="block text-xs font-bold text-slate-500 mb-2">
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

      {loading ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-400 font-medium shadow-sm">
          جاري التحميل...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-400">
            <FiPackage size={30} />
          </div>

          <p className="text-slate-900 text-lg font-black">
            {hasActiveFilters ? 'لا توجد نتائج' : 'لا يوجد طلبات'}
          </p>

          <p className="text-slate-500 text-sm font-medium mt-1">
            {hasActiveFilters
              ? 'لا يوجد طلبات تطابق الفلاتر الحالية'
              : 'ابدأ بإضافة أول طلب لمتجرك'
            }
          </p>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-5 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-200 active:scale-[0.99]"
            >
              <FiX size={18} />
              مسح الفلاتر
            </button>
          )}

          {!hasActiveFilters && (
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
          {filteredOrders.map(order => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="group bg-white rounded-3xl p-4 border border-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-black text-slate-900 leading-6">
                    {order.customerName}
                  </h3>

                  <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                    <FiMapPin size={14} />

                    <span className="text-xs font-bold">
                      {order.wilaya || 'بدون ولاية'}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs px-3 py-1.5 rounded-full font-extrabold border ${statusLabels[order.status]?.color}`}
                >
                  {statusLabels[order.status]?.label}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3 py-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <FiPackage size={16} className="text-slate-400" />

                  <p className="text-sm font-bold line-clamp-1">
                    {order.product}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
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
        </div>
      )}

      <Link
        to="/orders/new"
        className="sm:hidden fixed bottom-20 left-4 bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-blue-600/30 transition active:scale-95"
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
      <label className="block text-xs font-black text-slate-500 mb-2">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`w-full flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-black transition-all duration-200 shadow-sm
          ${open
            ? 'border-blue-300 bg-white ring-4 ring-blue-100/70 text-slate-900'
            : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-white hover:border-blue-200 hover:shadow-md'
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
                  className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-right text-xs font-black transition-all duration-150
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