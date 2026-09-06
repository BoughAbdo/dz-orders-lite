// frontend/src/pages/Products.jsx
import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../services/api'
import {
  FiTag,
  FiPlus,
  FiDollarSign,
  FiLayers,
  FiEdit3,
  FiTrash2,
  FiX,
  FiSave,
  FiAlertCircle,
  FiRefreshCw,
  FiTrendingUp,
} from 'react-icons/fi'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create') // 'create' | 'edit'
  const [currentId, setCurrentId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    costPrice: '',
    sizes: '',
    colors: '',
  })

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.get('/products')
      setProducts(res.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'تعذر تحميل قائمة المنتجات.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const openCreateModal = () => {
    setFormData({
      name: '',
      price: '',
      costPrice: '',
      sizes: '',
      colors: '',
    })
    setModalMode('create')
    setCurrentId(null)
    setFormError(null)
    setShowModal(true)
  }

  const openEditModal = (p) => {
    setFormData({
      name: p.name || '',
      price: String(p.price || ''),
      costPrice: p.costPrice ? String(p.costPrice) : '',
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : '',
      colors: Array.isArray(p.colors) ? p.colors.join(', ') : '',
    })
    setModalMode('edit')
    setCurrentId(p._id)
    setFormError(null)
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setFormError('يرجى إدخال اسم المنتج')
      return
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setFormError('يرجى إدخال سعر بيع صحيح')
      return
    }

    setSaving(true)
    setFormError(null)

    const payload = {
      name: formData.name.trim(),
      price: Number(formData.price),
      costPrice: formData.costPrice ? Number(formData.costPrice) : 0,
      sizes: formData.sizes,
      colors: formData.colors,
    }

    try {
      if (modalMode === 'create') {
        const res = await api.post('/products', payload)
        setProducts([res.data, ...products])
      } else {
        const res = await api.put(`/products/${currentId}`, payload)
        setProducts(products.map((p) => (p._id === currentId ? res.data : p)))
      }
      setShowModal(false)
    } catch (err) {
      setFormError(err.response?.data?.message || 'تعذر حفظ المنتج.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج "${name}"؟`)) return
    try {
      await api.delete(`/products/${id}`)
      setProducts(products.filter((p) => p._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'تعذر حذف المنتج.')
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">كتالوج المنتجات</h2>
            <span className="rounded-xl bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-600">
              {products.length}
            </span>
          </div>
          <p className="mt-0.5 text-xs font-semibold text-slate-400">
            المنتجات والأسعار المحفوظة للاختيار السريع عند تسجيل الطلبات
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-3.5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
        >
          <FiPlus size={16} />
          <span>منتج جديد</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-black text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={loadProducts}
            className="flex items-center gap-1 text-red-600 hover:underline"
          >
            <FiRefreshCw size={14} /> إعادة المحاولة
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-white border border-slate-100 p-4 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <FiTag size={28} />
          </div>
          <p className="text-base font-black text-slate-800">لا يوجد منتجات مسجلة بعد</p>
          <p className="mt-1 text-xs font-semibold text-slate-400 max-w-sm mx-auto">
            أضف منتجاتك الأكثر طلباً وأسعارها ومقاساتها لتعبئة الطلبات بنقرة واحدة لاحقاً.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-extrabold text-white transition hover:bg-blue-700"
          >
            <FiPlus size={15} />
            <span>إضافة أول منتج</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-20">
          {products.map((p) => {
            const margin = p.costPrice > 0 ? p.price - p.costPrice : null

            return (
              <div
                key={p._id}
                className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-black text-sm text-slate-900 truncate">{p.name}</h3>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-sm font-black text-blue-600">
                        {p.price?.toLocaleString()} دج
                      </span>
                      {p.costPrice > 0 && (
                        <span className="text-[11px] font-bold text-slate-400">
                          (تكلفة: {p.costPrice.toLocaleString()} دج)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(p)}
                      className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-50 hover:text-blue-600 transition"
                      title="تعديل"
                    >
                      <FiEdit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p._id, p.name)}
                      className="p-1.5 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                      title="حذف"
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* مقاسات وألوان */}
                {(p.sizes?.length > 0 || p.colors?.length > 0) && (
                  <div className="mt-3 pt-3 border-t border-slate-50 flex flex-wrap gap-1.5">
                    {p.sizes?.map((sz, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600"
                      >
                        {sz}
                      </span>
                    ))}
                    {p.colors?.map((cl, idx) => (
                      <span
                        key={idx}
                        className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-700"
                      >
                        {cl}
                      </span>
                    ))}
                  </div>
                )}

                {/* هامش الربح التقريبي */}
                {margin !== null && (
                  <div className="mt-2 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <FiTrendingUp size={12} />
                    <span>ربح تقريبي: {margin.toLocaleString()} دج</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal إضافة / تعديل منتج */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {modalMode === 'create' ? 'إضافة منتج جديد' : 'تعديل المنتج'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100"
              >
                <FiX size={18} />
              </button>
            </div>

            {formError && (
              <div className="mt-3 rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-600 flex items-center gap-2">
                <FiAlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-3.5">
              <div>
                <label className="mb-1 block text-xs font-black text-slate-700">اسم المنتج *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: حذاء كلاسيكي بني جلد"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-black text-slate-700">
                    سعر البيع (دج) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="6500"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-black text-slate-700">
                    سعر التكلفة / الجملة
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="3500 (اختياري)"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-black text-slate-700">
                  المقاسات المتاحة (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  value={formData.sizes}
                  onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                  placeholder="مثال: 40, 41, 42, 43, 44 أو S, M, L, XL"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-black text-slate-700">
                  الألوان المتاحة (مفصولة بفاصلة)
                </label>
                <input
                  type="text"
                  value={formData.colors}
                  onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                  placeholder="مثال: أسود, بني, كحلي (اختياري)"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50"
                >
                  <FiSave size={15} />
                  <span>{saving ? 'جاري الحفظ...' : 'حفظ المنتج'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}