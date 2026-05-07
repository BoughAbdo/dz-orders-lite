import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { FiEye, FiEyeOff, FiPackage, FiMessageCircle, FiBarChart2 } from 'react-icons/fi'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.token, res.data.user)
      window.location.href = '/'
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ')
    }
  }

  return (
    <div className="min-h-screen flex" dir="rtl">

      {/* يسار — خلفية ملونة للشاشات الكبيرة */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-blue-700 flex-col items-center justify-center p-12 text-white">
        <img src="/logo.png" alt="" className="w-24 h-24 mb-6" loading="eager" fetchPriority="high" />
        <h2 className="text-4xl font-bold mb-4">طلبيات</h2>
        <p className="text-blue-200 text-lg text-center leading-relaxed">
          نظّم طلبياتك وراسل زبائنك<br />بسهولة وسرعة
        </p>
        <div className="mt-12 flex flex-col gap-4 w-full max-w-xs">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
            <FiPackage className="text-2xl flex-shrink-0" />
            <span className="text-sm">تتبع كل طلب بسهولة</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
            <FiMessageCircle className="text-2xl flex-shrink-0" />
            <span className="text-sm">راسل زبائنك عبر واتساب</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
            <FiBarChart2 className="text-2xl flex-shrink-0" />
            <span className="text-sm">إحصائيات يومية واضحة</span>
          </div>
        </div>
      </div>

      {/* يمين — فورم تسجيل الدخول */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
        <div className="w-full max-w-md">

          {/* شعار للموبايل فقط */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <img src="/logo.png" alt="" className="w-16 h-16 mb-3" loading="eager" fetchPriority="high" />
            <h1 className="text-2xl font-bold text-gray-800">طلبيات</h1>
            <p className="text-gray-400 text-sm mt-1">نظّم طلبياتك بسهولة</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-1">أهلاً بك 👋</h2>
            <p className="text-gray-400 text-sm mb-6">سجّل دخولك للمتابعة</p>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:border-blue-400 focus:bg-white transition text-sm"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-right bg-gray-50 focus:outline-none focus:border-blue-400 focus:bg-white transition text-sm pl-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 rounded-xl transition text-sm shadow-sm"
              >
                تسجيل الدخول
              </button>
            </div>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-100"></div>
              <span className="text-xs text-gray-400">أو</span>
              <div className="flex-1 h-px bg-gray-100"></div>
            </div>

            <p className="text-center text-sm text-gray-500">
              ما عندكش حساب؟{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">
                سجّل هنا
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            © 2025 طلبيات — جميع الحقوق محفوظة
          </p>
        </div>
      </div>

    </div>
  )
}