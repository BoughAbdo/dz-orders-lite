import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError('')
    console.log('calling api...')
    try {
      const res = await api.post('/auth/login', form)
      console.log('res:', res)
      login(res.data.token, res.data.user)
      window.location.href = '/'
    } catch (err) {
      console.log('catch error:', err)
      setError(err.response?.data?.message || 'حدث خطأ')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow p-8 w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">DZ Orders</h1>
          <p className="text-gray-500 text-sm mt-1">سجّل دخولك لمتابعة طلباتك</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-right">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1 text-right">البريد الإلكتروني</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
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
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-right focus:outline-none focus:border-blue-400"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition"
          >
            تسجيل الدخول
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          ما عندكش حساب؟{' '}
          <Link to="/register" className="text-blue-500 hover:underline">
            سجّل هنا
          </Link>
        </p>

      </div>
    </div>
  )
}