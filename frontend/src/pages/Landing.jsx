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
  FiShoppingBag,
  FiTruck,
  FiUploadCloud,
  FiZap,
  FiShield,
} from 'react-icons/fi'

const features = [
  {
    icon: FiTruck,
    title: 'تصدير كشوفات الشحن (Yalidine & ZR)',
    description: 'صدّر ملفات إكسل مجهزة مباشرة للرفع في حسابات شركات التوصيل دون الحاجة لإدخال الطرود يدوياً.',
    highlight: 'جديد',
  },
  {
    icon: FiMessageCircle,
    title: 'رسائل واتساب التأكيد التلقائية',
    description: 'راسل زبائنك بضغطة زر بقوالب متغيرة لاسم الزبون والمقاس والسعر لتقليل نسبة الطرود الراجعة (Retour).',
    highlight: 'تقليل الـ Retour',
  },
  {
    icon: FiUploadCloud,
    title: 'استيراد جماعي عبر Excel',
    description: 'ارفع قائمة طلبياتك من Google Sheets أو ملفات الإكسل اليومية بنقرة واحدة لتوفير ساعات من العمل.',
  },
  {
    icon: FiFileText,
    title: 'طباعة بوليصات الشحن PDF',
    description: 'توليد وصلات شحن احترافية تحمل اسم متجرك ورقمك ومعلومات التوصيل جاهزة للطباعة واللصق على الطرد.',
  },
  {
    icon: FiBarChart2,
    title: 'حساب الأرباح والمبيعات الصافية',
    description: 'لوحة تحكم ذكية تفصل سعر التوصيل وتحسب صافي أرباحك الحقيقية من الطلبيات المسلّمة فقط.',
  },
  {
    icon: FiPackage,
    title: 'إدارة متكاملة لـ 58 ولاية',
    description: 'تغطية شاملة لكل بلديات وولايات الوطن مع تمييز دقيق بين توصيل المنزل (Domicile) والتوصيل للمكتب (Stop Desk).',
  },
]

const steps = [
  { num: '01', title: 'أنشئ حسابك التجريبي', desc: 'تفعيل فوري بالبريد الإلكتروني دون الحاجة لبطاقة بنكية.' },
  { num: '02', title: 'سجل الطلبات أو استوردها', desc: 'أدخل طلبيات الملابس والأحذية في ثوانٍ أو ارفع ملف إكسل.' },
  { num: '03', title: 'أكّد واطبع وصدّر للشحن', desc: 'راسل بالواتساب، اطبع الوصلات، وجهّز كشف شركة التوصيل.' },
]

export default function Landing() {
  const token = localStorage.getItem('token')

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-100/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-lg shadow-blue-600/25 transition group-hover:scale-105">
              <FiShoppingBag size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-slate-950 tracking-tight">طلبيات</span>
                <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-black text-blue-600">DZ</span>
              </div>
              <p className="text-[11px] font-bold text-slate-400">إدارة طلبات التجارة الإلكترونية</p>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              to="/login"
              className="rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-extrabold text-slate-700 transition hover:bg-slate-100 active:scale-95"
            >
              تسجيل الدخول
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-md shadow-blue-600/25 transition hover:bg-blue-700 active:scale-95"
            >
              <span>ابدأ مجاناً</span>
              <FiArrowLeft size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-10 pb-16 sm:py-20">
          <div className="absolute top-1/2 right-1/2 -z-10 h-96 w-96 -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-400/10 blur-[120px]" />
          
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-7 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50/80 px-4 py-1.5 text-xs sm:text-sm font-black text-blue-700 mb-6 shadow-2xs">
                <FiZap className="text-amber-500" size={15} />
                <span>المنصة الأولى المخصصة للمتاجر المحلية في الجزائر 🇩🇿</span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.18] tracking-tight text-slate-950">
                وداعاً لفوضى الكراس والإكسل.
                <span className="block mt-2 bg-gradient-to-l from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  نظّم طلبياتك وارفع أرباحك
                </span>
              </h2>

              <p className="mt-5 max-w-2xl mx-auto lg:mx-0 text-sm sm:text-base font-medium leading-8 text-slate-600">
                منصة خفيفة وسريعة مصممة خصيصاً لتجار الملابس، الأحذية، والمتاجر المحلية.
                إدخال فوري للطلبات، رسائل واتساب لتأكيد المقاسات وتخفيض الرجوع (Retour)، وطباعة وتصدير مباشر لكشوفات <span className="font-bold text-slate-900">Yalidine & ZR Express</span>.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-blue-600 px-7 py-4 text-sm sm:text-base font-black text-white shadow-xl shadow-blue-600/30 transition hover:bg-blue-700 active:scale-95"
                >
                  <span>جرب المنصة الآن مجاناً</span>
                  <FiArrowLeft size={18} />
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm sm:text-base font-black text-slate-800 shadow-sm transition hover:bg-slate-50 active:scale-95"
                >
                  <span>معاينة بحساب تجريبي</span>
                </Link>
              </div>

              {/* مؤشرات المصداقية */}
              <div className="mt-8 pt-8 border-t border-slate-200/60 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-right">
                <div>
                  <p className="text-xl sm:text-2xl font-black text-slate-950">58</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">ولاية وبلدية مدعومة</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-emerald-600">-40%</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">تخفيض نسبة الـ Retour</p>
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-black text-blue-600">10 ثوانٍ</p>
                  <p className="text-[11px] font-bold text-slate-400 mt-0.5">لتسجيل وتأكيد الطلبية</p>
                </div>
              </div>
            </div>

            {/* Preview Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xl shadow-blue-900/10">
                {/* شريط محاكاة النافذة */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400">talabiyat.app/dashboard</span>
                </div>

                {/* كروت المحاكاة السريعة */}
                <div className="grid grid-cols-2 gap-2.5 mb-3">
                  <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-3.5">
                    <span className="text-[11px] font-bold text-blue-600 block">إجمالي المبيعات</span>
                    <span className="text-lg font-black text-blue-950 block mt-1">128,400 دج</span>
                  </div>
                  <div className="rounded-2xl bg-emerald-50/70 border border-emerald-100 p-3.5">
                    <span className="text-[11px] font-bold text-emerald-600 block">نسبة التسليم</span>
                    <span className="text-lg font-black text-emerald-950 block mt-1">84.2%</span>
                  </div>
                </div>

                {/* محاكاة بطاقة طلب حقيقي */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">سارة قاسم (وهران)</span>
                    <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-black">مؤكدة للتوصيل</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500">حذاء رياضي أنيق - مقاس 38</p>
                  
                  <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs font-black">
                    <span className="text-slate-400 text-[10px]">الإجمالي مع التوصيل:</span>
                    <span className="text-slate-900">4,800 دج</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex-1 rounded-xl bg-emerald-600 text-white text-center py-2 text-xs font-black shadow-sm flex items-center justify-center gap-1">
                    <FiMessageCircle size={14} />
                    <span>تأكيد واتساب</span>
                  </div>
                  <div className="flex-1 rounded-xl bg-slate-900 text-white text-center py-2 text-xs font-black shadow-sm flex items-center justify-center gap-1">
                    <FiDownload size={14} />
                    <span>تصدير Yalidine</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-slate-100 bg-white py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center max-w-2xl mx-auto">
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest block mb-2">مميزات عملية 100%</span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950">
                كل ما يحتاجه التاجر الجزائري في مكان واحد
              </h3>
              <p className="mt-3 text-sm font-medium leading-7 text-slate-500">
                صممنا المنصة بناءً على التحديات الحقيقية للتجارة عبر إنستغرام وفيسبوك في السوق المحلي.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className="relative rounded-3xl border border-slate-100 bg-slate-50/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/50"
                  >
                    {feature.highlight && (
                      <span className="absolute top-4 left-4 rounded-full bg-blue-100 text-blue-700 px-2.5 py-0.5 text-[10px] font-black">
                        {feature.highlight}
                      </span>
                    )}
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                      <Icon size={22} />
                    </div>
                    <h4 className="text-base font-black text-slate-900 mb-2">{feature.title}</h4>
                    <p className="text-xs sm:text-sm font-medium leading-6 text-slate-500">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-950">كيف تبدأ في 3 خطوات بسيطة؟</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {steps.map((st) => (
                <div key={st.num} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                  <span className="text-3xl font-black text-blue-600 block mb-3 font-mono">{st.num}</span>
                  <h4 className="text-base font-black text-slate-900 mb-1.5">{st.title}</h4>
                  <p className="text-xs sm:text-sm font-medium leading-6 text-slate-500">{st.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-[2.5rem] bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-8 sm:p-12 text-center text-white shadow-2xl shadow-blue-600/30">
            <h3 className="text-2xl sm:text-3xl font-black">جاهز لتحويل متجرك إلى نظام احترافي؟</h3>
            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm font-medium leading-7 text-blue-100">
              ابدأ تجربتك المجانية الكاملة اليوم. لا توجد أي بطاقات دفع مطلوبة، وجرّب بنفسك سهولة تنظيم طلبياتك.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 text-sm font-black text-blue-700 transition hover:bg-blue-50 active:scale-95 shadow-lg shadow-black/10"
              >
                <span>إنشاء حساب مجاني</span>
                <FiArrowLeft size={16} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-4 text-sm font-black text-white transition hover:bg-white/10 active:scale-95"
              >
                تسجيل الدخول
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white px-4 py-6 text-center text-xs font-bold text-slate-400">
        © 2026 طلبيات — منصة إدارة طلبات المتاجر الإلكترونية في الجزائر. جميع الحقوق محفوظة.
      </footer>
    </div>
  )
}