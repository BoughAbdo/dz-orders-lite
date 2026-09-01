// backend/src/utils/seedOrders.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const readline = require('readline');
const Order = require('../models/order.model');
const User = require('../models/user.model');

// تحميل متغيرات البيئة من مسار .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const sampleOrders = [
  {
    customerName: 'محمد أمين بلحاج',
    phone: '0550123456',
    wilaya: 'الجزائر',
    city: 'باب الزوار',
    deliveryType: 'home',
    product: 'حذاء رياضي أسود مقاس 42',
    price: 4800,
    deliveryPrice: 500,
    notes: 'الاتصال بعد الساعة 4 مساءً'
  },
  {
    customerName: 'سارة بوقرة',
    phone: '0661234567',
    wilaya: 'وهران',
    city: 'بئر الجير',
    deliveryType: 'desk',
    product: 'ساعة يد ذكية فلاش',
    price: 6200,
    deliveryPrice: 400,
    notes: 'استلام من مكتب الشحن'
  },
  {
    customerName: 'عبد الرؤوف بن ناصر',
    phone: '0770345678',
    wilaya: 'قسنطينة',
    city: 'الخروب',
    deliveryType: 'home',
    product: 'حقيبة ظهر جلدية فاخرة',
    price: 3500,
    deliveryPrice: 600,
    notes: 'يرجى التأكيد قبل الإرسال'
  },
  {
    customerName: 'ياسمين سلطاني',
    phone: '0558456789',
    wilaya: 'سطيف',
    city: 'العلمة',
    deliveryType: 'home',
    product: 'مكواة شعر احترافية سيراميك',
    price: 5400,
    deliveryPrice: 500,
    notes: 'تفضل التوصيل صباحاً'
  },
  {
    customerName: 'أسامة مرابط',
    phone: '0672567890',
    wilaya: 'البليدة',
    city: 'بوفاريك',
    deliveryType: 'desk',
    product: 'سترة شتوية مبطنة - بني L',
    price: 7800,
    deliveryPrice: 350,
    notes: 'StopDesk Blida'
  },
  {
    customerName: 'خديجة منصوري',
    phone: '0793678901',
    wilaya: 'عنابة',
    city: 'سيدي عمار',
    deliveryType: 'home',
    product: 'طقم أواني جرانيت 10 قطع',
    price: 12500,
    deliveryPrice: 700,
    notes: 'التأكد من سلامة التغليف'
  },
  {
    customerName: 'إسلام زروقي',
    phone: '0540789012',
    wilaya: 'باتنة',
    city: 'عين التوتة',
    deliveryType: 'home',
    product: 'سماعات رأس لاسلكية ANC',
    price: 4200,
    deliveryPrice: 600,
    notes: 'طلب تجربة السماعة'
  },
  {
    customerName: 'نورهان لعريبي',
    phone: '0669890123',
    wilaya: 'تلمسان',
    city: 'المنصورة',
    deliveryType: 'desk',
    product: 'فستان صيفي مطرز - أزرق M',
    price: 3900,
    deliveryPrice: 400,
    notes: 'استلام من مكتب تلمسان'
  },
  {
    customerName: 'أيوب بوستة',
    phone: '0775901234',
    wilaya: 'بجاية',
    city: 'أقبو',
    deliveryType: 'home',
    product: 'ماكينة حلاقة متعددة الاستخدامات',
    price: 2900,
    deliveryPrice: 600,
    notes: 'الدفع عند الاستلام'
  },
  {
    customerName: 'عبد الحق قادري',
    phone: '0554012345',
    wilaya: 'المسيلة',
    city: 'بوسعادة',
    deliveryType: 'home',
    product: 'عطر رجالي فاخر 100 مل',
    price: 4500,
    deliveryPrice: 600,
    notes: 'ملاحظة خاصة بالتوصيل'
  },
  {
    customerName: 'حمزة براهيمي',
    phone: '0560124578',
    wilaya: 'مستغانم',
    city: 'عين تادلس',
    deliveryType: 'desk',
    product: 'نظارة شمسية بولارايزد إيطالية',
    price: 3200,
    deliveryPrice: 350,
    notes: 'استلام StopDesk'
  },
  {
    customerName: 'إيمان شريف',
    phone: '0671458923',
    wilaya: 'تيزي وزو',
    city: 'ذراع بن خدة',
    deliveryType: 'home',
    product: 'ماكينة صنع القهوة إسبريسو',
    price: 8900,
    deliveryPrice: 500,
    notes: 'الرجاء الاتصال قبل المجيء بساعة'
  },
  {
    customerName: 'وليد معاش',
    phone: '0778965412',
    wilaya: 'برج بوعريريج',
    city: 'رأس الوادي',
    deliveryType: 'home',
    product: 'طقم أدوات صيانة 108 قطع',
    price: 6800,
    deliveryPrice: 600,
    notes: 'توصيل للمحل التجاري'
  },
  {
    customerName: 'رانيا دراجي',
    phone: '0556321478',
    wilaya: 'سكيكدة',
    city: 'القل',
    deliveryType: 'desk',
    product: 'حقيبة يد نسائية كلاسيكية سوداء',
    price: 4100,
    deliveryPrice: 400,
    notes: 'مكتب الشحن المركزي'
  },
  {
    customerName: 'بلال سعيدي',
    phone: '0665897412',
    wilaya: 'الشلف',
    city: 'وادي الفضة',
    deliveryType: 'home',
    product: 'شاحن لاسلكي سريع 3 في 1',
    price: 3600,
    deliveryPrice: 500,
    notes: 'التسليم في الفترة المسائية'
  },
  {
    customerName: 'وفاء بلعربي',
    phone: '0799654123',
    wilaya: 'المدية',
    city: 'البرواقية',
    deliveryType: 'home',
    product: 'خلاط كهربائي ستانلس ستيل',
    price: 5200,
    deliveryPrice: 500,
    notes: 'التأكد من تجربة الجهاز'
  },
  {
    customerName: 'صابر قواسمي',
    phone: '0541239874',
    wilaya: 'جيجل',
    city: 'الميلية',
    deliveryType: 'desk',
    product: 'حذاء كلاسيكي بني جلد طبيعي',
    price: 6500,
    deliveryPrice: 400,
    notes: 'استلام من مكتب ZR'
  },
  {
    customerName: 'مروى عثماني',
    phone: '0658741230',
    wilaya: 'الوادي',
    city: 'جامعة',
    deliveryType: 'home',
    product: 'جهاز تنظيف الوجه بالأمواج فوق الصوتية',
    price: 3800,
    deliveryPrice: 700,
    notes: 'يرجى تغليف المنتج جيداً'
  },
  {
    customerName: 'رياض غانم',
    phone: '0771236547',
    wilaya: 'سيدي بلعباس',
    city: 'تلاغ',
    deliveryType: 'home',
    product: 'لوحة مفاتيح ميكانيكية مضيئة RGB',
    price: 4900,
    deliveryPrice: 600,
    notes: 'طلب مؤكد ومستعجل'
  },
  {
    customerName: 'حنان دحماني',
    phone: '0559874125',
    wilaya: 'تيبازة',
    city: 'القليعة',
    deliveryType: 'desk',
    product: 'طقم بيجامة قطن شتوي 3 قطع',
    price: 4400,
    deliveryPrice: 350,
    notes: 'StopDesk Koléa'
  }
];

const askQuestion = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
};

const seedOrders = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('لم يتم العثور على متغير الاتصال MONGODB_URI في ملف .env');
    }

    // التأكد من التوجيه لقاعدة البيانات الصحيحة إذا لم تكن محددة
    if (mongoUri.includes('.mongodb.net/') && !mongoUri.includes('.mongodb.net/dz-orders')) {
      mongoUri = mongoUri.replace('.mongodb.net/', '.mongodb.net/dz-orders');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح\n');

    const users = await User.find({}, 'name email businessName').lean();

    if (!users || users.length === 0) {
      console.error('❌ لا يوجد أي مستخدم في قاعدة البيانات.');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log('📋 الحسابات المتاحة في قاعدة البيانات:');
    users.forEach((u, index) => {
      console.log(`  [${index + 1}] المتجر: ${u.businessName || 'بدون اسم'} | الاسم: ${u.name || '-'} | البريد: ${u.email}`);
    });

    const answer = await askQuestion('\n👉 أدخل رقم الحساب الذي تريد إضافة الـ 20 طلباً إليه: ');
    const selectedIndex = parseInt(answer.trim(), 10) - 1;

    if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= users.length) {
      console.error('❌ اختيار غير صالح.');
      await mongoose.disconnect();
      process.exit(1);
    }

    const targetUser = users[selectedIndex];
    console.log(`\n⏳ جاري إضافة 20 طلباً لحساب: ${targetUser.businessName || targetUser.name} (${targetUser.email})...`);

    const ordersToInsert = sampleOrders.map(order => ({
      ...order,
      userId: targetUser._id,
      status: 'new'
    }));

    await Order.insertMany(ordersToInsert);

    console.log(`🎉 تم بنجاح إدخال 20 طلباً جديداً في حساب: ${targetUser.businessName || targetUser.email}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ أثناء تنفيذ السكريبت:', error);
    process.exit(1);
  }
};

seedOrders();