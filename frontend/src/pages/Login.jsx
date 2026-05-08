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
    <div className="min-h-screen flex bg-slate-50" dir="rtl">

      {/* يسار — خلفية ملونة للشاشات الكبيرة */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 flex-col items-center justify-center p-12 text-white">
        <img src="/logo.png" alt="" className="w-24 h-24 mb-6" loading="eager" fetchPriority="high" />

        <h2 className="text-5xl font-black mb-4 tracking-tight text-white">
          طلبيات
        </h2>

        <p className="text-blue-100 text-lg font-medium text-center leading-8">
          نظّم طلبياتك وراسل زبائنك<br />بسهولة وسرعة
        </p>

        <div className="mt-12 flex flex-col gap-4 w-full max-w-xs">
          <div className="group flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-5 py-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/20">
            <FiPackage className="text-2xl flex-shrink-0 text-blue-100 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-sm font-semibold text-blue-50">تتبع كل طلب بسهولة</span>
          </div>

          <div className="group flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-5 py-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/20">
            <FiMessageCircle className="text-2xl flex-shrink-0 text-blue-100 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-sm font-semibold text-blue-50">راسل زبائنك عبر واتساب</span>
          </div>

          <div className="group flex items-center gap-3 bg-white/10 border border-white/10 rounded-2xl px-5 py-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-white/15 hover:border-white/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/20">
            <FiBarChart2 className="text-2xl flex-shrink-0 text-blue-100 transition-transform duration-300 group-hover:scale-110" />
            <span className="text-sm font-semibold text-blue-50">إحصائيات يومية واضحة</span>
          </div>
        </div>
      </div>

      {/* يمين — فورم تسجيل الدخول */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50">
        <div className="w-full max-w-md">

          {/* شعار للموبايل فقط */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <img src="/logo.png" alt="" className="w-16 h-16 mb-3" loading="eager" fetchPriority="high" />
            <h1 className="text-3xl font-black tracking-tight text-slate-900">طلبيات</h1>
            <p className="text-slate-500 text-sm font-medium mt-1">نظّم طلبياتك بسهولة</p>
          </div>

          <div className="bg-white rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] border border-slate-100 p-8 md:p-9">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-1">
              تسجيل الدخول
            </h2>

            <p className="text-slate-500 text-sm font-medium mb-6">
              أدخل بياناتك للمتابعة
            </p>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold p-3 rounded-2xl mb-4">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  البريد الإلكتروني
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-right text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  كلمة المرور
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-11 text-right text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
                    placeholder="••••••••"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.99] text-white font-extrabold py-3.5 transition duration-200 text-sm shadow-lg shadow-blue-600/20"
              >
                تسجيل الدخول
              </button>
            </div>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-slate-100"></div>
              <span className="text-xs font-bold text-slate-400">أو</span>
              <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            <p className="text-center text-sm font-medium text-slate-500">
              مستخدم جديد؟{' '}
              <Link to="/register" className="text-blue-600 font-extrabold hover:text-blue-700 transition">
                أنشئ حسابك الآن
              </Link>
            </p>
          </div>

          <p className="text-center text-xs font-medium text-slate-400 mt-6">
            © 2025 طلبيات — جميع الحقوق محفوظة
          </p>
        </div>
      </div>

    </div>
  )
}