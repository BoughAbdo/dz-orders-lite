import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    phone: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', form)
      login(res.data.token, res.data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">DZ Orders</h1>
          <p className="text-gray-500 text-sm mt-1">أنشئ حسابك مجاناً</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-right">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1 text-right">الاسم الكامل</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-right focus:outline-none focus:border-blue-400"
              placeholder="محمد أمين"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1 text-right">اسم المتجر</label>
            <input
              type="text"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-right focus:outline-none focus:border-blue-400"
              placeholder="متجر الأناقة"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1 text-right">رقم الهاتف</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-right focus:outline-none focus:border-blue-400"
              placeholder="0550000000"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1 text-right">البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-right focus:outline-none focus:border-blue-400"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1 text-right">كلمة المرور</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-right focus:outline-none focus:border-blue-400"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'جاري التسجيل...' : 'إنشاء حساب'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          عندك حساب؟{' '}
          <Link to="/login" className="text-blue-500 hover:underline">
            سجّل دخولك
          </Link>
        </p>

      </div>
    </div>
  )
}