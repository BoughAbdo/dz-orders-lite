const Order = require('../models/order.model');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const total = await Order.countDocuments({ userId });
    const newOrders = await Order.countDocuments({ userId, status: 'new' });
    const confirmed = await Order.countDocuments({ userId, status: 'confirmed' });
    const shipped = await Order.countDocuments({ userId, status: 'shipped' });
    const delivered = await Order.countDocuments({ userId, status: 'delivered' });
    const returned = await Order.countDocuments({ userId, status: 'returned' });

    // حساب المبيعات الإجمالية من الطلبات المسلّمة فقط
    const revenueResult = await Order.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(userId), status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$price' } } }
    ]);

    const revenue = revenueResult[0]?.total || 0;

    res.status(200).json({
      total,
      newOrders,
      confirmed,
      shipped,
      delivered,
      returned,
      revenue
    });

  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};