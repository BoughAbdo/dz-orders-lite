// frontend/src/pages/OrderDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
  FiMessageCircle,
  FiPrinter,
  FiTrash2,
  FiRefreshCcw,
  FiCheckCircle,
  FiClock,
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

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusError, setStatusError] = useState('')

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  const updateStatus = async (status) => {
    setStatusError('')

    try {
      const res = await api.patch(`/orders/${id}/status`, { status })
      setOrder(res.data)
    } catch (err) {
      setStatusError(err.response?.data?.message || 'تعذر تغيير حالة الطلب')
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

  const openWhatsApp = () => {
    if (!order.phone) return

    const msg = `السلام عليكم ${order.customerName}، طلبك (${order.product}) تم تأكيده وسيتم التوصيل قريباً إن شاء الله.`
    window.open(`https://wa.me/${order.phone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  const generatePDF = () => {
    const printWindow = window.open('', '_blank')

    printWindow.document.write(`
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>طلب - ${order.customerName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              direction: rtl;
              padding: 24px;
              color: #0f172a;
            }

            h2 {
              text-align: center;
              margin-bottom: 24px;
            }

            h3 {
              margin-top: 0;
              color: #1e293b;
            }

            .section {
              margin-bottom: 20px;
              border: 1px solid #e5e7eb;
              padding: 16px;
              border-radius: 12px;
            }

            .row {
              display: flex;
              justify-content: space-between;
              gap: 16px;
              margin-bottom: 10px;
              border-bottom: 1px solid #f1f5f9;
              padding-bottom: 8px;
            }

            .row:last-child {
              border-bottom: 0;
              margin-bottom: 0;
              padding-bottom: 0;
            }

            .label {
              color: #64748b;
            }

            .value {
              font-weight: bold;
              color: #0f172a;
            }

            .total {
              color: #2563eb;
              font-size: 18px;
            }
          </style>
        </head>

        <body>
          <h2>طلبيات - تفاصيل الطلب</h2>

          <div class="section">
            <h3>بيانات الزبون</h3>
            <div class="row"><span class="label">الاسم</span><span class="value">${order.customerName}</span></div>
            <div class="row"><span class="label">الهاتف</span><span class="value">${order.phone || '-'}</span></div>
            <div class="row"><span class="label">الولاية</span><span class="value">${order.wilaya}</span></div>
            <div class="row"><span class="label">البلدية</span><span class="value">${order.city || '-'}</span></div>
          </div>

          <div class="section">
            <h3>بيانات الطلب</h3>
            <div class="row"><span class="label">المنتج</span><span class="value">${order.product}</span></div>
            <div class="row"><span class="label">السعر</span><span class="value">${order.price} دج</span></div>
            <div class="row"><span class="label">التوصيل</span><span class="value">${order.deliveryPrice} دج</span></div>
            <div class="row"><span class="label">الإجمالي</span><span class="value total">${order.price + order.deliveryPrice} دج</span></div>
            <div class="row"><span class="label">الحالة</span><span class="value">${statusLabels[order.status]?.label}</span></div>
            ${order.notes ? `<div class="row"><span class="label">ملاحظات</span><span class="value">${order.notes}</span></div>` : ''}
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.print()
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

      <div id="order-detail" className="space-y-4">
        {/* بيانات الزبون */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FiUser size={20} />
            </div>

            <p className="text-sm font-black text-slate-900">
              بيانات الزبون
            </p>
          </div>

          <div className="flex flex-col divide-y divide-slate-100">
            <DetailRow icon={FiUser} label="الاسم" value={order.customerName} />
            <DetailRow icon={FiPhone} label="الهاتف" value={order.phone || '—'} />
            <DetailRow icon={FiMapPin} label="الولاية" value={order.wilaya} />
            <DetailRow icon={FiHome} label="البلدية" value={order.city || '—'} />
          </div>
        </div>

        {/* بيانات الطلب */}
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

      {/* تغيير الحالة */}
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

      {/* أزرار */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        <button
          onClick={openWhatsApp}
          className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl text-sm font-extrabold transition active:scale-[0.99] shadow-lg shadow-emerald-500/20"
        >
          <FiMessageCircle size={18} />
          واتساب
        </button>

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