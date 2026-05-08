import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  FiUser,
  FiShoppingBag,
  FiPhone,
  FiMail,
  FiLock,
  FiArrowLeft,
} from 'react-icons/fi'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    phone: '',
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5 py-8" dir="rtl">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-7">
          <img
            src="/logo.png"
            alt="طلبيات"
            className="w-16 h-16 mb-3"
            loading="eager"
            fetchPriority="high"
          />

          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            طلبيات
          </h1>

          <p className="text-slate-500 text-sm font-medium mt-1">
            أنشئ حسابك مجاناً
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] border border-slate-100 p-8 md:p-9">
          <div className="mb-7">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">
              إنشاء حساب جديد
            </h2>

            <p className="text-slate-500 text-sm font-medium">
              أدخل معلوماتك للبدء في تنظيم طلبياتك
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold p-3 rounded-2xl mb-5 text-right">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                الاسم الكامل
              </label>

              <div className="relative">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-11 text-right text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
                  placeholder="محمد أمين"
                />

                <FiUser className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                اسم المتجر
              </label>

              <div className="relative">
                <input
                  type="text"
                  name="businessName"
                  value={form.businessName}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-11 text-right text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
                  placeholder="متجر الأناقة"
                />

                <FiShoppingBag className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                رقم الهاتف
              </label>

              <div className="relative">
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-11 text-right text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
                  placeholder="0550000000"
                />

                <FiPhone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                البريد الإلكتروني
              </label>

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-11 text-right text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
                  placeholder="example@email.com"
                />

                <FiMail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                كلمة المرور
              </label>

              <div className="relative">
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-11 text-right text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
                  placeholder="••••••••"
                />

                <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.99] text-white font-extrabold py-3.5 transition duration-200 text-sm shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? 'جاري التسجيل...' : 'إنشاء حساب'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100"></div>
            <span className="text-xs font-bold text-slate-400">أو</span>
            <div className="flex-1 h-px bg-slate-100"></div>
          </div>

          <p className="text-center text-sm font-medium text-slate-500">
            عندك حساب؟{' '}
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-blue-600 font-extrabold hover:text-blue-700 transition"
            >
              سجّل دخولك
              <FiArrowLeft size={15} />
            </Link>
          </p>
        </div>

        <p className="text-center text-xs font-medium text-slate-400 mt-6">
          © 2025 طلبيات — جميع الحقوق محفوظة
        </p>  
      </div>
    </div>
  )
}