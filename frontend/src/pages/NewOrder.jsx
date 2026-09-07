// frontend/src/pages/NewOrder.jsx
import { useRef, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiHome,
  FiPackage,
  FiDollarSign,
  FiTruck,
  FiFileText,
  FiSave,
  FiChevronDown,
  FiSearch,
  FiTag,
  FiX,
  FiCheckCircle,
} from 'react-icons/fi'

const wilayas = [
  { code: '01', name: 'أدرار' },
  { code: '02', name: 'الشلف' },
  { code: '03', name: 'الأغواط' },
  { code: '04', name: 'أم البواقي' },
  { code: '05', name: 'باتنة' },
  { code: '06', name: 'بجاية' },
  { code: '07', name: 'بسكرة' },
  { code: '08', name: 'بشار' },
  { code: '09', name: 'البليدة' },
  { code: '10', name: 'البويرة' },
  { code: '11', name: 'تمنراست' },
  { code: '12', name: 'تبسة' },
  { code: '13', name: 'تلمسان' },
  { code: '14', name: 'تيارت' },
  { code: '15', name: 'تيزي وزو' },
  { code: '16', name: 'الجزائر' },
  { code: '17', name: 'الجلفة' },
  { code: '18', name: 'جيجل' },
  { code: '19', name: 'سطيف' },
  { code: '20', name: 'سعيدة' },
  { code: '21', name: 'سكيكدة' },
  { code: '22', name: 'سيدي بلعباس' },
  { code: '23', name: 'عنابة' },
  { code: '24', name: 'قالمة' },
  { code: '25', name: 'قسنطينة' },
  { code: '26', name: 'المدية' },
  { code: '27', name: 'مستغانم' },
  { code: '28', name: 'المسيلة' },
  { code: '29', name: 'معسكر' },
  { code: '30', name: 'ورقلة' },
  { code: '31', name: 'وهران' },
  { code: '32', name: 'البيض' },
  { code: '33', name: 'إليزي' },
  { code: '34', name: 'برج بوعريريج' },
  { code: '35', name: 'بومرداس' },
  { code: '36', name: 'الطارف' },
  { code: '37', name: 'تندوف' },
  { code: '38', name: 'تيسمسيلت' },
  { code: '39', name: 'الوادي' },
  { code: '40', name: 'خنشلة' },
  { code: '41', name: 'سوق أهراس' },
  { code: '42', name: 'تيبازة' },
  { code: '43', name: 'ميلة' },
  { code: '44', name: 'عين الدفلى' },
  { code: '45', name: 'النعامة' },
  { code: '46', name: 'عين تموشنت' },
  { code: '47', name: 'غرداية' },
  { code: '48', name: 'غليزان' },
  { code: '49', name: 'تيميمون' },
  { code: '50', name: 'برج باجي مختار' },
  { code: '51', name: 'أولاد جلال' },
  { code: '52', name: 'بني عباس' },
  { code: '53', name: 'عين صالح' },
  { code: '54', name: 'عين قزام' },
  { code: '55', name: 'تقرت' },
  { code: '56', name: 'جانت' },
  { code: '57', name: 'المغير' },
  { code: '58', name: 'المنيعة' },
]

const getNewOrderErrorMessage = (err) => {
  if (!err.response) {
    return {
      title: 'تعذر الاتصال بالخادم',
      description: 'تحقق من اتصال الإنترنت أو حاول مرة أخرى بعد لحظات.',
    }
  }

  if (err.response.status === 401) {
    return {
      title: 'انتهت جلسة الدخول',
      description: 'يرجى تسجيل الدخول مرة أخرى قبل حفظ الطلب.',
    }
  }

  if (err.response.status === 400) {
    return {
      title: 'بيانات الطلب غير مكتملة',
      description: err.response?.data?.message || 'راجع الحقول المطلوبة ثم حاول مرة أخرى.',
    }
  }

  return {
    title: 'تعذر حفظ الطلب',
    description: err.response?.data?.message || 'حدث خطأ غير متوقع، حاول مرة أخرى.',
  }
}

export default function NewOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const errorRef = useRef(null)

  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    wilaya: '',
    city: '',
    deliveryType: 'home',
    product: '',
    price: '',
    deliveryPrice: '600',
    notes: '',
  })

  const [catalogProducts, setCatalogProducts] = useState([])
  const [selectedCatalogProduct, setSelectedCatalogProduct] = useState(null)
  const [activeSize, setActiveSize] = useState(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/products')
      .then((res) => {
        const items = res.data || []
        setCatalogProducts(items)

        if (location.state?.presetProduct) {
          handleSelectCatalogProduct(location.state.presetProduct)
        }
      })
      .catch((err) => console.log('Products preset error:', err))
  }, [location.state])

  const scrollToError = () => {
    setTimeout(() => {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 0)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError(null)
  }

  const handleNumericChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value.replace(/\D/g, '') })
    if (error) setError(null)
  }

  const handleDeliveryTypeChange = (type) => {
    if (type === form.deliveryType) return

    const currentPrice = Number(form.deliveryPrice) || 0
    let updatedPrice = currentPrice

    if (type === 'desk' && form.deliveryType === 'home') {
      updatedPrice = Math.max(0, currentPrice - 200)
    } else if (type === 'home' && form.deliveryType === 'desk') {
      updatedPrice = currentPrice + 200
    }

    setForm({
      ...form,
      deliveryType: type,
      deliveryPrice: String(updatedPrice),
    })
  }

  const handleSelectCatalogProduct = (p) => {
    setSelectedCatalogProduct(p)
    setActiveSize(null)
    setForm((prev) => ({
      ...prev,
      product: p.name,
      price: String(p.price || ''),
    }))
    if (error) setError(null)
  }

  const handleResetCatalogSelection = () => {
    setSelectedCatalogProduct(null)
    setActiveSize(null)
    setForm((prev) => ({
      ...prev,
      product: '',
      price: '',
    }))
  }

  const handleSelectSize = (size) => {
    const baseName = selectedCatalogProduct ? selectedCatalogProduct.name : form.product
    setActiveSize(size)
    setForm((prev) => ({
      ...prev,
      product: `${baseName} - مقاس ${size}`,
    }))
  }

  const validateForm = () => {
    if (!form.customerName.trim()) {
      return { title: 'اسم الزبون مطلوب', description: 'يرجى إدخال اسم الزبون.' }
    }
    if (!form.phone.trim() || form.phone.trim().length < 9) {
      return { title: 'رقم الهاتف غير صحيح', description: 'أدخل رقم هاتف صحيح، مثال: 0550000000.' }
    }
    if (!form.wilaya.trim()) {
      return { title: 'الولاية مطلوبة', description: 'يرجى اختيار ولاية التوصيل من القائمة.' }
    }
    if (!form.city.trim()) {
      return { title: 'البلدية مطلوبة', description: 'يرجى إدخال البلدية أو منطقة التوصيل.' }
    }
    if (!form.product.trim()) {
      return { title: 'اسم المنتج مطلوب', description: 'يرجى تحديد أو كتابة اسم المنتج.' }
    }
    if (!form.price || Number(form.price) <= 0) {
      return { title: 'سعر المنتج غير صحيح', description: 'يجب أن يكون سعر المنتج أكبر من 0 دج.' }
    }
    if (form.deliveryPrice === undefined || Number(form.deliveryPrice) < 0) {
      return { title: 'سعر التوصيل غير صحيح', description: 'لا يمكن أن يكون سعر التوصيل أقل من 0 دج.' }
    }
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      scrollToError()
      return
    }

    setLoading(true)
    setError(null)

    try {
      await api.post('/orders', {
        ...form,
        customerName: form.customerName.trim(),
        phone: form.phone.trim(),
        wilaya: form.wilaya.trim(),
        city: form.city.trim(),
        product: form.product.trim(),
        notes: form.notes.trim(),
        price: Number(form.price),
        deliveryPrice: Number(form.deliveryPrice),
      })

      navigate('/orders')
    } catch (err) {
      console.error(err)
      setError(getNewOrderErrorMessage(err))
      scrollToError()
    } finally {
      setLoading(false)
    }
  }

  const productPriceNum = Number(form.price) || 0
  const deliveryPriceNum = Number(form.deliveryPrice) || 0
  const totalAmount = productPriceNum + deliveryPriceNum

  return (
    <Layout>
      {/* الترويسة الرئيسية */}
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">تسجيل طلبية جديدة</h2>
        <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
          أدخل بيانات الزبون وعنوان الشحن لاحتساب الإجمالي وتجهيز الطرد
        </p>
      </div>

      {error && (
        <div ref={errorRef} className="bg-red-50 border border-red-200 p-4 rounded-3xl mb-5 text-right">
          <p className="text-sm font-black text-red-700">{error.title}</p>
          <p className="mt-1 text-xs font-bold text-red-500 leading-6">{error.description}</p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* بيانات الزبون */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
          <SectionTitle icon={FiUser} title="بيانات الزبون" color="bg-blue-50 text-blue-600" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="اسم الزبون الكامل *"
              icon={FiUser}
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="مثال: محمد لمين"
            />
            <FormField
              label="رقم الهاتف للتواصل *"
              icon={FiPhone}
              name="phone"
              value={form.phone}
              onChange={handleNumericChange}
              placeholder="0550000000"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={15}
            />
          </div>
        </div>

        {/* عنوان التوصيل */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
          <SectionTitle icon={FiMapPin} title="عنوان وطريقة التوصيل" color="bg-amber-50 text-amber-600" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <WilayaSelect
              label="ولاية التوصيل *"
              value={form.wilaya}
              wilayas={wilayas}
              onChange={(wilayaName) => {
                setForm({ ...form, wilaya: wilayaName })
                if (error) setError(null)
              }}
            />

            <FormField
              label="البلدية أو العنوان التفصيلي *"
              icon={FiHome}
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="مثال: باب الزوار - حي 5 جويلية"
            />
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50">
            <label className="block text-xs font-black text-slate-700 mb-2">طريقة استلام الطرد</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDeliveryTypeChange('home')}
                className={`py-3 px-4 rounded-2xl border text-xs sm:text-sm font-black transition ${
                  form.deliveryType === 'home'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                توصيل للعنوان (Domicile)
              </button>
              <button
                type="button"
                onClick={() => handleDeliveryTypeChange('desk')}
                className={`py-3 px-4 rounded-2xl border text-xs sm:text-sm font-black transition ${
                  form.deliveryType === 'desk'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                استلام من المكتب (StopDesk) -200دج
              </button>
            </div>
          </div>
        </div>

        {/* بيانات الطلب */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm">
          <SectionTitle icon={FiPackage} title="بيانات السلعة والمبالغ المالية" color="bg-emerald-50 text-emerald-600" />

          {/* الاختيار السريع المنظم للكتالوج */}
          {catalogProducts.length > 0 && (
            <div className="mb-5 rounded-2xl bg-slate-50/80 border border-slate-100 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-600">
                  <FiTag size={14} className="text-blue-600" />
                  <span>اختر من كتالوج السلع للتعبئة الفورية:</span>
                </div>
                {selectedCatalogProduct && (
                  <button
                    type="button"
                    onClick={handleResetCatalogSelection}
                    className="inline-flex items-center gap-1 text-[11px] font-black text-slate-400 hover:text-red-600 transition"
                  >
                    <FiX size={13} />
                    <span>إلغاء التحديد</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {catalogProducts.map((p) => {
                  const isSelected = selectedCatalogProduct?._id === p._id
                  return (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => handleSelectCatalogProduct(p)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold transition active:scale-95 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <span>{p.name}</span>
                      <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-black ${
                        isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {p.price?.toLocaleString()} دج
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <FormField
                label="المنتج أو السلعة المطلوبة *"
                icon={FiPackage}
                name="product"
                value={form.product}
                onChange={handleChange}
                placeholder="مثال: حذاء كلاسيكي أسود"
              />

              {/* المقاسات بأزرار واضحة */}
              {selectedCatalogProduct?.sizes?.length > 0 && (
                <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-slate-400">حدد المقاس:</span>
                  {selectedCatalogProduct.sizes.map((sz, idx) => {
                    const isSizeActive = activeSize === sz
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSize(sz)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-black transition ${
                          isSizeActive
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        {sz}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="سعر السلعة (دج) *"
                icon={FiDollarSign}
                name="price"
                type="text"
                value={form.price}
                onChange={handleNumericChange}
                placeholder="4800"
                inputMode="numeric"
                pattern="[0-9]*"
              />

              <FormField
                label="سعر الشحن والتوصيل (دج) *"
                icon={FiTruck}
                name="deliveryPrice"
                type="text"
                value={form.deliveryPrice}
                onChange={handleNumericChange}
                placeholder="600"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>

            {/* شريط الملخص المالي الواضح */}
            <div className="mt-2 rounded-2xl bg-slate-900 text-white p-4 flex items-center justify-between shadow-xl shadow-slate-900/10">
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black">
                <FiCheckCircle className="text-emerald-400 shrink-0" size={18} />
                <span>المبلغ الكلي الواجب تحصيله عند التسليم:</span>
              </div>
              <div className="text-left">
                <span className="text-lg sm:text-xl font-black text-emerald-400">
                  {totalAmount.toLocaleString()} دج
                </span>
                <span className="block text-[10px] font-bold text-slate-400 mt-0.5">
                  ({productPriceNum.toLocaleString()} للمنتج + {deliveryPriceNum.toLocaleString()} للشحن)
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1.5">ملاحظات للطلبية (اختياري)</label>
              <div className="relative">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-11 text-right text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/50 resize-none"
                  placeholder="أي ملاحظات خاصة برقم الشقة أو موعد الاتصال بالزبون..."
                  rows={2}
                />
                <FiFileText className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.99] text-white font-extrabold py-4 transition duration-200 text-sm sm:text-base shadow-xl shadow-blue-600/25 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <FiSave size={18} />
          {loading ? 'جاري الحفظ...' : 'تأكيد وحفظ الطلبية'}
        </button>
      </div>
    </Layout>
  )
}

function SectionTitle({ icon: Icon, title, color }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <p className="text-sm sm:text-base font-black text-slate-900">{title}</p>
    </div>
  )
}

function FormField({
  label,
  icon: Icon,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  inputMode,
  pattern,
  maxLength,
}) {
  return (
    <div>
      <label className="block text-xs font-black text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          inputMode={inputMode}
          pattern={pattern}
          maxLength={maxLength}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-11 text-right text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/50"
          placeholder={placeholder}
        />
        <Icon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
      </div>
    </div>
  )
}

function WilayaSelect({ label, value, wilayas, onChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedWilaya = wilayas.find((w) => w.name === value)
  const filteredWilayas = wilayas.filter((w) => {
    const q = search.trim().toLowerCase()
    return w.name.toLowerCase().includes(q) || w.code.includes(q)
  })

  return (
    <div className="relative">
      <label className="block text-xs font-black text-slate-700 mb-1.5">{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`relative w-full rounded-2xl border px-4 py-3.5 pr-11 pl-11 text-right text-xs sm:text-sm font-bold outline-none transition ${
          open ? 'border-blue-500 bg-white ring-4 ring-blue-100/70' : 'border-slate-200 bg-slate-50 hover:bg-white'
        } ${selectedWilaya ? 'text-slate-900' : 'text-slate-400'}`}
      >
        {selectedWilaya ? `${selectedWilaya.code} - ${selectedWilaya.name}` : 'اختر ولاية التوصيل'}
        <FiMapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={17} />
        <FiChevronDown
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${
            open ? 'rotate-180' : ''
          }`}
          size={17}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-right text-xs font-bold outline-none focus:border-blue-500 focus:bg-white"
                placeholder="ابحث بالاسم أو الرقم..."
                autoFocus
              />
              <FiSearch className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-2">
            {filteredWilayas.map((w) => {
              const active = value === w.name
              return (
                <button
                  key={w.code}
                  type="button"
                  onClick={() => {
                    onChange(w.name)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-right transition text-xs font-black ${
                    active ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{w.name}</span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {w.code}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}