// src/components/ChangePasswordCard.jsx
import { useState } from 'react'
import { FiLock, FiSave } from 'react-icons/fi'
import api from '../services/api'

const getPasswordErrorMessage = (err) => {
  if (!err.response) {
    return {
      type: 'error',
      title: 'تعذر الاتصال بالخادم',
      description: 'تحقق من اتصال الإنترنت أو حاول تغيير كلمة المرور مرة أخرى.',
    }
  }

  if (err.response.status === 401) {
    return {
      type: 'error',
      title: 'انتهت جلسة الدخول',
      description: 'يرجى تسجيل الدخول مرة أخرى قبل تغيير كلمة المرور.',
    }
  }

  if (err.response.status === 400) {
    return {
      type: 'error',
      title: 'تعذر تغيير كلمة المرور',
      description:
        err.response?.data?.message ||
        'راجع كلمة المرور الحالية والجديدة ثم حاول مرة أخرى.',
    }
  }

  if (err.response.status >= 500) {
    return {
      type: 'error',
      title: 'تعذر تغيير كلمة المرور',
      description: 'حدث خطأ مؤقت في الخادم، حاول مرة أخرى بعد قليل.',
    }
  }

  return {
    type: 'error',
    title: 'تعذر تغيير كلمة المرور',
    description:
      err.response?.data?.message ||
      'لم نتمكن من تغيير كلمة المرور الآن، حاول مرة أخرى بعد لحظات.',
  }
}

export default function ChangePasswordCard({ showMessage, clearMessage }) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [passwordLoading, setPasswordLoading] = useState(false)

  const handlePasswordFieldChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    })

    clearMessage()
  }

  const validatePasswordForm = () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      return {
        type: 'error',
        title: 'حقول كلمة المرور مطلوبة',
        description: 'يرجى ملء كلمة المرور الحالية والجديدة والتأكيد.',
      }
    }

    if (passwordForm.newPassword.length < 6) {
      return {
        type: 'error',
        title: 'كلمة المرور قصيرة',
        description: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل.',
      }
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return {
        type: 'error',
        title: 'تأكيد كلمة المرور غير مطابق',
        description: 'يرجى إعادة كتابة تأكيد كلمة المرور الجديدة بشكل صحيح.',
      }
    }

    return null
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    const validationError = validatePasswordForm()

    if (validationError) {
      showMessage(validationError)
      return
    }

    setPasswordLoading(true)
    clearMessage()

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      })

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      showMessage({
        type: 'success',
        title: 'تم تغيير كلمة المرور',
        description: 'يمكنك الآن استعمال كلمة المرور الجديدة في تسجيل الدخول.',
      })
    } catch (err) {
      console.error(err)
      showMessage(getPasswordErrorMessage(err))
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleChangePassword}
      className="mt-5 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm"
    >
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <FiLock size={20} />
          </div>

          <div>
            <p className="text-sm font-black text-slate-900">
              تغيير كلمة المرور
            </p>

            <p className="text-xs font-semibold text-slate-400 mt-1">
              حدّث كلمة مرور حسابك للحفاظ على الأمان.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <PasswordField
          label="كلمة المرور الحالية"
          name="currentPassword"
          value={passwordForm.currentPassword}
          onChange={handlePasswordFieldChange}
          autoComplete="current-password"
          placeholder="أدخل كلمة المرور الحالية"
        />

        <PasswordField
          label="كلمة المرور الجديدة"
          name="newPassword"
          value={passwordForm.newPassword}
          onChange={handlePasswordFieldChange}
          autoComplete="new-password"
          placeholder="6 أحرف على الأقل"
        />

        <PasswordField
          label="تأكيد كلمة المرور الجديدة"
          name="confirmPassword"
          value={passwordForm.confirmPassword}
          onChange={handlePasswordFieldChange}
          autoComplete="new-password"
          placeholder="أعد إدخال كلمة المرور الجديدة"
        />

        <button
          type="submit"
          disabled={passwordLoading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 active:scale-[0.99] text-white font-extrabold py-3.5 transition duration-200 text-sm shadow-lg shadow-violet-600/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <FiSave size={18} />
          {passwordLoading ? 'جاري التغيير...' : 'تغيير كلمة المرور'}
        </button>
      </div>
    </form>
  )
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type="password"
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-11 text-right text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100/70"
          placeholder={placeholder}
        />

        <FiLock
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          size={18}
        />
      </div>
    </div>
  )
}