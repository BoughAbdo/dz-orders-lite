// frontend/src/pages/Landing.jsx
import { Link, Navigate } from 'react-router-dom'
import {
  FiArrowLeft,
  FiBarChart2,
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiMessageCircle,
  FiPackage,
  FiSettings,
  FiShoppingBag,
  FiTruck,
} from 'react-icons/fi'

const features = [
  {
    icon: FiPackage,
    title: 'إدارة الطلبات',
    description: 'أضف الطلبات، تابع حالتها، وابحث عنها بسهولة.',
  },
  {
    icon: FiMessageCircle,
    title: 'رسائل واتساب جاهزة',
    description: 'راسل الزبائن بسرعة بقوالب قابلة للتعديل.',
  },
  {
    icon: FiFileText,
    title: 'طباعة وصل PDF',
    description: 'اطبع تفاصيل الطلب باسم متجرك ورقم هاتفك.',
  },
  {
    icon: FiBarChart2,
    title: 'إحصائيات واضحة',
    description: 'تابع الطلبات والمبيعات اليومية والأسبوعية.',
  },
  {
    icon: FiDownload,
    title: 'تصدير CSV',
    description: 'حمّل قائمة الطلبات لاستعمالها في Excel أو Google Sheets.',
  },
  {
    icon: FiSettings,
    title: 'إعدادات المتجر',
    description: 'عدّل اسم المتجر، الهاتف، وقوالب الرسائل.',
  },
]

const steps = [
  'أنشئ حسابك',
  'أضف طلبات متجرك',
  'تابع الحالة وراسل الزبائن',
]

export default function Landing() {
  const token = localStorage.getItem('token')

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      dir="rtl"
    >
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <FiShoppingBag size={22} />
            </div>

            <div>
              <h1 className="text-xl font-black text-slate-900">
                طلبيات
              </h1>
              <p className="text-xs font-bold text-slate-400">
                إدارة طلبات المتاجر
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-2xl px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100"
            >
              تسجيل الدخول
            </Link>

            <Link
              to="/register"
              className="hidden rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-extrabold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 sm:inline-flex"
            >
              ابدأ الآن
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-600">
              <FiCheckCircle size={16} />
              نسخة تجريبية للمتاجر في الجزائر
            </div>

            <h2 className="text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
              نظم طلبات متجرك
              <span className="mt-2 block text-blue-600">
                بسهولة وسرعة
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base font-medium leading-8 text-slate-500 sm:text-lg">
              طلبيات يساعدك على إضافة الطلبات، متابعة حالتها، إرسال رسائل واتساب
              للزبائن، طباعة وصل الطلب، ومراقبة مبيعاتك من لوحة واحدة.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-black text-white shadow-xl shadow-blue-600/25 transition hover:bg-blue-700 active:scale-[0.99]"
              >
                ابدأ الآن مجانًا
                <FiArrowLeft size={18} />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-[0.99]"
              >
                لدي حساب بالفعل
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-sm font-black text-blue-600">
                    {index + 1}
                  </div>
                  <p className="text-sm font-extrabold text-slate-700">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Card */}
          <div className="relative">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-blue-200/50 blur-3xl" />
            <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-emerald-200/50 blur-3xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-5 shadow-2xl shadow-slate-300/50">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    لوحة التحكم
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    نظرة سريعة على أداء المتجر
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <FiBarChart2 size={21} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-3xl bg-blue-50 p-4">
                  <p className="text-xs font-bold text-blue-500">
                    إجمالي الطلبات
                  </p>
                  <p className="mt-2 text-2xl font-black text-blue-700">
                    128
                  </p>
                </div>

                <div className="rounded-3xl bg-emerald-50 p-4">
                  <p className="text-xs font-bold text-emerald-500">
                    المبيعات
                  </p>
                  <p className="mt-2 text-2xl font-black text-emerald-700">
                    86,500 دج
                  </p>
                </div>

                <div className="rounded-3xl bg-amber-50 p-4">
                  <p className="text-xs font-bold text-amber-500">
                    قيد التوصيل
                  </p>
                  <p className="mt-2 text-2xl font-black text-amber-700">
                    17
                  </p>
                </div>

                <div className="rounded-3xl bg-red-50 p-4">
                  <p className="text-xs font-bold text-red-500">
                    طلبات تحتاج متابعة
                  </p>
                  <p className="mt-2 text-2xl font-black text-red-700">
                    5
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-black text-slate-800">
                    آخر طلب
                  </p>

                  <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-black text-amber-600">
                    قيد التوصيل
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                    <FiTruck size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-black text-slate-800">
                      أحمد بن علي
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-400">
                      سماعات بلوتوث - الجزائر
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-slate-100 bg-white py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h3 className="text-2xl font-black text-slate-950">
                كل ما تحتاجه لمتابعة طلباتك
              </h3>

              <p className="mt-3 text-sm font-medium text-slate-500">
                واجهة عربية بسيطة مصممة لمتاجر البيع عبر الإنترنت.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(feature => {
                const Icon = feature.icon

                return (
                  <div
                    key={feature.title}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-5 transition hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-slate-200/70"
                  >
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                      <Icon size={22} />
                    </div>

                    <h4 className="text-base font-black text-slate-900">
                      {feature.title}
                    </h4>

                    <p className="mt-2 text-sm font-medium leading-7 text-slate-500">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-[2rem] bg-blue-600 p-8 text-center text-white shadow-2xl shadow-blue-600/25">
            <h3 className="text-2xl font-black">
              جاهز لتنظيم طلبات متجرك؟
            </h3>

            <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-7 text-blue-100">
              أنشئ حسابك وابدأ بتجربة طلبيات على طلباتك اليومية.
            </p>

            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-blue-600 transition hover:bg-blue-50"
              >
                إنشاء حساب
                <FiArrowLeft size={18} />
              </Link>

              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 bg-white px-4 py-6 text-center text-xs font-bold text-slate-400">
        © 2025 طلبيات — جميع الحقوق محفوظة
      </footer>
    </div>
  )
}