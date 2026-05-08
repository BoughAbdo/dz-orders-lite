// controllers/order.controller.js
const Order = require('../models/order.model');

const validateOrderData = (data) => {
  const {
    customerName,
    phone,
    wilaya,
    city,
    product,
    price,
    deliveryPrice
  } = data;

  if (!customerName?.trim()) return 'اسم الزبون مطلوب';
  if (!phone?.trim()) return 'رقم الهاتف مطلوب';
  if (!wilaya?.trim()) return 'الولاية مطلوبة';
  if (!city?.trim()) return 'البلدية مطلوبة';
  if (!product?.trim()) return 'المنتج مطلوب';

  if (price === undefined || price === null || price === '') {
    return 'السعر مطلوب';
  }

  if (deliveryPrice === undefined || deliveryPrice === null || deliveryPrice === '') {
    return 'سعر التوصيل مطلوب';
  }

  if (Number.isNaN(Number(price)) || Number(price) < 0) {
    return 'السعر غير صالح';
  }

  if (Number.isNaN(Number(deliveryPrice)) || Number(deliveryPrice) < 0) {
    return 'سعر التوصيل غير صالح';
  }

  return null;
};

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
    const validationError = validateOrderData(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const {
      customerName,
      phone,
      wilaya,
      city,
      product,
      price,
      deliveryPrice,
      notes
    } = req.body;

    const order = await Order.create({
      userId: req.user.id,
      customerName,
      phone,
      wilaya,
      city,
      product,
      price: Number(price),
      deliveryPrice: Number(deliveryPrice),
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
    const validationError = validateOrderData(req.body);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const {
      customerName,
      phone,
      wilaya,
      city,
      product,
      price,
      deliveryPrice,
      notes
    } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        customerName,
        phone,
        wilaya,
        city,
        product,
        price: Number(price),
        deliveryPrice: Number(deliveryPrice),
        notes
      },
      { new: true, runValidators: true }
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

    const allowedStatuses = ['new', 'confirmed', 'shipped', 'delivered', 'returned'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'حالة الطلب غير صالحة' });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!order) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    const finalStatuses = ['delivered', 'returned'];

    if (finalStatuses.includes(order.status)) {
      return res.status(400).json({
        message: 'لا يمكن تغيير حالة طلب تم إنهاؤه'
      });
    }

    const allowedTransitions = {
      new: ['confirmed', 'returned'],
      confirmed: ['shipped', 'returned'],
      shipped: ['delivered', 'returned'],
      delivered: [],
      returned: []
    };

    if (!allowedTransitions[order.status].includes(status)) {
      return res.status(400).json({
        message: 'لا يمكن تغيير الطلب إلى هذه الحالة'
      });
    }

    order.status = status;
    await order.save();

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