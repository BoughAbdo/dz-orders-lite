// src/pages/Settings.jsx
import { useEffect, useRef, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  FiUser,
  FiShoppingBag,
  FiPhone,
  FiSave,
  FiCheckCircle,
  FiAlertTriangle,
  FiSettings,
} from 'react-icons/fi'

export default function Settings() {
  const { user, updateUser } = useAuth()

  const [form, setForm] = useState({
    name: '',
    businessName: '',
    phone: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const messageRef = useRef(null)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        businessName: user.businessName || '',
        phone: user.phone || '',
      })
    }
  }, [user])

  const scrollToMessage = () => {
    setTimeout(() => {
      messageRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 0)
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })

    setError('')
    setSuccess('')
  }

  const handlePhoneChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '')

    setForm({
      ...form,
      phone: onlyNumbers,
    })

    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim() || !form.businessName.trim()) {
      setError('يرجى إدخال اسم المستخدم واسم المتجر')
      setSuccess('')
      scrollToMessage()
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await api.put('/auth/settings', {
        name: form.name.trim(),
        businessName: form.businessName.trim(),
        phone: form.phone.trim(),
      })

      updateUser(res.data.user)
      setSuccess('تم حفظ الإعدادات بنجاح')
      scrollToMessage()

    } catch (err) {
      setError(err.response?.data?.message || 'تعذر حفظ الإعدادات')
      scrollToMessage()

    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FiSettings size={22} />
          </div>

          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              الإعدادات
            </h2>

            <p className="text-slate-500 text-sm font-medium mt-1">
              تعديل بيانات المتجر والحساب
            </p>
          </div>
        </div>
      </div>

      {(error || success) && (
        <div
          ref={messageRef}
          className={`mb-4 rounded-3xl border p-4 shadow-sm ${
            error
              ? 'bg-red-50 border-red-100 text-red-600'
              : 'bg-emerald-50 border-emerald-100 text-emerald-600'
          }`}
        >
          <div className="flex items-center gap-2">
            {error ? (
              <FiAlertTriangle size={20} />
            ) : (
              <FiCheckCircle size={20} />
            )}

            <p className="text-sm font-extrabold">
              {error || success}
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm"
      >
        <div className="mb-5">
          <p className="text-sm font-black text-slate-900">
            بيانات المتجر
          </p>

          <p className="text-xs font-semibold text-slate-400 mt-1">
            هذه البيانات ستُستخدم لاحقاً في PDF ورسائل WhatsApp.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <SettingsField
            label="اسم المستخدم *"
            icon={FiUser}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="أحمد"
          />

          <SettingsField
            label="اسم المتجر *"
            icon={FiShoppingBag}
            name="businessName"
            value={form.businessName}
            onChange={handleChange}
            placeholder="متجر أحمد"
          />

          <SettingsField
            label="رقم هاتف المتجر"
            icon={FiPhone}
            name="phone"
            value={form.phone}
            onChange={handlePhoneChange}
            placeholder="0550000000"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={15}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.99] text-white font-extrabold py-3.5 transition duration-200 text-sm shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            <FiSave size={18} />
            {loading ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
          </button>
        </div>
      </form>

      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-3xl p-4">
        <p className="text-sm font-black text-slate-900">
          معاينة البيانات الحالية
        </p>

        <div className="mt-3 flex flex-col gap-2 text-sm">
          <PreviewRow label="اسم المستخدم" value={form.name || '—'} />
          <PreviewRow label="اسم المتجر" value={form.businessName || '—'} />
          <PreviewRow label="هاتف المتجر" value={form.phone || '—'} />
        </div>
      </div>
    </Layout>
  )
}

function SettingsField({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  placeholder,
  inputMode,
  pattern,
  maxLength,
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          inputMode={inputMode}
          pattern={pattern}
          maxLength={maxLength}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-11 text-right text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
          placeholder={placeholder}
        />

        <Icon
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          size={18}
        />
      </div>
    </div>
  )
}

function PreviewRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/70 border border-blue-100 px-4 py-3">
      <span className="text-slate-500 font-bold">
        {label}
      </span>

      <span className="text-slate-900 font-black text-left">
        {value}
      </span>
    </div>
  )
}