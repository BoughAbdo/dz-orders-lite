import { useState, useEffect } from 'react'
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

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    const params = filter !== 'all' ? `?status=${filter}` : ''
    api.get(`/orders${params}`)
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [filter])

  const filteredOrders = orders.filter(order => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      order.customerName?.toLowerCase().includes(q) ||
      order.phone?.includes(q) ||
      order.product?.toLowerCase().includes(q) ||
      order.wilaya?.toLowerCase().includes(q)
    )
  })

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">الطلبات</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {filteredOrders.length} طلب
          </p>
        </div>
        <Link
          to="/orders/new"
          className="hidden sm:inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99]"
        >
          <FiPlus size={18} />
          طلب جديد
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="ابحث بالاسم، الهاتف، المنتج، الولاية..."
          className="w-full bg-white border border-slate-100 rounded-2xl py-3 pr-10 pl-10 text-sm font-medium text-slate-700 placeholder:text-slate-400 shadow-sm focus:outline-none focus:border-blue-300 transition"
          dir="rtl"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-3xl p-3 mb-5 shadow-sm">
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
            {search ? 'لا توجد نتائج' : 'لا يوجد طلبات'}
          </p>
          <p className="text-slate-500 text-sm font-medium mt-1">
            {search ? `لا يوجد طلبات تطابق "${search}"` : 'ابدأ بإضافة أول طلب لمتجرك'}
          </p>
          {!search && (
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
                    <span className="text-xs font-bold">{order.wilaya || 'بدون ولاية'}</span>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1.5 rounded-full font-extrabold border ${statusLabels[order.status]?.color}`}>
                  {statusLabels[order.status]?.label}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3 py-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <FiPackage size={16} className="text-slate-400" />
                  <p className="text-sm font-bold line-clamp-1">{order.product}</p>
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