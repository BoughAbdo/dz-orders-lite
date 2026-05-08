import { useState } from 'react'
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
} from 'react-icons/fi'

const wilayas = [
  'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار',
  'البليدة', 'البويرة', 'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر',
  'الجلفة', 'جيجل', 'سطيف', 'سعيدة', 'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة',
  'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة', 'وهران', 'البيض',
  'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي',
  'خنشلة', 'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تيموشنت',
  'غرداية', 'غليزان',
  'تيميمون',
  'برج باجي مختار',
  'أولاد جلال',
  'بني عباس',
  'عين صالح',
  'عين قزام',
  'تقرت',
  'جانت',
  'المغير',
  'المنيعة'
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
    notes: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.customerName || !form.product || !form.price || !form.wilaya) {
      setError('يرجى ملء الحقول الإجبارية')
      return
    }

    setLoading(true)
    setError('')

    try {
      await api.post('/orders', {
        ...form,
        price: Number(form.price),
        deliveryPrice: Number(form.deliveryPrice) || 0
      })

      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ')
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
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-semibold p-3 rounded-2xl mb-5 text-right">
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
              label="رقم الهاتف"
              icon={FiPhone}
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="0550000000"
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
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                الولاية *
              </label>

              <div className="relative">
                <select
                  name="wilaya"
                  value={form.wilaya}
                  onChange={handleChange}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-11 text-right text-[15px] font-semibold text-slate-900 outline-none transition duration-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/70"
                >
                  <option value="">اختر الولاية</option>
                  {wilayas.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>

                <FiMapPin
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={18}
                />
              </div>
            </div>

            <FormField
              label="البلدية"
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
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="5500"
              />

              <FormField
                label="سعر التوصيل"
                icon={FiTruck}
                name="deliveryPrice"
                type="number"
                value={form.deliveryPrice}
                onChange={handleChange}
                placeholder="600"
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
  type = 'text'
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