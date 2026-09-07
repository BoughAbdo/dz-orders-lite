// frontend/src/pages/Products.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import {
  FiTag,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiX,
  FiSave,
  FiAlertCircle,
  FiRefreshCw,
  FiTrendingUp,
  FiShoppingBag,
  FiLayers,
} from 'react-icons/fi'

export default function Products() {
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [currentId, setCurrentId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    costPrice: '',
    sizes: [],
    colors: [],
  })

  const [sizeInput, setSizeInput] = useState('')
  const [colorInput, setColorInput] = useState('')

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
    setFormData({ name: '', price: '', costPrice: '', sizes: [], colors: [] })
    setSizeInput('')
    setColorInput('')
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
      sizes: Array.isArray(p.sizes) ? p.sizes : [],
      colors: Array.isArray(p.colors) ? p.colors : [],
    })
    setSizeInput('')
    setColorInput('')
    setModalMode('edit')
    setCurrentId(p._id)
    setFormError(null)
    setShowModal(true)
  }

  const handleAddSize = () => {
    const trimmed = sizeInput.trim()
    if (trimmed && !formData.sizes.includes(trimmed)) {
      setFormData({ ...formData, sizes: [...formData.sizes, trimmed] })
      setSizeInput('')
    }
  }

  const handleRemoveSize = (sz) => {
    setFormData({ ...formData, sizes: formData.sizes.filter((s) => s !== sz) })
  }

  const handleAddColor = () => {
    const trimmed = colorInput.trim()
    if (trimmed && !formData.colors.includes(trimmed)) {
      setFormData({ ...formData, colors: [...formData.colors, trimmed] })
      setColorInput('')
    }
  }

  const handleRemoveColor = (cl) => {
    setFormData({ ...formData, colors: formData.colors.filter((c) => c !== cl) })
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

  const handleQuickOrder = (product) => {
    navigate('/orders/new', { state: { presetProduct: product } })
  }

  return (
    <Layout>
      {/* Header الترويسة الرئيسية */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">كتالوج السلع والمنتجات</h2>
            <span className="rounded-full bg-blue-50 text-blue-600 border border-blue-100 px-3 py-0.5 text-xs font-black">
              {products.length} {products.length === 1 ? 'منتج' : 'منتجات'}
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500">
            إدارة قائمة المنتجات والأسعار لتسريع تسجيل الطلبات والحسابات التلقائية
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95 shrink-0"
        >
          <FiPlus size={18} />
          <span>إضافة منتج جديد</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-black text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={loadProducts} className="flex items-center gap-1.5 text-red-600 hover:underline">
            <FiRefreshCw size={14} /> إعادة المحاولة
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-white border border-slate-100 p-5 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-12 text-center shadow-sm max-w-lg mx-auto mt-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-600 shadow-inner">
            <FiTag size={32} />
          </div>
          <h3 className="text-lg font-black text-slate-800">لا توجد منتجات مسجلة حتى الآن</h3>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-400 leading-relaxed">
            أضف منتجاتك الأكثر مبيعاً وأسعارها وهوامش ربحها لتعبئة معلومات الطلبات بنقرة واحدة.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95"
          >
            <FiPlus size={16} />
            <span>إضافة أول منتج</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
          {products.map((p) => {
            const margin = p.costPrice > 0 ? p.price - p.costPrice : null

            return (
              <div
                key={p._id}
                className="group relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-xl hover:shadow-slate-100 flex flex-col justify-between"
              >
                <div>
                  {/* رأس البطاقة */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition duration-200">
                        <FiTag size={20} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-base text-slate-900 truncate" title={p.name}>
                          {p.name}
                        </h3>
                        <p className="text-xs font-semibold text-slate-400 mt-0.5">
                          {p.costPrice > 0 ? `تكلفة الجملة: ${p.costPrice.toLocaleString()} دج` : 'سعر التكلفة غير محدد'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(p)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                        title="تعديل"
                      >
                        <FiEdit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p._id, p.name)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="حذف"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* كتلة الأسعار والأرباح */}
                  <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 flex items-center justify-between border border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block">سعر البيع</span>
                      <span className="text-lg font-black text-slate-900">
                        {p.price?.toLocaleString()} <span className="text-xs font-bold text-slate-500">دج</span>
                      </span>
                    </div>

                    {margin !== null && (
                      <div className="text-left">
                        <span className="text-[11px] font-bold text-emerald-600 block">الربح التقريبي</span>
                        <span className="text-sm font-black text-emerald-600 flex items-center gap-1">
                          <FiTrendingUp size={13} />
                          +{margin.toLocaleString()} دج
                        </span>
                      </div>
                    )}
                  </div>

                  {/* المقاسات والألوان */}
                  {(p.sizes?.length > 0 || p.colors?.length > 0) && (
                    <div className="mt-3.5 space-y-1.5">
                      {p.sizes?.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-black text-slate-400">المقاسات:</span>
                          {p.sizes.map((sz, idx) => (
                            <span
                              key={idx}
                              className="rounded-lg bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[11px] font-bold text-slate-700"
                            >
                              {sz}
                            </span>
                          ))}
                        </div>
                      )}

                      {p.colors?.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-black text-slate-400">الألوان:</span>
                          {p.colors.map((cl, idx) => (
                            <span
                              key={idx}
                              className="rounded-lg bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700"
                            >
                              {cl}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* زر الإجراء السفلي */}
                <div className="mt-5 pt-3.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleQuickOrder(p)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-50 py-2.5 text-xs font-black text-blue-600 hover:bg-blue-600 hover:text-white transition active:scale-95 shadow-sm"
                  >
                    <FiShoppingBag size={14} />
                    <span>إنشاء طلب بهذا المنتج</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal إضافة / تعديل منتج */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FiTag size={17} />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {modalMode === 'create' ? 'إضافة منتج جديد' : 'تعديل بيانات المنتج'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition"
              >
                <FiX size={18} />
              </button>
            </div>

            {formError && (
              <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-600 flex items-center gap-2">
                <FiAlertCircle size={16} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">اسم السلعة / المنتج *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: حذاء كلاسيكي بني جلد"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-black text-slate-700">سعر البيع (دج) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="4800"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/50"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-black text-slate-700">سعر التكلفة بالجملة</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    placeholder="2600 (اختياري)"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/50"
                  />
                </div>
              </div>

              {/* المقاسات */}
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">المقاسات المتاحة</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sizeInput}
                    onChange={(e) => setSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        handleAddSize()
                      }
                    }}
                    placeholder="اكتب المقاس (مثال: 42 أو L) واضغط Enter"
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="rounded-2xl bg-slate-100 px-4 text-xs font-black text-slate-700 hover:bg-slate-200 transition"
                  >
                    إضافة
                  </button>
                </div>

                {formData.sizes.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {formData.sizes.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200/80 px-2.5 py-1 text-xs font-black text-slate-700"
                      >
                        <span>{s}</span>
                        <button type="button" onClick={() => handleRemoveSize(s)} className="hover:text-red-500">
                          <FiX size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* الألوان */}
              <div>
                <label className="mb-1.5 block text-xs font-black text-slate-700">الألوان المتاحة</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        handleAddColor()
                      }
                    }}
                    placeholder="اكتب اللون واضغط Enter"
                    className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="rounded-2xl bg-slate-100 px-4 text-xs font-black text-slate-700 hover:bg-slate-200 transition"
                  >
                    إضافة
                  </button>
                </div>

                {formData.colors.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {formData.colors.map((c, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-xs font-black text-emerald-700"
                      >
                        <span>{c}</span>
                        <button type="button" onClick={() => handleRemoveColor(c)} className="hover:text-red-500">
                          <FiX size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-100 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition active:scale-95"
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