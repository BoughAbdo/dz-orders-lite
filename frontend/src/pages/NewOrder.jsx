import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'

const wilayas = [
  'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار',
  'البليدة', 'البويرة', 'تمنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر',
  'الجلفة', 'جيجل', 'سطيف', 'سعيدة', 'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة',
  'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر', 'ورقلة', 'وهران', 'البيض',
  'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت', 'الوادي',
  'خنشلة', 'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تيموشنت',
  'غرداية', 'غليزان'
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
        <h2 className="text-xl font-bold text-gray-800">طلب جديد</h2>
        <p className="text-gray-400 text-sm mt-1">أدخل بيانات الطلب</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-right">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm font-medium text-gray-600 mb-3">بيانات الزبون</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1 text-right">اسم الزبون *</label>
              <input
                name="customerName"
                value={form.customerName}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-right text-sm focus:outline-none focus:border-blue-400"
                placeholder="محمد أمين"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 text-right">رقم الهاتف</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-right text-sm focus:outline-none focus:border-blue-400"
                placeholder="0550000000"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm font-medium text-gray-600 mb-3">عنوان التوصيل</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1 text-right">الولاية *</label>
              <select
                name="wilaya"
                value={form.wilaya}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-right text-sm focus:outline-none focus:border-blue-400"
              >
                <option value="">اختر الولاية</option>
                {wilayas.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 text-right">البلدية</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-right text-sm focus:outline-none focus:border-blue-400"
                placeholder="باب الزوار"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-sm font-medium text-gray-600 mb-3">بيانات الطلب</p>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1 text-right">المنتج *</label>
              <input
                name="product"
                value={form.product}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-right text-sm focus:outline-none focus:border-blue-400"
                placeholder="حذاء أسود مقاس 42"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1 text-right">السعر *</label>
                <input
                  name="price"
                  type="number"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-right text-sm focus:outline-none focus:border-blue-400"
                  placeholder="5500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1 text-right">سعر التوصيل</label>
                <input
                  name="deliveryPrice"
                  type="number"
                  value={form.deliveryPrice}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-right text-sm focus:outline-none focus:border-blue-400"
                  placeholder="600"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1 text-right">ملاحظات</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-right text-sm focus:outline-none focus:border-blue-400"
                placeholder="أي ملاحظات إضافية..."
                rows={3}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ الطلب'}
        </button>

      </div>
    </Layout>
  )
}