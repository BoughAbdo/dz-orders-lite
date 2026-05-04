import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

const statusLabels = {
  new: { label: 'جديد', color: 'bg-blue-100 text-blue-600' },
  confirmed: { label: 'مؤكد', color: 'bg-green-100 text-green-600' },
  shipped: { label: 'قيد التوصيل', color: 'bg-yellow-100 text-yellow-600' },
  delivered: { label: 'تم التسليم', color: 'bg-emerald-100 text-emerald-600' },
  returned: { label: 'رجع', color: 'bg-red-100 text-red-600' },
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const params = filter !== 'all' ? `?status=${filter}` : ''
    api.get(`/orders${params}`)
      .then(res => setOrders(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <Layout>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">الطلبات</h2>
        <p className="text-gray-400 text-sm mt-1">{orders.length} طلب</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {[
          { key: 'all', label: 'الكل' },
          { key: 'new', label: 'جديد' },
          { key: 'confirmed', label: 'مؤكد' },
          { key: 'shipped', label: 'توصيل' },
          { key: 'delivered', label: 'مسلّم' },
          { key: 'returned', label: 'رجع' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition
              ${filter === f.key
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-500 border border-gray-200'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-10">جاري التحميل...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-400 py-10">
          <p className="text-4xl mb-3">📦</p>
          <p>لا يوجد طلبات</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map(order => (
            <Link
              key={order._id}
              to={`/orders/${order._id}`}
              className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{order.customerName}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusLabels[order.status]?.color}`}>
                  {statusLabels[order.status]?.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">{order.product}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-400">{order.wilaya}</span>
                <span className="text-sm font-medium text-gray-700">{order.price} دج</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link
        to="/orders/new"
        className="fixed bottom-20 left-4 bg-blue-500 text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
      >
        +
      </Link>
    </Layout>
  )
}