// frontend/src/pages/VerifyEmail.jsx
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import {
  FiMail,
  FiCheckCircle,
  FiAlertTriangle,
  FiArrowRight,
} from 'react-icons/fi'

const getVerifyErrorMessage = (err) => {
  if (!err.response) {
    return {
      title: 'تعذر الاتصال بالخادم',
      description: 'تحقق من اتصال الإنترنت أو حاول مرة أخرى بعد لحظات.',
    }
  }

  if (err.response.status === 400) {
    return {
      title: 'تعذر تأكيد البريد',
      description:
        err.response?.data?.message ||
        'راجع رمز التأكيد ثم حاول مرة أخرى.',
    }
  }

  if (err.response.status === 404) {
    return {
      title: 'الحساب غير موجود',
      description: 'لم نجد حساباً بهذا البريد الإلكتروني.',
    }
  }

  if (err.response.status >= 500) {
    return {
      title: 'تعذر تأكيد البريد',
      description: 'حدث خطأ مؤقت في الخادم، حاول مرة أخرى بعد قليل.',
    }
  }

  return {
    title: 'تعذر تأكيد البريد',
    description:
      err.response?.data?.message ||
      'لم نتمكن من تأكيد البريد الآن، حاول مرة أخرى.',
  }
}

export default function VerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()

  const initialEmail = location.state?.email || ''

  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleCodeChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(onlyNumbers)

    if (error) setError(null)
    if (success) setSuccess(null)
  }

  const handleVerify = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      setError({
        title: 'البريد الإلكتروني مطلوب',
        description: 'يرجى إدخال البريد الإلكتروني المرتبط بالحساب.',
      })
      return
    }

    if (code.length !== 6) {
      setError({
        title: 'رمز التأكيد غير مكتمل',
        description: 'يرجى إدخال رمز التأكيد المكون من 6 أرقام.',
      })
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await api.post('/auth/verify-email', {
        email: email.trim(),
        code,
      })

      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      setError(getVerifyErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email.trim()) {
      setError({
        title: 'البريد الإلكتروني مطلوب',
        description: 'أدخل البريد الإلكتروني أولاً حتى نرسل لك رمزاً جديداً.',
      })
      return
    }

    setResendLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await api.post('/auth/resend-verification-code', {
        email: email.trim(),
      })

      setSuccess({
        title: 'تم إرسال رمز جديد',
        description: 'تحقق من بريدك الإلكتروني وأدخل الرمز الجديد.',
      })
    } catch (err) {
      console.error(err)
      setError(getVerifyErrorMessage(err))
    } finally {
      setResendLoading(false)
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
            تأكيد البريد
          </h1>

          <p className="text-slate-500 text-sm font-medium mt-1 text-center">
            أدخل الرمز الذي أرسلناه إلى بريدك الإلكتروني
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.08)] border border-slate-100 p-8 md:p-9">
          {error && (
            <AlertBox
              type="error"
              title={error.title}
              description={error.description}
            />
          )}

          {success && (
            <AlertBox
              type="success"
              title={success.title}
              description={success.description}
            />
          )}

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                البريد الإلكتروني
              </label>

              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-11 text-right text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
                  placeholder="example@email.com"
                />

                <FiMail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                رمز التأكيد
              </label>

              <input
                type="text"
                value={code}
                onChange={handleCodeChange}
                inputMode="numeric"
                maxLength={6}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-center text-2xl font-black tracking-[0.35em] text-slate-900 placeholder:text-slate-300 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.99] text-white font-extrabold py-3.5 transition duration-200 text-sm shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? 'جاري التأكيد...' : 'تأكيد البريد والدخول'}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendLoading}
            className="mt-4 w-full rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-[0.99] text-slate-600 font-extrabold py-3.5 transition duration-200 text-sm border border-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {resendLoading ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
          </button>

          <div className="mt-6 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-1 text-sm text-blue-600 font-extrabold hover:text-blue-700 transition"
            >
              <FiArrowRight size={15} />
              الرجوع لإنشاء الحساب
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function AlertBox({ type, title, description }) {
  const isError = type === 'error'
  const Icon = isError ? FiAlertTriangle : FiCheckCircle

  return (
    <div
      className={`mb-5 rounded-3xl border p-4 text-right ${
        isError
          ? 'border-red-100 bg-red-50'
          : 'border-emerald-100 bg-emerald-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white ${
            isError ? 'text-red-500' : 'text-emerald-600'
          }`}
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-black ${
              isError ? 'text-red-700' : 'text-emerald-700'
            }`}
          >
            {title}
          </p>

          <p
            className={`mt-1 text-xs font-bold leading-6 ${
              isError ? 'text-red-500' : 'text-emerald-600'
            }`}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}