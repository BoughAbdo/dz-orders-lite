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
  FiMessageCircle,
  FiInfo,
} from 'react-icons/fi'

const defaultWhatsappTemplates = {
  confirmOrder:
    'السلام عليكم {name}،\nتم تأكيد طلبك: {product}.\nالإجمالي: {total} دج.\nسيتم التواصل معك بخصوص التوصيل قريباً إن شاء الله.',
  shipped:
    'السلام عليكم {name}،\nتم إرسال طلبك: {product}.\nيرجى إبقاء الهاتف متاحاً لتسهيل عملية التوصيل.\nشكراً لثقتك بنا.',
  delivered:
    'السلام عليكم {name}،\nنتمنى أن يكون طلبك قد وصلك بحالة جيدة.\nشكراً لثقتك بنا.',
  followUp:
    'السلام عليكم {name}،\nنود تأكيد طلبك: {product}.\nيرجى الرد علينا لتأكيد معلومات التوصيل.',
  returned:
    'السلام عليكم {name}،\nلاحظنا أن طلبك: {product} لم يكتمل تسليمه.\nهل يمكن إخبارنا بسبب الرجوع حتى نساعدك؟',
}

const getSettingsErrorMessage = (err) => {
  if (!err.response) {
    return {
      type: 'error',
      title: 'تعذر الاتصال بالخادم',
      description: 'تحقق من اتصال الإنترنت أو حاول مرة أخرى بعد لحظات.',
    }
  }

  if (err.response.status === 401) {
    return {
      type: 'error',
      title: 'انتهت جلسة الدخول',
      description: 'يرجى تسجيل الدخول مرة أخرى قبل حفظ الإعدادات.',
    }
  }

  if (err.response.status === 400) {
    return {
      type: 'error',
      title: 'بيانات غير صحيحة',
      description:
        err.response?.data?.message ||
        'راجع بيانات المتجر ثم حاول مرة أخرى.',
    }
  }

  if (err.response.status >= 500) {
    return {
      type: 'error',
      title: 'تعذر حفظ الإعدادات',
      description: 'حدث خطأ مؤقت في الخادم، حاول مرة أخرى بعد قليل.',
    }
  }

  return {
    type: 'error',
    title: 'تعذر حفظ الإعدادات',
    description:
      err.response?.data?.message ||
      'لم نتمكن من حفظ الإعدادات، حاول مرة أخرى بعد لحظات.',
  }
}

const getTemplatesErrorMessage = (err) => {
  if (!err.response) {
    return {
      type: 'error',
      title: 'تعذر الاتصال بالخادم',
      description: 'تحقق من اتصال الإنترنت أو حاول حفظ القوالب مرة أخرى.',
    }
  }

  if (err.response.status === 401) {
    return {
      type: 'error',
      title: 'انتهت جلسة الدخول',
      description: 'يرجى تسجيل الدخول مرة أخرى قبل حفظ قوالب WhatsApp.',
    }
  }

  if (err.response.status === 400) {
    return {
      type: 'error',
      title: 'قوالب WhatsApp غير صحيحة',
      description:
        err.response?.data?.message ||
        'راجع الرسائل ثم حاول حفظها مرة أخرى.',
    }
  }

  if (err.response.status >= 500) {
    return {
      type: 'error',
      title: 'تعذر حفظ قوالب WhatsApp',
      description: 'حدث خطأ مؤقت في الخادم، حاول مرة أخرى بعد قليل.',
    }
  }

  return {
    type: 'error',
    title: 'تعذر حفظ قوالب WhatsApp',
    description:
      err.response?.data?.message ||
      'لم نتمكن من حفظ الرسائل الآن، حاول مرة أخرى بعد لحظات.',
  }
}

export default function Settings() {
  const { user, updateUser } = useAuth()

  const [form, setForm] = useState({
    name: '',
    businessName: '',
    phone: '',
  })

  const [templates, setTemplates] = useState(defaultWhatsappTemplates)

  const [loading, setLoading] = useState(false)
  const [templatesLoading, setTemplatesLoading] = useState(false)

  const [message, setMessage] = useState(null)

  const messageRef = useRef(null)

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        businessName: user.businessName || '',
        phone: user.phone || '',
      })

      setTemplates({
        confirmOrder:
          user.whatsappTemplates?.confirmOrder ||
          defaultWhatsappTemplates.confirmOrder,
        shipped:
          user.whatsappTemplates?.shipped ||
          defaultWhatsappTemplates.shipped,
        delivered:
          user.whatsappTemplates?.delivered ||
          defaultWhatsappTemplates.delivered,
        followUp:
          user.whatsappTemplates?.followUp ||
          defaultWhatsappTemplates.followUp,
        returned:
          user.whatsappTemplates?.returned ||
          defaultWhatsappTemplates.returned,
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

  const showMessage = (nextMessage) => {
    setMessage(nextMessage)
    scrollToMessage()
  }

  const clearMessage = () => {
    if (message) {
      setMessage(null)
    }
  }

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })

    clearMessage()
  }

  const handlePhoneChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '')

    setForm({
      ...form,
      phone: onlyNumbers,
    })

    clearMessage()
  }

  const handleTemplateChange = (e) => {
    setTemplates({
      ...templates,
      [e.target.name]: e.target.value,
    })

    clearMessage()
  }

  const validateSettingsForm = () => {
    if (!form.name.trim()) {
      return {
        type: 'error',
        title: 'اسم المستخدم مطلوب',
        description: 'يرجى إدخال اسم المستخدم قبل حفظ الإعدادات.',
      }
    }

    if (!form.businessName.trim()) {
      return {
        type: 'error',
        title: 'اسم المتجر مطلوب',
        description: 'يرجى إدخال اسم المتجر لأنه يظهر في PDF ورسائل WhatsApp.',
      }
    }

    if (form.phone.trim() && form.phone.trim().length < 9) {
      return {
        type: 'error',
        title: 'رقم الهاتف غير صحيح',
        description: 'يرجى إدخال رقم هاتف صحيح، مثال: 0550000000.',
      }
    }

    return null
  }

  const validateTemplates = () => {
    if (!templates.confirmOrder.trim()) {
      return {
        type: 'error',
        title: 'رسالة تأكيد الطلب مطلوبة',
        description: 'يرجى كتابة رسالة تأكيد الطلب قبل حفظ القوالب.',
      }
    }

    if (!templates.shipped.trim()) {
      return {
        type: 'error',
        title: 'رسالة الشحن مطلوبة',
        description: 'يرجى كتابة رسالة الشحن قبل حفظ القوالب.',
      }
    }

    if (!templates.delivered.trim()) {
      return {
        type: 'error',
        title: 'رسالة تأكيد التسليم مطلوبة',
        description: 'يرجى كتابة رسالة تأكيد التسليم قبل حفظ القوالب.',
      }
    }

    if (!templates.followUp.trim()) {
      return {
        type: 'error',
        title: 'رسالة متابعة الطلب مطلوبة',
        description: 'يرجى كتابة رسالة متابعة الطلب قبل حفظ القوالب.',
      }
    }

    if (!templates.returned.trim()) {
      return {
        type: 'error',
        title: 'رسالة الرجوع مطلوبة',
        description: 'يرجى كتابة رسالة الاستفسار عن الرجوع قبل حفظ القوالب.',
      }
    }

    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateSettingsForm()

    if (validationError) {
      showMessage(validationError)
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await api.put('/auth/settings', {
        name: form.name.trim(),
        businessName: form.businessName.trim(),
        phone: form.phone.trim(),
      })

      updateUser(res.data.user)

      showMessage({
        type: 'success',
        title: 'تم حفظ الإعدادات',
        description: 'تم تحديث بيانات المتجر بنجاح.',
      })
    } catch (err) {
      console.error(err)
      showMessage(getSettingsErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSaveTemplates = async (e) => {
    e.preventDefault()

    const validationError = validateTemplates()

    if (validationError) {
      showMessage(validationError)
      return
    }

    setTemplatesLoading(true)
    setMessage(null)

    try {
      const res = await api.put('/auth/whatsapp-templates', {
        confirmOrder: templates.confirmOrder.trim(),
        shipped: templates.shipped.trim(),
        delivered: templates.delivered.trim(),
        followUp: templates.followUp.trim(),
        returned: templates.returned.trim(),
      })

      updateUser(res.data.user)

      showMessage({
        type: 'success',
        title: 'تم حفظ قوالب WhatsApp',
        description: 'سيتم استعمال الرسائل الجديدة في صفحة تفاصيل الطلب.',
      })
    } catch (err) {
      console.error(err)
      showMessage(getTemplatesErrorMessage(err))
    } finally {
      setTemplatesLoading(false)
    }
  }

  const resetTemplates = () => {
    setTemplates(defaultWhatsappTemplates)

    showMessage({
      type: 'success',
      title: 'تم استرجاع القوالب الافتراضية',
      description: 'اضغط على حفظ قوالب WhatsApp لتثبيت هذه الرسائل في حسابك.',
    })
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

      {message && (
        <MessageBox
          refProp={messageRef}
          type={message.type}
          title={message.title}
          description={message.description}
        />
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
            هذه البيانات تُستخدم في PDF ورسائل WhatsApp.
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

      <form
        onSubmit={handleSaveTemplates}
        className="mt-5 bg-white rounded-3xl p-5 border border-slate-100 shadow-sm"
      >
        <div className="mb-5">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FiMessageCircle size={20} />
            </div>

            <div>
              <p className="text-sm font-black text-slate-900">
                قوالب رسائل WhatsApp
              </p>

              <p className="text-xs font-semibold text-slate-400 mt-1">
                عدّل الرسائل التي تظهر في صفحة تفاصيل الطلب.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-3xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-start gap-2">
            <FiInfo className="text-slate-400 mt-0.5 shrink-0" size={18} />

            <div>
              <p className="text-xs font-black text-slate-700">
                المتغيرات المتاحة داخل الرسائل
              </p>

              <p className="text-xs font-semibold text-slate-500 mt-1 leading-6">
                استخدم {'{name}'} لاسم الزبون، {'{product}'} للمنتج، {'{total}'} للإجمالي، و {'{store}'} لاسم المتجر.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <TemplateField
            label="رسالة تأكيد الطلب"
            name="confirmOrder"
            value={templates.confirmOrder}
            onChange={handleTemplateChange}
          />

          <TemplateField
            label="رسالة الشحن"
            name="shipped"
            value={templates.shipped}
            onChange={handleTemplateChange}
          />

          <TemplateField
            label="رسالة تأكيد التسليم"
            name="delivered"
            value={templates.delivered}
            onChange={handleTemplateChange}
          />

          <TemplateField
            label="رسالة متابعة الطلب"
            name="followUp"
            value={templates.followUp}
            onChange={handleTemplateChange}
          />

          <TemplateField
            label="رسالة استفسار عن الرجوع"
            name="returned"
            value={templates.returned}
            onChange={handleTemplateChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={resetTemplates}
              disabled={templatesLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-50 hover:bg-slate-100 active:scale-[0.99] text-slate-600 font-extrabold py-3.5 transition duration-200 text-sm border border-slate-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              استرجاع القوالب الافتراضية
            </button>

            <button
              type="submit"
              disabled={templatesLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 active:scale-[0.99] text-white font-extrabold py-3.5 transition duration-200 text-sm shadow-lg shadow-emerald-600/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <FiSave size={18} />
              {templatesLoading ? 'جاري الحفظ...' : 'حفظ قوالب WhatsApp'}
            </button>
          </div>
        </div>
      </form>
    </Layout>
  )
}

function MessageBox({ type, title, description, refProp }) {
  const isError = type === 'error'
  const Icon = isError ? FiAlertTriangle : FiCheckCircle

  return (
    <div
      ref={refProp}
      className={`mb-4 rounded-3xl border p-4 shadow-sm ${
        isError
          ? 'bg-red-50 border-red-100'
          : 'bg-emerald-50 border-emerald-100'
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

function TemplateField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-right text-[14px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100/70 resize-none leading-7"
      />
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