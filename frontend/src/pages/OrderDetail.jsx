import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import api from '../services/api'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

const statusLabels = {
  new: { label: 'جديد', color: 'bg-blue-100 text-blue-600' },
  confirmed: { label: 'مؤكد', color: 'bg-green-100 text-green-600' },
  shipped: { label: 'قيد التوصيل', color: 'bg-yellow-100 text-yellow-600' },
  delivered: { label: 'تم التسليم', color: 'bg-emerald-100 text-emerald-600' },
  returned: { label: 'رجع', color: 'bg-red-100 text-red-600' },
}

const statusFlow = ['new', 'confirmed', 'shipped', 'delivered']

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [id])

  const updateStatus = async (status) => {
    try {
      const res = await api.patch(`/orders/${id}/status`, { status })
      setOrder(res.data)
    } catch (err) {
      console.error(err)
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
    <html>
      <head>
        <meta charset="UTF-8">
        <title>طلب - ${order.customerName}</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
          h2 { text-align: center; }
          .section { margin-bottom: 20px; border: 1px solid #eee; padding: 15px; border-radius: 8px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .label { color: #666; }
          .value { font-weight: bold; }
          .total { color: blue; font-size: 18px; }
        </style>
      </head>
      <body>
        <h2>DZ Orders - تفاصيل الطلب</h2>
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

  if (loading) return <Layout><div className="text-center text-gray-400 py-10">جاري التحميل...</div></Layout>
  if (!order) return <Layout><div className="text-center text-gray-400 py-10">الطلب غير موجود</div></Layout>

  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">تفاصيل الطلب</h2>
        <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusLabels[order.status]?.color}`}>
          {statusLabels[order.status]?.label}
        </span>
      </div>

      <div id="order-detail">
        {/* بيانات الزبون */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
          <p className="text-xs text-gray-400 mb-3">بيانات الزبون</p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">الاسم</span>
              <span className="text-sm font-medium text-gray-800">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">الهاتف</span>
              <span className="text-sm font-medium text-gray-800">{order.phone || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">الولاية</span>
              <span className="text-sm font-medium text-gray-800">{order.wilaya}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">البلدية</span>
              <span className="text-sm font-medium text-gray-800">{order.city || '—'}</span>
            </div>
          </div>
        </div>

        {/* بيانات الطلب */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
          <p className="text-xs text-gray-400 mb-3">بيانات الطلب</p>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">المنتج</span>
              <span className="text-sm font-medium text-gray-800">{order.product}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">السعر</span>
              <span className="text-sm font-medium text-gray-800">{order.price} دج</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">التوصيل</span>
              <span className="text-sm font-medium text-gray-800">{order.deliveryPrice} دج</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">الإجمالي</span>
              <span className="text-sm font-bold text-blue-600">{order.price + order.deliveryPrice} دج</span>
            </div>
            {order.notes && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">ملاحظات</span>
                <span className="text-sm text-gray-800">{order.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* تغيير الحالة */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 mb-4">
        <p className="text-xs text-gray-400 mb-3">تغيير الحالة</p>
        <div className="flex gap-2 flex-wrap">
          {statusFlow.map(s => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition
                ${order.status === s
                  ? statusLabels[s].color
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
            >
              {statusLabels[s].label}
            </button>
          ))}
          <button
            onClick={() => updateStatus('returned')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition
              ${order.status === 'returned'
                ? statusLabels.returned.color
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
          >
            رجع
          </button>
        </div>
      </div>

      {/* أزرار */}
      <div className="flex gap-3">
        <button
          onClick={openWhatsApp}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl text-sm font-medium transition"
        >
          واتساب 📱
        </button>
        <button
          onClick={generatePDF}
          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-500 py-3 rounded-xl text-sm font-medium transition"
        >
          PDF 📄
        </button>
        <button
          onClick={deleteOrder}
          className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 py-3 rounded-xl text-sm font-medium transition"
        >
          حذف 🗑️
        </button>
      </div>
    </Layout>
  )
}