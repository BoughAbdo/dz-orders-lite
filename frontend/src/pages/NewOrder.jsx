// frontend/src/pages/NewOrder.jsx
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  { code: '59', name: 'آفلو' },
  { code: '60', name: 'بريكة' },
  { code: '61', name: 'القنطرة' },
  { code: '62', name: 'بئر العاتر' },
  { code: '63', name: 'العريشة' },
  { code: '64', name: 'قصر الشلالة' },
  { code: '65', name: 'عين وسارة' },
  { code: '66', name: 'مسعد' },
  { code: '67', name: 'قصر البخاري' },
  { code: '68', name: 'بوسعادة' },
  { code: '69', name: 'الأبيض سيدي الشيخ' },
]

export default function NewOrder() {
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    wilaya: '',
    city: '',
    product: '',
    price: '',
    deliveryPrice: '',
    notes: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const errorRef = useRef(null)

  const scrollToError = () => {
    setTimeout(() => {
      errorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 0)
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleNumericChange = (e) => {
    const { name, value } = e.target
    const onlyNumbers = value.replace(/\D/g, '')

    setForm({ ...form, [name]: onlyNumbers })
  }

  const handleSubmit = async () => {
    if (
      !form.customerName.trim() ||
      !form.phone.trim() ||
      !form.wilaya.trim() ||
      !form.city.trim() ||
      !form.product.trim() ||
      !form.price ||
      !form.deliveryPrice
    ) {
      setError('يرجى ملء جميع الحقول الإجبارية')
      scrollToError()
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post('/orders', {
        ...form,
        price: Number(form.price),
        deliveryPrice: Number(form.deliveryPrice),
      })

      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ')
      scrollToError()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          طلب جديد
        </h2>

        <p className="text-slate-500 text-sm font-medium mt-1">
          أدخل بيانات الطلب
        </p>
      </div>

      {error && (
        <div
          ref={errorRef}
          className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold p-3 rounded-2xl mb-5 text-right"
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* بيانات الزبون */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <SectionTitle
            icon={FiUser}
            title="بيانات الزبون"
            color="bg-blue-50 text-blue-600"
          />

          <div className="flex flex-col gap-4">
            <FormField
              label="اسم الزبون *"
              icon={FiUser}
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              placeholder="محمد أمين"
            />

            <FormField
              label="رقم الهاتف *"
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
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <SectionTitle
            icon={FiMapPin}
            title="عنوان التوصيل"
            color="bg-amber-50 text-amber-600"
          />

          <div className="flex flex-col gap-4">
            <WilayaSelect
              label="الولاية *"
              value={form.wilaya}
              wilayas={wilayas}
              onChange={(wilayaName) => {
                setForm({ ...form, wilaya: wilayaName })
              }}
            />

            <FormField
              label="البلدية *"
              icon={FiHome}
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="باب الزوار"
            />
          </div>
        </div>

        {/* بيانات الطلب */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <SectionTitle
            icon={FiPackage}
            title="بيانات الطلب"
            color="bg-emerald-50 text-emerald-600"
          />

          <div className="flex flex-col gap-4">
            <FormField
              label="المنتج *"
              icon={FiPackage}
              name="product"
              value={form.product}
              onChange={handleChange}
              placeholder="حذاء أسود مقاس 42"
            />

            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="السعر *"
                icon={FiDollarSign}
                name="price"
                type="text"
                value={form.price}
                onChange={handleNumericChange}
                placeholder="5500"
                inputMode="numeric"
                pattern="[0-9]*"
              />

              <FormField
                label="سعر التوصيل *"
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

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                ملاحظات
              </label>

              <div className="relative">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-11 text-right text-[15px] font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/70 resize-none"
                  placeholder="أي ملاحظات إضافية..."
                  rows={3}
                />

                <FiFileText
                  className="absolute right-4 top-4 text-slate-400 pointer-events-none"
                  size={18}
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.99] text-white font-extrabold py-3.5 transition duration-200 text-sm shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <FiSave size={18} />
          {loading ? 'جاري الحفظ...' : 'حفظ الطلب'}
        </button>
      </div>
    </Layout>
  )
}

function SectionTitle({ icon: Icon, title, color }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>

      <p className="text-sm font-black text-slate-900">
        {title}
      </p>
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
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type={type}
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

function WilayaSelect({ label, value, wilayas, onChange }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selectedWilaya = wilayas.find(wilaya => wilaya.name === value)

  const filteredWilayas = wilayas.filter(wilaya => {
    const query = search.trim().toLowerCase()

    return (
      wilaya.name.toLowerCase().includes(query) ||
      wilaya.code.includes(query)
    )
  })

  return (
    <div className="relative">
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label}
      </label>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`relative w-full rounded-2xl border px-4 py-3.5 pr-11 pl-11 text-right text-[15px] font-semibold outline-none transition duration-200
          ${open
            ? 'border-blue-500 bg-white ring-4 ring-blue-100/70'
            : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
          }
          ${selectedWilaya ? 'text-slate-900' : 'text-slate-400'}
        `}
      >
        {selectedWilaya
          ? `${selectedWilaya.code} - ${selectedWilaya.name}`
          : 'اختر الولاية'
        }

        <FiMapPin
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          size={18}
        />

        <FiChevronDown
          className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          size={18}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-200/80">
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-right text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
                placeholder="ابحث بالاسم أو الرقم..."
                autoFocus
              />

              <FiSearch
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={17}
              />
            </div>
          </div>

          <div className="max-h-72 overflow-y-auto p-2">
            {filteredWilayas.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm font-medium text-slate-400">
                لا توجد ولاية بهذا البحث
              </div>
            ) : (
              filteredWilayas.map(wilaya => {
                const active = value === wilaya.name

                return (
                  <button
                    key={wilaya.code}
                    type="button"
                    onClick={() => {
                      onChange(wilaya.name)
                      setOpen(false)
                      setSearch('')
                    }}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-right transition duration-200
                      ${active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-50'
                      }
                    `}
                  >
                    <span className="text-sm font-bold">
                      {wilaya.name}
                    </span>

                    <span
                      className={`flex h-8 min-w-8 items-center justify-center rounded-xl text-xs font-black
                        ${active
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                        }
                      `}
                    >
                      {wilaya.code}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}