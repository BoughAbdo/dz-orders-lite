// backend/src/controllers/dashboard.controller.js
const mongoose = require('mongoose');
const Order = require('../models/order.model');
const Product = require('../models/product.model');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    // بداية اليوم
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // بداية الأسبوع - الاثنين
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    startOfWeek.setDate(startOfWeek.getDate() - diffToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    // نطاق آخر 7 أيام
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const attentionFilter = {
      userId: userObjectId,
      $or: [
        { status: 'new', createdAt: { $lte: oneDayAgo } },
        { status: 'confirmed', createdAt: { $lte: oneDayAgo } },
        { status: 'shipped', createdAt: { $lte: twoDaysAgo } },
      ],
    };

    const [
      total,
      newOrders,
      confirmed,
      shipped,
      delivered,
      returned,
      revenueResult,
      todayOrders,
      todayRevenueResult,
      weekOrders,
      weekRevenueResult,
      attentionCount,
      attentionOrdersRaw,
      topWilayasRaw,
      topProductsRaw,
      recent7DaysRaw,
      products,
      deliveredOrders,
    ] = await Promise.all([
      Order.countDocuments({ userId }),
      Order.countDocuments({ userId, status: 'new' }),
      Order.countDocuments({ userId, status: 'confirmed' }),
      Order.countDocuments({ userId, status: 'shipped' }),
      Order.countDocuments({ userId, status: 'delivered' }),
      Order.countDocuments({ userId, status: 'returned' }),

      // إجمالي المبيعات من الطلبات المسلّمة
      Order.aggregate([
        { $match: { userId: userObjectId, status: 'delivered' } },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$price', 0] } } } },
      ]),

      // طلبات اليوم
      Order.countDocuments({ userId, createdAt: { $gte: startOfToday } }),

      // مبيعات اليوم من المسلّمة
      Order.aggregate([
        {
          $match: {
            userId: userObjectId,
            status: 'delivered',
            createdAt: { $gte: startOfToday },
          },
        },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$price', 0] } } } },
      ]),

      // طلبات هذا الأسبوع
      Order.countDocuments({ userId, createdAt: { $gte: startOfWeek } }),

      // مبيعات هذا الأسبوع من المسلّمة
      Order.aggregate([
        {
          $match: {
            userId: userObjectId,
            status: 'delivered',
            createdAt: { $gte: startOfWeek },
          },
        },
        { $group: { _id: null, total: { $sum: { $ifNull: ['$price', 0] } } } },
      ]),

      Order.countDocuments(attentionFilter),

      Order.find(attentionFilter)
        .sort({ createdAt: 1 })
        .limit(5)
        .select('customerName phone wilaya product status createdAt'),

      // أفضل 4 ولايات طلباً
      Order.aggregate([
        { $match: { userId: userObjectId } },
        { $group: { _id: '$wilaya', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 4 },
      ]),

      // أفضل 4 منتجات طلباً ومبيعاً
      Order.aggregate([
        { $match: { userId: userObjectId } },
        {
          $group: {
            _id: '$product',
            count: { $sum: 1 },
            totalAmount: { $sum: '$price' },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 4 },
      ]),

      // تدفق الأيام السبعة السابقة
      Order.aggregate([
        { $match: { userId: userObjectId, createdAt: { $gte: sevenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            ordersCount: { $sum: 1 },
            revenue: {
              $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$price', 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // جلب تكاليف المنتجات لحساب صافي الربح
      Product.find({ userId }).select('name costPrice').lean(),

      // جلب أسماء وأسعار الطلبات المسلّمة
      Order.find({ userId, status: 'delivered' }).select('product price').lean(),
    ]);

    const getReason = (order) => {
      if (order.status === 'new') return 'طلب جديد لم يتم تأكيده منذ أكثر من 24 ساعة';
      if (order.status === 'confirmed') return 'طلب مؤكد لم ينتقل للتوصيل منذ أكثر من 24 ساعة';
      if (order.status === 'shipped') return 'طلب قيد التوصيل منذ أكثر من يومين';
      return 'طلب يحتاج متابعة';
    };

    const attentionOrders = attentionOrdersRaw.map((order) => ({
      _id: order._id,
      customerName: order.customerName,
      phone: order.phone,
      wilaya: order.wilaya,
      product: order.product,
      status: order.status,
      createdAt: order.createdAt,
      reason: getReason(order),
    }));

    const revenue = revenueResult[0]?.total || 0;
    const todayRevenue = todayRevenueResult[0]?.total || 0;
    const weekRevenue = weekRevenueResult[0]?.total || 0;

    const finalizedCount = delivered + returned;
    const deliveryRate = finalizedCount > 0
      ? Number(((delivered / finalizedCount) * 100).toFixed(1))
      : 0;

    const returnRate = finalizedCount > 0
      ? Number(((returned / finalizedCount) * 100).toFixed(1))
      : 0;

    // حساب صافي الأرباح التقديرية
    const productCostMap = {};
    products.forEach((p) => {
      if (p.costPrice > 0 && p.name) {
        productCostMap[p.name.trim().toLowerCase()] = p.costPrice;
      }
    });

    let totalDeliveredCost = 0;
    deliveredOrders.forEach((o) => {
      const orderProd = (o.product || '').toLowerCase();
      const matchedKey = Object.keys(productCostMap).find((k) => orderProd.includes(k));
      if (matchedKey) {
        totalDeliveredCost += productCostMap[matchedKey];
      }
    });

    const netProfit = Math.max(0, revenue - totalDeliveredCost);

    const topWilayas = topWilayasRaw.map((w) => ({
      wilaya: w._id || 'غير محدد',
      count: w.count,
      percentage: total > 0 ? Math.round((w.count / total) * 100) : 0,
    }));

    const topProducts = topProductsRaw.map((p) => ({
      name: p._id || 'منتج غير محدد',
      count: p.count,
      totalAmount: p.totalAmount,
    }));

    // معالجة بيانات الأيام السبعة لتشمل الأيام الصفرية دون انقطاع زمني
    const daysMap = {};
    recent7DaysRaw.forEach((d) => {
      daysMap[d._id] = d;
    });

    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const found = daysMap[dateKey];
      last7Days.push({
        date: dateKey,
        dayName: dayNames[d.getDay()],
        ordersCount: found ? found.ordersCount : 0,
        revenue: found ? found.revenue : 0,
      });
    }

    res.status(200).json({
      total,
      newOrders,
      confirmed,
      shipped,
      delivered,
      returned,
      revenue,
      netProfit,
      deliveryRate,
      returnRate,
      todayOrders,
      todayRevenue,
      weekOrders,
      weekRevenue,
      attentionCount,
      attentionOrders,
      topWilayas,
      topProducts,
      last7Days,
    });
  } catch (error) {
    console.error('Dashboard Controller Error:', error);
    res.status(500).json({
      message: 'خطأ في السيرفر',
      error: error.message,
    });
  }
};