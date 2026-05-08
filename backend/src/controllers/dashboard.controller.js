const mongoose = require('mongoose');
const Order = require('../models/order.model');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const total = await Order.countDocuments({ userId });
    const newOrders = await Order.countDocuments({ userId, status: 'new' });
    const confirmed = await Order.countDocuments({ userId, status: 'confirmed' });
    const shipped = await Order.countDocuments({ userId, status: 'shipped' });
    const delivered = await Order.countDocuments({ userId, status: 'delivered' });
    const returned = await Order.countDocuments({ userId, status: 'returned' });

    // حساب المبيعات من سعر المنتج فقط للطلبات المسلّمة
    const revenueResult = await Order.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: 'delivered'
        }
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: { $ifNull: ['$price', 0] }
          }
        }
      }
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
    res.status(500).json({
      message: 'خطأ في السيرفر',
      error: error.message
    });
  }
};