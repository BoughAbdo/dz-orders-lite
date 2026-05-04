import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'

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

  const statCards = stats ? [
    { label: 'إجمالي الطلبات', value: stats.total, color: 'bg-blue-50 text-blue-600' },
    { label: 'جديدة', value: stats.newOrders, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'مؤكدة', value: stats.confirmed, color: 'bg-green-50 text-green-600' },
    { label: 'قيد التوصيل', value: stats.shipped, color: 'bg-purple-50 text-purple-600' },
    { label: 'مسلّمة', value: stats.delivered, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'راجعة', value: stats.returned, color: 'bg-red-50 text-red-600' },
  ] : []

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          أهلاً {user?.name} 👋
        </h2>
        <p className="text-gray-400 text-sm mt-1">نظرة عامة على متجرك</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-400 py-10">جاري التحميل...</div>
      ) : (
        <>
          {/* Revenue Card */}
          <div className="bg-blue-500 text-white rounded-2xl p-5 mb-6">
            <p className="text-blue-100 text-sm">إجمالي المبيعات</p>
            <p className="text-3xl font-bold mt-1">
              {stats?.revenue?.toLocaleString()} دج
            </p>
            <p className="text-blue-100 text-xs mt-2">من الطلبات المسلّمة فقط</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            {statCards.map((card, i) => (
              <div key={i} className={`rounded-xl p-4 ${card.color}`}>
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm mt-1 opacity-80">{card.label}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </Layout>
  )
}