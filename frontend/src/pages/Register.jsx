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
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
} from 'react-icons/fi'

const getRegisterErrorMessage = (err) => {
  if (!err.response) {
    return {
      title: 'تعذر الاتصال بالخادم',
      description: 'تحقق من اتصال الإنترنت أو حاول مرة أخرى بعد لحظات.',
    }
  }

  if (err.response.status === 400) {
    return {
      title: 'تعذر إنشاء الحساب',
      description:
        err.response?.data?.message ||
        'راجع البيانات المدخلة ثم حاول مرة أخرى.',
    }
  }

  if (err.response.status === 409) {
    return {
      title: 'البريد الإلكتروني مستخدم من قبل',
      description: 'جرّب تسجيل الدخول أو استخدم بريدًا إلكترونيًا آخر.',
    }
  }

  if (err.response.status >= 500) {
    return {
      title: 'تعذر إنشاء الحساب',
      description: 'الخدمة غير متاحة مؤقتًا، حاول مرة أخرى بعد قليل.',
    }
  }

  return {
    title: 'تعذر إنشاء الحساب',
    description:
      err.response?.data?.message ||
      'لم نتمكن من إنشاء الحساب، حاول مرة أخرى بعد لحظات.',
  }
}

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    phone: '',
  })

  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const clearError = () => {
    if (error) {
      setError(null)
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    clearError()
  }

  const handlePhoneChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '')

    setForm({
      ...form,
      phone: onlyNumbers,
    })

    clearError()
  }

  const validateForm = () => {
    if (!form.name.trim()) {
      return {
        title: 'الاسم الكامل مطلوب',
        description: 'يرجى إدخال اسمك الكامل قبل إنشاء الحساب.',
      }
    }

    if (!form.businessName.trim()) {
      return {
        title: 'اسم المتجر مطلوب',
        description: 'يرجى إدخال اسم المتجر لأنه سيظهر في التطبيق والفواتير.',
      }
    }

    if (form.phone.trim() && form.phone.trim().length < 9) {
      return {
        title: 'رقم الهاتف غير صحيح',
        description: 'يرجى إدخال رقم هاتف صحيح، مثال: 0550000000.',
      }
    }

    if (!form.email.trim()) {
      return {
        title: 'البريد الإلكتروني مطلوب',
        description: 'يرجى إدخال بريد إلكتروني صحيح لإنشاء الحساب.',
      }
    }

    if (!form.email.includes('@')) {
      return {
        title: 'البريد الإلكتروني غير صحيح',
        description: 'يرجى إدخال بريد إلكتروني صحيح مثل example@email.com.',
      }
    }

    if (!form.password.trim()) {
      return {
        title: 'كلمة المرور مطلوبة',
        description: 'يرجى إدخال كلمة مرور لحماية حسابك.',
      }
    }

    if (form.password.length < 6) {
      return {
        title: 'كلمة المرور قصيرة',
        description: 'كلمة المرور يجب أن تحتوي على 6 أحرف على الأقل.',
      }
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setLoading(true)

    try {
      const res = await api.post('/auth/register', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        businessName: form.businessName.trim(),
        phone: form.phone.trim(),
      })

      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError(getRegisterErrorMessage(err))
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
            <ErrorBox
              title={error.title}
              description={error.description}
            />
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
                  onChange={handlePhoneChange}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={15}
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
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-11 pl-11 text-right text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
                  placeholder="••••••••"
                />

                <FiLock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />

                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
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

function ErrorBox({ title, description }) {
  return (
    <div className="mb-5 rounded-3xl border border-red-100 bg-red-50 p-4 text-right">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-red-500">
          <FiAlertTriangle size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-red-700">
            {title}
          </p>

          <p className="mt-1 text-xs font-bold leading-6 text-red-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}