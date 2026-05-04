const Order = require('../models/order.model');

// جلب كل الطلبات
exports.getOrders = async (req, res) => {
  try {
    const { status, wilaya } = req.query;
    const filter = { userId: req.user.id };

    if (status) filter.status = status;
    if (wilaya) filter.wilaya = wilaya;

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json(orders);

  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};

// جلب طلب واحد
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    res.status(200).json(order);

  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};

// إنشاء طلب جديد
exports.createOrder = async (req, res) => {
  try {
    const {
      customerName, phone, wilaya, city,
      product, price, deliveryPrice, notes
    } = req.body;

    const order = await Order.create({
      userId: req.user.id,
      customerName,
      phone,
      wilaya,
      city,
      product,
      price,
      deliveryPrice,
      notes
    });

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};

// تعديل طلب
exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    res.status(200).json(order);

  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};

// تغيير حالة الطلب فقط
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    res.status(200).json(order);

  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};

// حذف طلب
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    res.status(200).json({ message: 'تم حذف الطلب' });

  } catch (error) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};