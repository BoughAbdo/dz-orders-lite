// frontend/src/pages/Register.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  FiCheckCircle,
  FiShield,
  FiClock,
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
      description: err.response?.data?.message || 'راجع البيانات المدخلة ثم حاول مرة أخرى.',
    }
  }

  if (err.response.status === 409) {
    return {
      title: 'البريد الإلكتروني مستخدم من قبل',
      description: 'جرّب تسجيل الدخول أو استخدم بريدًا إلكترونيًا آخر.',
    }
  }

  return {
    title: 'تعذر إنشاء الحساب',
    description: err.response?.data?.message || 'لم نتمكن من إنشاء الحساب، حاول مرة أخرى.',
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

  const navigate = useNavigate()

  const clearError = () => {
    if (error) setError(null)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    clearError()
  }

  const handlePhoneChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '')
    setForm({ ...form, phone: onlyNumbers })
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
        description: 'يرجى إدخال اسم المتجر لأنه سيظهر في وصلات الشحن والرسائل.',
      }
    }
    if (form.phone.trim() && form.phone.trim().length < 9) {
      return {
        title: 'رقم الهاتف غير صحيح',
        description: 'يرجى إدخال رقم هاتف صحيح مثل 0550000000.',
      }
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      return {
        title: 'البريد الإلكتروني غير صحيح',
        description: 'يرجى إدخال بريد إلكتروني صحيح لتفعيل الحساب بالرمز OTP.',
      }
    }
    if (!form.password.trim() || form.password.length < 6) {
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

      navigate('/verify-email', {
        state: {
          email: res.data.email || form.email.trim(),
        },
      })
    } catch (err) {
      console.error(err)
      setError(getRegisterErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 selection:bg-blue-600 selection:text-white" dir="rtl">
      {/* الجانب الأيمن للشاشات الكبيرة */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-blue-950 to-blue-900 flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />

        {/* الشعار الحقيقي في إطار أبيض ناصع */}
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg shadow-black/25 ring-1 ring-white/20 shrink-0">
            <img
              src="/logo.png"
              alt="شعار طلبيات"
              className="h-full w-full object-contain"
              loading="eager"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white">طلبيات</h1>
              <span className="rounded-md bg-blue-500/20 border border-blue-400/30 px-1.5 py-0.5 text-[10px] font-black text-blue-200">DZ</span>
            </div>
            <p className="text-xs font-semibold text-blue-200 mt-0.5">إدارة طلبات المتاجر في الجزائر 🇩🇿</p>
          </div>
        </div>

        {/* مميزات الانضمام مع المحاذاة لليمين */}
        <div className="max-w-md my-auto py-10 space-y-6">
          <h2 className="text-4xl font-black leading-tight tracking-tight text-white">
            ابدأ تنظيم متجرك مجاناً في دقيقة واحدة.
          </h2>
          <p className="text-sm font-medium leading-7 text-blue-200">
            انضم الآن وتحكم في طلبياتك ومخزونك وكشوفات الشحن دون أي تعقيد وبدون الحاجة لبطاقة بنكية.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-md">
              <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <FiCheckCircle size={18} />
              </div>
              <span className="text-xs sm:text-sm font-bold text-blue-100 text-right">
                تجربة مجانية كاملة الميزات لمدة 30 يوم
              </span>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-md">
              <div className="h-9 w-9 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                <FiClock size={18} />
              </div>
              <span className="text-xs sm:text-sm font-bold text-blue-100 text-right">
                تفعيل فوري برمز تأكيد OTP على البريد
              </span>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl bg-white/5 border border-white/10 p-3.5 backdrop-blur-md">
              <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <FiShield size={18} />
              </div>
              <span className="text-xs sm:text-sm font-bold text-blue-100 text-right">
                بيانات متجرك وزبائنك مشفرة ومحمية بالكامل
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs font-semibold text-blue-300/70">
          © 2026 طلبيات — جميع الحقوق محفوظة
        </p>
      </div>

      {/* الجانب الأيسر — استمارة التسجيل */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center min-h-screen p-5 sm:p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* الشعار للهواتف */}
          <div className="flex items-center gap-3 mb-6 lg:hidden justify-center">
            <div className="h-11 w-11 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md border border-slate-100">
              <img
                src="/logo.png"
                alt="طلبيات"
                className="h-full w-full object-contain"
                loading="eager"
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">طلبيات</h1>
              <p className="text-[11px] font-bold text-slate-400">إنشاء حساب جديد</p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
            <div className="mb-5">
              <h2 className="text-2xl font-black tracking-tight text-slate-950">إنشاء حساب جديد</h2>
              <p className="text-xs sm:text-sm font-bold text-slate-400 mt-1">
                أدخل بياناتك للبدء في تنظيم طلبيات متجرك
              </p>
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

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <RegisterField
                label="الاسم الكامل *"
                icon={FiUser}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="أمين بن علي"
              />

              <RegisterField
                label="اسم المتجر *"
                icon={FiShoppingBag}
                name="businessName"
                value={form.businessName}
                onChange={handleChange}
                placeholder="متجر الأناقة"
              />

              <RegisterField
                label="رقم هاتف المتجر"
                icon={FiPhone}
                name="phone"
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="0550000000"
                inputMode="numeric"
                maxLength={15}
              />

              <RegisterField
                label="البريد الإلكتروني *"
                icon={FiMail}
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@mail.com"
              />

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  كلمة المرور *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 pl-10 text-right text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    placeholder="••••••••"
                  />
                  <FiLock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-black py-3.5 text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'جاري إنشاء الحساب...' : 'إنشاء حساب مجاني'}</span>
                <FiArrowLeft size={16} />
              </button>
            </form>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-[11px] font-bold text-slate-400">أو</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <p className="text-center text-xs font-bold text-slate-500">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-blue-600 font-black hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function RegisterField({
  label,
  icon: Icon,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  inputMode,
  maxLength,
}) {
  return (
    <div>
      <label className="block text-xs font-black text-slate-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          inputMode={inputMode}
          maxLength={maxLength}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-right text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          placeholder={placeholder}
        />
        <Icon className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
      </div>
    </div>
  )
}