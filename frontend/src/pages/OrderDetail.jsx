// frontend/src/pages/OrderDetail.jsx
import { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  FiUser,
  FiPhone,
  FiMapPin,
  FiHome,
  FiPackage,
  FiDollarSign,
  FiTruck,
  FiFileText,
  FiMessageCircle,
  FiPrinter,
  FiTrash2,
  FiRefreshCcw,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiSave,
  FiX,
  FiChevronDown,
  FiChevronUp,
} from 'react-icons/fi'

const statusLabels = {
  new: {
    label: 'جديد',
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    icon: FiClock,
  },
  confirmed: {
    label: 'مؤكد',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    icon: FiCheckCircle,
  },
  shipped: {
    label: 'قيد التوصيل',
    color: 'bg-amber-50 text-amber-600 border-amber-100',
    icon: FiTruck,
  },
  delivered: {
    label: 'تم التسليم',
    color: 'bg-green-50 text-green-600 border-green-100',
    icon: FiCheckCircle,
  },
  returned: {
    label: 'رجع',
    color: 'bg-red-50 text-red-600 border-red-100',
    icon: FiRefreshCcw,
  },
}

const statusFlow = ['new', 'confirmed', 'shipped', 'delivered']

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

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusError, setStatusError] = useState('')
  const [showWhatsAppMenu, setShowWhatsAppMenu] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const editErrorRef = useRef(null)

  const [editForm, setEditForm] = useState({
    customerName: '',
    phone: '',
    wilaya: '',
    city: '',
    product: '',
    price: '',
    deliveryPrice: '',
    notes: '',
  })

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => {
        setOrder(res.data)

        setEditForm({
          customerName: res.data.customerName || '',
          phone: res.data.phone || '',
          wilaya: res.data.wilaya || '',
          city: res.data.city || '',
          product: res.data.product || '',
          price: String(res.data.price || ''),
          deliveryPrice: String(res.data.deliveryPrice || ''),
          notes: res.data.notes || '',
        })
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  const scrollToEditError = () => {
    setTimeout(() => {
      editErrorRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }, 0)
  }

  const updateStatus = async (status) => {
    setStatusError('')

    try {
      const res = await api.patch(`/orders/${id}/status`, { status })
      setOrder(res.data)
    } catch (err) {
      setStatusError(err.response?.data?.message || 'تعذر تغيير حالة الطلب')
    }
  }

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    })
  }

  const handleEditNumericChange = (e) => {
    const { name, value } = e.target
    const onlyNumbers = value.replace(/\D/g, '')

    setEditForm({
      ...editForm,
      [name]: onlyNumbers,
    })
  }

  const startEditing = () => {
    setEditError('')
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setEditError('')
    setIsEditing(false)

    setEditForm({
      customerName: order.customerName || '',
      phone: order.phone || '',
      wilaya: order.wilaya || '',
      city: order.city || '',
      product: order.product || '',
      price: String(order.price || ''),
      deliveryPrice: String(order.deliveryPrice || ''),
      notes: order.notes || '',
    })
  }

  const saveOrder = async () => {
    if (
      !editForm.customerName.trim() ||
      !editForm.phone.trim() ||
      !editForm.wilaya.trim() ||
      !editForm.city.trim() ||
      !editForm.product.trim() ||
      !editForm.price ||
      !editForm.deliveryPrice
    ) {
      setEditError('يرجى ملء جميع الحقول الإجبارية')
      scrollToEditError()
      return
    }

    setEditLoading(true)
    setEditError('')

    try {
      const res = await api.put(`/orders/${id}`, {
        ...editForm,
        price: Number(editForm.price),
        deliveryPrice: Number(editForm.deliveryPrice),
      })

      setOrder(res.data)
      setIsEditing(false)
    } catch (err) {
      setEditError(err.response?.data?.message || 'تعذر تعديل الطلب')
      scrollToEditError()
    } finally {
      setEditLoading(false)
    }
  }

  const deleteOrder = async () => {
    if (!confirm('هل تريد حذف هذا الطلب؟')) return

    try {
      await api.delete(`/orders/${id}`)
      navigate('/orders')
    } catch (err) {
      console.error(err)
    }
  }

  const openWhatsApp = (msg) => {
    if (!order?.phone) return

    window.open(
      `https://wa.me/${order.phone}?text=${encodeURIComponent(msg)}`,
      '_blank'
    )

    setShowWhatsAppMenu(false)
  }

  const escapeHTML = (value) => {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;')
  }

  const formatDate = (date) => {
    if (!date) return '-'

    return new Date(date).toLocaleDateString('ar-DZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const generatePDF = () => {
    if (!order) return

    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      alert('يرجى السماح بفتح النوافذ المنبثقة لطباعة الطلب')
      return
    }

    const storeName = user?.businessName || 'طلبيات'
    const storePhone = user?.phone || ''

    const orderTotal = Number(order.price || 0) + Number(order.deliveryPrice || 0)
    const printedAt = new Date().toLocaleString('ar-DZ')
    const shortOrderId = order._id ? String(order._id).slice(-8) : '-'

    printWindow.document.write(`
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>طلب - ${escapeHTML(order.customerName)}</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, Tahoma, sans-serif;
              direction: rtl;
              margin: 0;
              padding: 24px;
              color: #0f172a;
              background: #f8fafc;
            }

            .page {
              max-width: 820px;
              margin: 0 auto;
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 18px;
              overflow: hidden;
            }

            .header {
              background: linear-gradient(135deg, #2563eb, #1d4ed8);
              color: #ffffff;
              padding: 22px 24px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 16px;
            }

            .store-name {
              font-size: 26px;
              font-weight: 900;
              margin: 0 0 6px;
            }

            .store-phone {
              font-size: 13px;
              font-weight: 700;
              color: #dbeafe;
              margin: 0;
            }

            .badge {
              background: rgba(255, 255, 255, 0.14);
              border: 1px solid rgba(255, 255, 255, 0.22);
              color: #ffffff;
              padding: 10px 14px;
              border-radius: 999px;
              font-size: 13px;
              font-weight: 800;
              white-space: nowrap;
            }

            .content {
              padding: 22px;
            }

            .meta {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
              margin-bottom: 16px;
            }

            .meta-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 14px;
              padding: 12px;
            }

            .meta-label {
              display: block;
              color: #64748b;
              font-size: 11px;
              font-weight: 700;
              margin-bottom: 5px;
            }

            .meta-value {
              display: block;
              color: #0f172a;
              font-size: 13px;
              font-weight: 900;
            }

            .section {
              margin-bottom: 16px;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              overflow: hidden;
              background: #ffffff;
            }

            .section-title {
              margin: 0;
              padding: 13px 16px;
              color: #0f172a;
              background: #f8fafc;
              border-bottom: 1px solid #e2e8f0;
              font-size: 15px;
              font-weight: 900;
            }

            .rows {
              padding: 4px 16px;
            }

            .row {
              display: flex;
              justify-content: space-between;
              gap: 16px;
              padding: 12px 0;
              border-bottom: 1px solid #f1f5f9;
            }

            .row:last-child {
              border-bottom: 0;
            }

            .label {
              color: #64748b;
              font-size: 13px;
              font-weight: 700;
              white-space: nowrap;
            }

            .value {
              color: #0f172a;
              font-size: 13px;
              font-weight: 900;
              text-align: left;
              word-break: break-word;
            }

            .total-row {
              margin-top: 10px;
              background: #eff6ff;
              border: 1px solid #bfdbfe;
              border-radius: 16px;
              padding: 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 16px;
            }

            .total-label {
              color: #1e40af;
              font-size: 14px;
              font-weight: 900;
            }

            .total-value {
              color: #2563eb;
              font-size: 22px;
              font-weight: 900;
            }

            .footer {
              padding: 16px 22px 22px;
              color: #64748b;
              text-align: center;
              font-size: 12px;
              font-weight: 700;
            }

            @media print {
              body {
                padding: 0;
                background: #ffffff;
              }

              .page {
                max-width: none;
                border: 0;
                border-radius: 0;
              }

              .header {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }

              .meta-card,
              .section,
              .total-row {
                break-inside: avoid;
              }
            }

            @media (max-width: 640px) {
              body {
                padding: 12px;
              }

              .header {
                align-items: flex-start;
                flex-direction: column;
              }

              .meta {
                grid-template-columns: 1fr;
              }
            }
          </style>
        </head>

        <body>
          <div class="page">
            <div class="header">
              <div>
                <h1 class="store-name">${escapeHTML(storeName)}</h1>
                ${storePhone ? `<p class="store-phone">هاتف المتجر: ${escapeHTML(storePhone)}</p>` : ''}
              </div>

              <div class="badge">
                تفاصيل الطلب
              </div>
            </div>

            <div class="content">
              <div class="meta">
                <div class="meta-card">
                  <span class="meta-label">رقم الطلب</span>
                  <span class="meta-value">#${escapeHTML(shortOrderId)}</span>
                </div>

                <div class="meta-card">
                  <span class="meta-label">تاريخ الطلب</span>
                  <span class="meta-value">${escapeHTML(formatDate(order.createdAt))}</span>
                </div>

                <div class="meta-card">
                  <span class="meta-label">تاريخ الطباعة</span>
                  <span class="meta-value">${escapeHTML(printedAt)}</span>
                </div>
              </div>

              <div class="section">
                <h2 class="section-title">بيانات الزبون</h2>

                <div class="rows">
                  <div class="row">
                    <span class="label">الاسم</span>
                    <span class="value">${escapeHTML(order.customerName)}</span>
                  </div>

                  <div class="row">
                    <span class="label">الهاتف</span>
                    <span class="value">${escapeHTML(order.phone || '-')}</span>
                  </div>

                  <div class="row">
                    <span class="label">الولاية</span>
                    <span class="value">${escapeHTML(order.wilaya)}</span>
                  </div>

                  <div class="row">
                    <span class="label">البلدية</span>
                    <span class="value">${escapeHTML(order.city || '-')}</span>
                  </div>
                </div>
              </div>

              <div class="section">
                <h2 class="section-title">بيانات الطلب</h2>

                <div class="rows">
                  <div class="row">
                    <span class="label">المنتج</span>
                    <span class="value">${escapeHTML(order.product)}</span>
                  </div>

                  <div class="row">
                    <span class="label">السعر</span>
                    <span class="value">${Number(order.price || 0).toLocaleString()} دج</span>
                  </div>

                  <div class="row">
                    <span class="label">التوصيل</span>
                    <span class="value">${Number(order.deliveryPrice || 0).toLocaleString()} دج</span>
                  </div>

                  <div class="row">
                    <span class="label">الحالة</span>
                    <span class="value">${escapeHTML(statusLabels[order.status]?.label || '-')}</span>
                  </div>

                  ${order.notes ? `
                    <div class="row">
                      <span class="label">ملاحظات</span>
                      <span class="value">${escapeHTML(order.notes)}</span>
                    </div>
                  ` : ''}
                </div>
              </div>

              <div class="total-row">
                <span class="total-label">الإجمالي</span>
                <span class="total-value">${orderTotal.toLocaleString()} دج</span>
              </div>
            </div>

            <div class="footer">
              شكراً لثقتكم بنا
            </div>
          </div>

          <script>
            window.onload = function () {
              window.print()
            }
          </script>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  if (loading) {
    return (
      <Layout>
        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-400 font-medium shadow-sm">
          جاري التحميل...
        </div>
      </Layout>
    )
  }

  if (!order) {
    return (
      <Layout>
        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center text-slate-400 font-medium shadow-sm">
          الطلب غير موجود
        </div>
      </Layout>
    )
  }

  const currentStatus = statusLabels[order.status]
  const CurrentStatusIcon = currentStatus?.icon || FiPackage
  const total = Number(order.price || 0) + Number(order.deliveryPrice || 0)
  const isFinalStatus = ['delivered', 'returned'].includes(order.status)

  const storeName = user?.businessName || 'طلبيات'

  const whatsappTemplates = {
    confirmOrder:
      user?.whatsappTemplates?.confirmOrder ||
      defaultWhatsappTemplates.confirmOrder,
    shipped:
      user?.whatsappTemplates?.shipped ||
      defaultWhatsappTemplates.shipped,
    delivered:
      user?.whatsappTemplates?.delivered ||
      defaultWhatsappTemplates.delivered,
    followUp:
      user?.whatsappTemplates?.followUp ||
      defaultWhatsappTemplates.followUp,
    returned:
      user?.whatsappTemplates?.returned ||
      defaultWhatsappTemplates.returned,
  }

  const fillWhatsappTemplate = (template) => {
    return String(template || '')
      .replaceAll('{name}', order.customerName || '')
      .replaceAll('{product}', order.product || '')
      .replaceAll('{total}', total.toLocaleString())
      .replaceAll('{store}', storeName)
  }

  const whatsappMessages = [
    {
      label: 'تأكيد الطلب',
      description: 'إرسال رسالة تأكيد للزبون',
      icon: FiCheckCircle,
      msg: fillWhatsappTemplate(whatsappTemplates.confirmOrder),
    },
    {
      label: 'إشعار بالشحن',
      description: 'إعلام الزبون أن الطلب في الطريق',
      icon: FiTruck,
      msg: fillWhatsappTemplate(whatsappTemplates.shipped),
    },
    {
      label: 'تأكيد التسليم',
      description: 'رسالة متابعة بعد وصول الطلب',
      icon: FiCheckCircle,
      msg: fillWhatsappTemplate(whatsappTemplates.delivered),
    },
    {
      label: 'متابعة الطلب',
      description: 'طلب تأكيد معلومات التوصيل',
      icon: FiClock,
      msg: fillWhatsappTemplate(whatsappTemplates.followUp),
    },
    {
      label: 'استفسار عن الرجوع',
      description: 'معرفة سبب رجوع الطلب',
      icon: FiRefreshCcw,
      msg: fillWhatsappTemplate(whatsappTemplates.returned),
    },
  ]

  return (
    <Layout>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            تفاصيل الطلب
          </h2>

          <p className="text-slate-500 text-sm font-medium mt-1">
            مراجعة بيانات الطلب وتحديث حالته
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-extrabold border ${currentStatus?.color}`}
        >
          <CurrentStatusIcon size={14} />
          {currentStatus?.label}
        </span>
      </div>

      {isEditing ? (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-5">
            <p className="text-sm font-black text-slate-900">
              تعديل بيانات الطلب
            </p>

            <button
              type="button"
              onClick={cancelEditing}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-100"
            >
              <FiX size={15} />
              إلغاء
            </button>
          </div>

          {editError && (
            <div
              ref={editErrorRef}
              className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-600"
            >
              {editError}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <EditField
              label="اسم الزبون *"
              icon={FiUser}
              name="customerName"
              value={editForm.customerName}
              onChange={handleEditChange}
              placeholder="محمد أمين"
            />

            <EditField
              label="رقم الهاتف *"
              icon={FiPhone}
              name="phone"
              value={editForm.phone}
              onChange={handleEditNumericChange}
              placeholder="0550000000"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={15}
            />

            <EditField
              label="الولاية *"
              icon={FiMapPin}
              name="wilaya"
              value={editForm.wilaya}
              onChange={handleEditChange}
              placeholder="الجزائر"
            />

            <EditField
              label="البلدية *"
              icon={FiHome}
              name="city"
              value={editForm.city}
              onChange={handleEditChange}
              placeholder="باب الزوار"
            />

            <EditField
              label="المنتج *"
              icon={FiPackage}
              name="product"
              value={editForm.product}
              onChange={handleEditChange}
              placeholder="حذاء أسود مقاس 42"
            />

            <div className="grid grid-cols-2 gap-3">
              <EditField
                label="السعر *"
                icon={FiDollarSign}
                name="price"
                value={editForm.price}
                onChange={handleEditNumericChange}
                placeholder="5500"
                inputMode="numeric"
                pattern="[0-9]*"
              />

              <EditField
                label="سعر التوصيل *"
                icon={FiTruck}
                name="deliveryPrice"
                value={editForm.deliveryPrice}
                onChange={handleEditNumericChange}
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
                  value={editForm.notes}
                  onChange={handleEditChange}
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

            <button
              type="button"
              onClick={saveOrder}
              disabled={editLoading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-[0.99] text-white font-extrabold py-3.5 transition duration-200 text-sm shadow-lg shadow-blue-600/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <FiSave size={18} />
              {editLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div id="order-detail" className="space-y-4">
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FiUser size={20} />
                  </div>

                  <p className="text-sm font-black text-slate-900">
                    بيانات الزبون
                  </p>
                </div>

                <button
                  type="button"
                  onClick={startEditing}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-50 px-3 py-2 text-xs font-extrabold text-blue-600 transition hover:bg-blue-100"
                >
                  <FiEdit3 size={15} />
                  تعديل
                </button>
              </div>

              <div className="flex flex-col divide-y divide-slate-100">
                <DetailRow icon={FiUser} label="الاسم" value={order.customerName} />
                <DetailRow icon={FiPhone} label="الهاتف" value={order.phone || '—'} />
                <DetailRow icon={FiMapPin} label="الولاية" value={order.wilaya} />
                <DetailRow icon={FiHome} label="البلدية" value={order.city || '—'} />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FiPackage size={20} />
                </div>

                <p className="text-sm font-black text-slate-900">
                  بيانات الطلب
                </p>
              </div>

              <div className="flex flex-col divide-y divide-slate-100">
                <DetailRow icon={FiPackage} label="المنتج" value={order.product} />
                <DetailRow icon={FiDollarSign} label="السعر" value={`${Number(order.price || 0).toLocaleString()} دج`} />
                <DetailRow icon={FiTruck} label="التوصيل" value={`${Number(order.deliveryPrice || 0).toLocaleString()} دج`} />
                <DetailRow
                  icon={FiDollarSign}
                  label="الإجمالي"
                  value={`${total.toLocaleString()} دج`}
                  valueClassName="text-blue-600 font-black"
                />

                {order.notes && (
                  <DetailRow icon={FiFileText} label="ملاحظات" value={order.notes} />
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mt-4">
            <p className="text-sm font-black text-slate-900 mb-4">
              تغيير الحالة
            </p>

            <div className="flex gap-2 flex-wrap">
              {statusFlow.map(s => {
                const StatusIcon = statusLabels[s].icon

                return (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={isFinalStatus || order.status === s}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold border transition duration-200 disabled:cursor-not-allowed disabled:opacity-60
                      ${order.status === s
                        ? statusLabels[s].color
                        : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-700'
                      }`}
                  >
                    <StatusIcon size={14} />
                    {statusLabels[s].label}
                  </button>
                )
              })}

              <button
                onClick={() => updateStatus('returned')}
                disabled={isFinalStatus || order.status === 'returned'}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold border transition duration-200 disabled:cursor-not-allowed disabled:opacity-60
                  ${order.status === 'returned'
                    ? statusLabels.returned.color
                    : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100 hover:text-slate-700'
                  }`}
              >
                <FiRefreshCcw size={14} />
                رجع
              </button>
            </div>

            {isFinalStatus && (
              <p className="mt-3 text-xs font-semibold text-slate-400">
                هذا الطلب تم إنهاؤه ولا يمكن تغيير حالته.
              </p>
            )}

            {statusError && (
              <div className="mt-3 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-600">
                {statusError}
              </div>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <div className="relative">
              <button
                onClick={() => setShowWhatsAppMenu(!showWhatsAppMenu)}
                className="w-full flex items-center justify-between gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 px-5 rounded-2xl text-sm font-extrabold transition active:scale-[0.99] shadow-lg shadow-emerald-500/20"
              >
                <div className="flex items-center gap-2">
                  <FiMessageCircle size={18} />
                  رسائل واتساب
                </div>

                {showWhatsAppMenu ? (
                  <FiChevronUp size={16} />
                ) : (
                  <FiChevronDown size={16} />
                )}
              </button>

              {showWhatsAppMenu && (
                <div className="mt-2 bg-white border border-slate-100 rounded-3xl shadow-lg overflow-hidden">
                  {whatsappMessages.map((item, i) => {
                    const Icon = item.icon

                    return (
                      <button
                        key={i}
                        onClick={() => openWhatsApp(item.msg)}
                        className="w-full flex items-center gap-3 px-4 py-3.5 text-right transition border-b border-slate-50 last:border-0 hover:bg-slate-50"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                          <Icon size={18} />
                        </span>

                        <span className="flex flex-col items-start">
                          <span className="text-sm font-extrabold text-slate-800">
                            {item.label}
                          </span>

                          <span className="text-xs font-medium text-slate-400 mt-0.5">
                            {item.description}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={generatePDF}
                className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 py-3 rounded-2xl text-sm font-extrabold transition active:scale-[0.99]"
              >
                <FiPrinter size={18} />
                PDF
              </button>

              <button
                onClick={deleteOrder}
                className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-2xl text-sm font-extrabold transition active:scale-[0.99]"
              >
                <FiTrash2 size={18} />
                حذف
              </button>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}

function DetailRow({ icon: Icon, label, value, valueClassName = 'text-slate-900 font-bold' }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={16} className="text-slate-400" />
        <span className="text-sm font-bold">
          {label}
        </span>
      </div>

      <span className={`text-sm text-left ${valueClassName}`}>
        {value}
      </span>
    </div>
  )
}

function EditField({
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