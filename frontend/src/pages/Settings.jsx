// frontend/src/pages/Settings.jsx
import { useEffect, useRef, useState } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import ChangePasswordCard from '../components/ChangePasswordCard'

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
  FiLock,
  FiRotateCcw,
  FiCheck,
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

const templateTabs = [
  { key: 'confirmOrder', label: 'تأكيد الطلب' },
  { key: 'shipped', label: 'الشحن' },
  { key: 'delivered', label: 'التسليم' },
  { key: 'followUp', label: 'المتابعة' },
  { key: 'returned', label: 'الاسترجاع' },
]

const availableVariables = [
  { tag: '{name}', label: 'اسم الزبون' },
  { tag: '{product}', label: 'المنتج' },
  { tag: '{total}', label: 'المبلغ الإجمالي' },
  { tag: '{store}', label: 'اسم المتجر' },
]

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

  return {
    type: 'error',
    title: 'تعذر حفظ الإعدادات',
    description: err.response?.data?.message || 'لم نتمكن من حفظ الإعدادات.',
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

  return {
    type: 'error',
    title: 'تعذر حفظ قوالب WhatsApp',
    description: err.response?.data?.message || 'لم نتمكن من حفظ الرسائل الآن.',
  }
}

export default function Settings() {
  const { user, updateUser } = useAuth()

  // التبويب الرئيسي المختار
  const [activeTab, setActiveTab] = useState('store') // 'store' | 'whatsapp' | 'security'
  
  // تبويب قالب الواتساب المختار
  const [activeTemplateTab, setActiveTemplateTab] = useState('confirmOrder')

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
  const textareaRef = useRef(null)

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
    if (message) setMessage(null)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    clearMessage()
  }

  const handlePhoneChange = (e) => {
    const onlyNumbers = e.target.value.replace(/\D/g, '')
    setForm({ ...form, phone: onlyNumbers })
    clearMessage()
  }

  const handleTemplateChange = (e) => {
    setTemplates({
      ...templates,
      [activeTemplateTab]: e.target.value,
    })
    clearMessage()
  }

  // إدراج المتغير في موضع المؤشر تلقائياً
  const insertVariable = (tag) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentText = templates[activeTemplateTab] || ''
    const updatedText = currentText.substring(0, start) + tag + currentText.substring(end)

    setTemplates({
      ...templates,
      [activeTemplateTab]: updatedText,
    })

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + tag.length, start + tag.length)
    }, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.businessName.trim()) {
      showMessage({
        type: 'error',
        title: 'حقول مطلوبة',
        description: 'يرجى ملء اسم المستخدم واسم المتجر.',
      })
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
        title: 'تم الحفظ بنجاح',
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
        title: 'تم حفظ القوالب',
        description: 'تم تحديث رسائل واتساب بنجاح.',
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
      description: 'اضغط على زر حفظ القوالب لتثبيتها في حسابك.',
    })
  }

  return (
    <Layout>
      <div className="mb-5 space-y-4">
        {/* Header الصفحة */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FiSettings size={22} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              الإعدادات
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm font-semibold">
              إدارة هوية المتجر، قوالب الرسائل، وأمان الحساب
            </p>
          </div>
        </div>

        {/* شريط التبويبات الرئيسي (Tabs) */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`flex-1 min-w-[110px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'store'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiShoppingBag size={16} />
            <span>بيانات المتجر</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiMessageCircle size={16} />
            <span>رسائل WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex-1 min-w-[100px] inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
              activeTab === 'security'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FiLock size={15} />
            <span>كلمة المرور</span>
          </button>
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

      {/* المحتوى بحسب التبويب المختار مع مساحة مريحة للهاتف (pb-28) */}
      <div className="pb-28">
        {/* 1. تبويب بيانات المتجر */}
        {activeTab === 'store' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4"
            >
              <div>
                <p className="text-sm font-black text-slate-900">الهوية التجارية</p>
                <p className="text-xs font-semibold text-slate-400 mt-0.5">
                  تظهر هذه المعلومات تلقائياً في بوليصات الشحن PDF وتوقيع الرسائل
                </p>
              </div>

              <SettingsField
                label="اسم التاجر / الحساب *"
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
                placeholder="متجر ديزاد"
              />

              <SettingsField
                label="رقم هاتف المتجر للتواصل"
                icon={FiPhone}
                name="phone"
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="0550000000"
                inputMode="numeric"
                maxLength={15}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-extrabold py-3.5 text-xs sm:text-sm shadow-md shadow-blue-600/20 transition disabled:opacity-50"
              >
                <FiSave size={17} />
                <span>{loading ? 'جاري الحفظ...' : 'حفظ بيانات المتجر'}</span>
              </button>
            </form>

            {/* بطاقة المعاينة الفورية */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-4 sm:p-5">
              <span className="text-xs font-black text-slate-700 block mb-2">
                معاينة الهوية المعتمدة
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-bold">اسم الحساب:</span>
                  <span className="font-black text-slate-800">{form.name || '—'}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-bold">المتجر:</span>
                  <span className="font-black text-slate-800">{form.businessName || '—'}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100">
                  <span className="text-slate-400 block text-[11px] font-bold">الهاتف:</span>
                  <span className="font-black text-slate-800">{form.phone || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. تبويب رسائل WhatsApp */}
        {activeTab === 'whatsapp' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* أزرار التبديل السريع بين القوالب */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {templateTabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTemplateTab(t.key)}
                  className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                    activeTemplateTab === t.key
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={handleSaveTemplates}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4"
            >
              {/* شريط المتغيرات القابلة للنقر الفوري */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-black mb-2">
                  <FiInfo size={14} />
                  <span>انقر لإدراج المتغير في مكان المؤشر تلقائياً:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {availableVariables.map((v) => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => insertVariable(v.tag)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-700 text-[11px] font-extrabold hover:bg-emerald-100 active:scale-95 transition shadow-2xs"
                    >
                      <span>+</span>
                      <span>{v.label}</span>
                      <code className="text-[10px] text-slate-400 font-mono">{v.tag}</code>
                    </button>
                  ))}
                </div>
              </div>

              {/* حقل التعديل للقالب المختار */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  نص {templateTabs.find((t) => t.key === activeTemplateTab)?.label}
                </label>
                <textarea
                  ref={textareaRef}
                  value={templates[activeTemplateTab] || ''}
                  onChange={handleTemplateChange}
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right text-xs sm:text-sm font-bold text-slate-800 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100 leading-6 resize-none"
                  placeholder="اكتب صيغة الرسالة هنا..."
                />
              </div>

              {/* معاينة الرسالة كما ستظهر في WhatsApp */}
              <div className="p-3.5 bg-[#eef7ee] rounded-2xl border border-emerald-200/60">
                <span className="text-[10px] font-black text-emerald-800 block mb-1">
                  معاينة رسالة الواتساب:
                </span>
                <div className="bg-white p-3 rounded-xl shadow-xs text-xs font-medium text-slate-800 whitespace-pre-wrap leading-5 border-r-4 border-emerald-500">
                  {(templates[activeTemplateTab] || '')
                    .replace(/{name}/g, 'محمد')
                    .replace(/{product}/g, 'حذاء رياضي مقاس 42')
                    .replace(/{total}/g, '4,500')
                    .replace(/{store}/g, form.businessName || 'متجرنا')}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetTemplates}
                  disabled={templatesLoading}
                  className="w-1/3 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 text-xs transition"
                >
                  <FiRotateCcw size={14} />
                  <span>استرجاع</span>
                </button>

                <button
                  type="submit"
                  disabled={templatesLoading}
                  className="w-2/3 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold py-3 text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  <FiSave size={16} />
                  <span>{templatesLoading ? 'جاري الحفظ...' : 'حفظ كل القوالب'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. تبويب الأمان وكلمة المرور */}
        {activeTab === 'security' && (
          <div className="animate-in fade-in duration-200">
            <ChangePasswordCard
              showMessage={showMessage}
              clearMessage={clearMessage}
            />
          </div>
        )}
      </div>
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
        isError ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white ${
            isError ? 'text-red-500' : 'text-emerald-600'
          }`}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-xs sm:text-sm font-black ${isError ? 'text-red-700' : 'text-emerald-700'}`}>
            {title}
          </p>
          <p className={`mt-0.5 text-xs font-bold leading-5 ${isError ? 'text-red-500' : 'text-emerald-600'}`}>
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
  maxLength,
}) {
  return (
    <div>
      <label className="block text-xs font-black text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          inputMode={inputMode}
          maxLength={maxLength}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 pr-10 text-right text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          placeholder={placeholder}
        />
        <Icon
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          size={16}
        />
      </div>
    </div>
  )
}