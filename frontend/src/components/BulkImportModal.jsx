// frontend/src/components/BulkImportModal.jsx
import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import api from '../services/api'
import {
  FiUploadCloud,
  FiFileText,
  FiDownload,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiCheck,
  FiRefreshCw,
} from 'react-icons/fi'

export default function BulkImportModal({ isOpen, onClose, onSuccess }) {
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [parsedOrders, setParsedOrders] = useState([])
  const [parseErrors, setParseErrors] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  if (!isOpen) return null

  // تنزيل قالب إكسل استرشادي جاهز
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'اسم الزبون': 'محمد لمين',
        'الهاتف': '0550123456',
        'الولاية': 'الجزائر',
        'البلدية': 'باب الزوار',
        'المنتج': 'حذاء كلاسيكي جلد - مقاس 42',
        'السعر': 4800,
        'سعر التوصيل': 600,
        'نوع التوصيل': 'منزل',
        'ملاحظات': 'الاتصال قبل التوصيل',
      },
      {
        'اسم الزبون': 'سميرة علام',
        'الهاتف': '0661987654',
        'الولاية': 'وهران',
        'البلدية': 'السانية',
        'المنتج': 'بدلة رياضية - رمادي',
        'السعر': 6500,
        'سعر التوصيل': 400,
        'نوع التوصيل': 'مكتب',
        'ملاحظات': 'استلام المساء',
      },
    ]

    const worksheet = XLSX.utils.json_to_sheet(templateData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'نموذج الطلبات')
    XLSX.writeFile(workbook, 'نموذج_طلبيات_استيراد.xlsx')
  }

  // التعرف الذكي على الأعمدة
  const extractFieldValue = (row, possibleKeys) => {
    const rowKeys = Object.keys(row)
    for (const key of possibleKeys) {
      const matchedKey = rowKeys.find(
        (k) => k.trim().toLowerCase() === key.toLowerCase()
      )
      if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
        return row[matchedKey]
      }
    }
    return ''
  }

  // قراءة وتحليل ملف الإكسل
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    setErrorMessage(null)
    setParseErrors([])
    setParsedOrders([])

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws, { defval: '' })

        if (!data || data.length === 0) {
          setErrorMessage('الملف المرفوع فارغ أو لا يحتوي على صفوف بيانات صالحة.')
          return
        }

        const ordersList = []
        const errorsList = []

        data.forEach((row, idx) => {
          const rowNum = idx + 2 // اعتبار أن الصف 1 هو الترويسة

          const customerName = String(
            extractFieldValue(row, ['اسم الزبون', 'الاسم', 'الزبون', 'name', 'client', 'customer'])
          ).trim()

          const phone = String(
            extractFieldValue(row, ['الهاتف', 'رقم الهاتف', 'الهاتف المحمول', 'phone', 'tel', 'mobile'])
          ).replace(/\D/g, '').trim()

          const wilaya = String(
            extractFieldValue(row, ['الولاية', 'ولاية', 'wilaya', 'province', 'state'])
          ).trim()

          const city = String(
            extractFieldValue(row, ['البلدية', 'بلدية', 'المدينة', 'commune', 'city', 'daira'])
          ).trim()

          const product = String(
            extractFieldValue(row, ['المنتج', 'السلعة', 'اسم المنتج', 'product', 'item', 'designation'])
          ).trim()

          const priceRaw = extractFieldValue(row, ['السعر', 'سعر السلعة', 'المبلغ', 'price', 'total', 'montant'])
          const price = Number(priceRaw)

          const deliveryPriceRaw = extractFieldValue(row, ['سعر التوصيل', 'التوصيل', 'الشحن', 'delivery', 'livraison'])
          const deliveryPrice = deliveryPriceRaw !== '' ? Number(deliveryPriceRaw) : 600

          const deliveryTypeRaw = String(
            extractFieldValue(row, ['نوع التوصيل', 'التوصيل ل', 'type', 'delivery_type'])
          ).toLowerCase()

          const deliveryType = deliveryTypeRaw.includes('مكتب') || deliveryTypeRaw.includes('desk') || deliveryTypeRaw.includes('stop')
            ? 'desk'
            : 'home'

          const notes = String(
            extractFieldValue(row, ['ملاحظات', 'ملاحظة', 'notes', 'remarque', 'observation'])
          ).trim()

          // فحص الحقول الإجبارية
          if (!customerName || !phone || !wilaya || !city || !product || Number.isNaN(price) || price <= 0) {
            errorsList.push(`السطر ${rowNum}: بيانات غير مكتملة (تأكد من الاسم، الهاتف، الولاية، المنتج، والسعر).`)
            return
          }

          ordersList.push({
            customerName,
            phone,
            wilaya,
            city,
            product,
            price,
            deliveryPrice: Number.isNaN(deliveryPrice) ? 600 : deliveryPrice,
            deliveryType,
            notes,
          })
        })

        setParsedOrders(ordersList)
        setParseErrors(errorsList)

        if (ordersList.length === 0 && errorsList.length > 0) {
          setErrorMessage('لم يتم العثور على أي طلبات صالحة في الملف، راجع تنسيق الأعمدة.')
        }
      } catch (err) {
        console.error(err)
        setErrorMessage('تعذر قراءة ملف الإكسل، تأكد من سلامة صيفة الملف (.xlsx أو .csv).')
      }
    }

    reader.readAsBinaryString(uploadedFile)
  }

  // إرسال الطلبات إلى السيرفر
  const handleConfirmImport = async () => {
    if (parsedOrders.length === 0) return

    setLoading(true)
    setErrorMessage(null)

    try {
      const res = await api.post('/orders/bulk', { orders: parsedOrders })
      onSuccess?.(res.data)
      onClose()
    } catch (err) {
      console.error(err)
      setErrorMessage(err.response?.data?.message || 'تعذر إتمام الاستيراد الجماعي.')
    } finally {
      setLoading(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setParsedOrders([])
    setParseErrors([])
    setErrorMessage(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <FiUploadCloud size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900">استيراد الطلبات الجماعي</h3>
                <p className="text-xs font-semibold text-slate-400">من ملفات Excel أو Google Sheets</p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition"
            >
              <FiX size={18} />
            </button>
          </div>

          {/* تنزيل النموذج الإرشادي */}
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-100 p-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <FiFileText size={16} className="text-blue-600" />
              <span>هل تريد نموذجاً جاهزاً للعمل عليه؟</span>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition shadow-sm"
            >
              <FiDownload size={13} />
              <span>تحميل النموذج (.xlsx)</span>
            </button>
          </div>

          {/* منطقة الرفع */}
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-8 text-center cursor-pointer transition hover:border-blue-400 hover:bg-blue-50/30"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm border border-slate-100">
                <FiUploadCloud size={28} />
              </div>
              <p className="text-sm font-black text-slate-800">انقر هنا لاختيار ملف الإكسل</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">يدعم صيغ .xlsx و .xls و .csv (حتى 500 طلب)</p>
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/40 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FiFileText size={20} className="text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-black text-slate-800 truncate">{file.name}</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                      {(file.size / 1024).toFixed(1)} كيلوبايت
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetUpload}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 transition"
                  title="إلغاء الملف"
                >
                  <FiX size={16} />
                </button>
              </div>

              {/* نتائج الفحص الفوري */}
              <div className="mt-3.5 pt-3 border-t border-blue-100/60 flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-xl">
                  <FiCheckCircle size={14} />
                  <span>{parsedOrders.length} طلبية جاهزة للاستيراد</span>
                </div>

                {parseErrors.length > 0 && (
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-xl">
                    <FiAlertCircle size={14} />
                    <span>تم استبعاد {parseErrors.length} صف غير مكتمل</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* تنبيهات الخطأ إن وجدت */}
          {errorMessage && (
            <div className="mt-3 rounded-2xl bg-red-50 border border-red-200 p-3 text-xs font-bold text-red-700 flex items-center gap-2">
              <FiAlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* عينة من الأخطاء المستبعدة إن وُجدت */}
          {parseErrors.length > 0 && (
            <div className="mt-3 max-h-24 overflow-y-auto rounded-xl bg-slate-50 p-2.5 text-[11px] font-medium text-slate-600 border border-slate-100">
              <p className="font-bold text-amber-700 mb-1">الصفوف المستبعدة:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {parseErrors.slice(0, 3).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* أزرار الحفظ والإغلاق */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-100 transition"
          >
            إلغاء
          </button>

          <button
            type="button"
            disabled={loading || parsedOrders.length === 0}
            onClick={handleConfirmImport}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-50 transition active:scale-95"
          >
            {loading ? (
              <>
                <FiRefreshCw size={15} className="animate-spin" />
                <span>جاري الاستيراد...</span>
              </>
            ) : (
              <>
                <FiCheck size={16} />
                <span>تأكيد استيراد {parsedOrders.length} طلبية</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}