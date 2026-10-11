// frontend/src/pages/Login.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  FiEye,
  FiEyeOff,
  FiPackage,
  FiMessageCircle,
  FiBarChart2,
  FiAlertTriangle,
  FiTruck,
  FiArrowLeft,
  FiLock,
  FiMail,
} from 'react-icons/fi'

const getLoginErrorMessage = (err) => {
  if (!err.response) {
    return {
      title: 'تعذر الاتصال بالخادم',
      description: 'تحقق من اتصال الإنترنت أو حاول مرة أخرى بعد لحظات.',
    }
  }

  if (err.response.status === 400 || err.response.status === 401) {
    return {
      title: 'بيانات الدخول غير صحيحة',
      description: 'تأكد من البريد الإلكتروني وكلمة المرور ثم حاول مرة أخرى.',
    }
  }

  return {
    title: 'تعذر تسجيل الدخول',
    description: err.response?.data?.message || 'لم نتمكن من تسجيل الدخول، حاول مرة أخرى.',
  }
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()

  const clearError = () => {
    if (error) setError(null)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    clearError()
  }

  const validateForm = () => {
    if (!form.email.trim()) {
      return {
        title: 'البريد الإلكتروني مطلوب',
        description: 'يرجى إدخال البريد الإلكتروني قبل المتابعة.',
      }
    }
    if (!form.password.trim()) {
      return {
        title: 'كلمة المرور مطلوبة',
        description: 'يرجى إدخال كلمة المرور الخاصة بحسابك.',
      }
    }
    return null
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await api.post('/auth/login', {
        email: form.email.trim(),
        password: form.password,
      })

      login(res.data.token, res.data.user)
      window.location.href = '/dashboard'
    } catch (err) {
      console.error(err)
      setError(getLoginErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 selection:bg-blue-600 selection:text-white" dir="rtl">
      {/* الجانب الأيمن / العلوي للشاشات الكبيرة — عرض القيمة المضافة والهوية */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />
        
        {/* الشعار بالأعلى */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <FiPackage size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">طلبيات</h1>
            <p className="text-xs font-semibold text-blue-200">إدارة طلبات المتاجر في الجزائر 🇩🇿</p>
          </div>
        </div>

        {/* النص الرئيسي والعناصر المضافة */}
        <div className="max-w-md my-auto py-10 space-y-6">
          <h2 className="text-4xl font-black leading-tight tracking-tight text-white">
            تحكّم في كل طرد، وراقب مبيعاتك لحظة بلحظة.
          </h2>
          <p className="text-sm font-medium leading-7 text-blue-200">
            المنصة المصممة خصيصاً للتجارة بالدفع عند الاستلام (COD): كشوفات شركات التوصيل، رسائل واتساب سريعة، وتحليلات أرباح دقيقة.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-md">
              <div className="h-9 w-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                <FiTruck size={18} />
              </div>
              <span className="text-xs sm:text-sm font-bold text-blue-100">تصدير إكسل فوري لـ Yalidine و ZR Express</span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-md">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <FiMessageCircle size={18} />
              </div>
              <span className="text-xs sm:text-sm font-bold text-blue-100">تأكيد أوتوماتيكي عبر واتساب لتقليل الرجوع (Retour)</span>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-md">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <FiBarChart2 size={18} />
              </div>
              <span className="text-xs sm:text-sm font-bold text-blue-100">حساب صافي الأرباح بعد خصم أسعار الشحن</span>
            </div>
          </div>
        </div>

        {/* حقوق أسفل العمود */}
        <p className="text-xs font-semibold text-blue-300/70">
          © 2026 طلبيات — جميع الحقوق محفوظة
        </p>
      </div>

      {/* الجانب الأيسر — استمارة تسجيل الدخول */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50">
        <div className="w-full max-w-md">
          {/* الشعار للهواتف فقط */}
          <div className="flex items-center gap-3 mb-6 lg:hidden justify-center">
            <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <FiPackage size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">طلبيات</h1>
              <p className="text-[11px] font-bold text-slate-400">إدارة طلبات المتاجر</p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-7 sm:p-9">
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-950">تسجيل الدخول</h2>
              <p className="text-xs sm:text-sm font-bold text-slate-400 mt-1">مرحباً بعودتك! أدخل بريدك للمتابعة</p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-3.5 text-right flex items-start gap-2.5">
                <FiAlertTriangle className="text-red-500 shrink-0 mt-0.5" size={17} />
                <div>
                  <p className="text-xs font-black text-red-700">{error.title}</p>
                  <p className="text-[11px] font-bold text-red-500 mt-0.5">{error.description}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 pr-10 text-right text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="example@mail.com"
                  />
                  <FiMail className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 pr-10 pl-10 text-right text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="••••••••"
                  />
                  <FiLock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black py-3.5 text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition disabled:opacity-50"
              >
                <span>{loading ? 'جاري التحقق والدخول...' : 'تسجيل الدخول'}</span>
                <FiArrowLeft size={16} />
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[11px] font-bold text-slate-400">أو</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <p className="text-center text-xs font-bold text-slate-500">
              ليس لديك حساب بعد؟{' '}
              <Link to="/register" className="text-blue-600 font-black hover:underline">
                أنشئ حسابك الآن مجاناً
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}