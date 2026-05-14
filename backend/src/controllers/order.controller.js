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

const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getStartOfWeek = (date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diffToMonday = day === 0 ? 6 : day - 1;

  start.setDate(start.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);

  return start;
};

const buildDateFilter = ({ dateFilter, dateFrom, dateTo }) => {
  const now = new Date();

  if (dateFilter === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return { $gte: start, $lte: end };
  }

  if (dateFilter === 'week') {
    return { $gte: getStartOfWeek(now) };
  }

  if (dateFilter === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);

    return { $gte: start, $lte: end };
  }

  if (dateFilter === 'custom') {
    const filter = {};

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);

      if (!Number.isNaN(from.getTime())) {
        filter.$gte = from;
      }
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);

      if (!Number.isNaN(to.getTime())) {
        filter.$lte = to;
      }
    }

    return Object.keys(filter).length > 0 ? filter : null;
  }

  return null;
};

// جلب الطلبات مع فلترة من Backend
exports.getOrders = async (req, res) => {
  try {
    const {
      status,
      search,
      wilaya,
      dateFilter,
      dateFrom,
      dateTo
    } = req.query;

    const filter = {
      userId: req.user.id
    };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (wilaya && wilaya !== 'all') {
      filter.wilaya = wilaya;
    }

    if (search?.trim()) {
      const safeSearch = escapeRegex(search.trim());
      const searchRegex = new RegExp(safeSearch, 'i');

      filter.$or = [
        { customerName: searchRegex },
        { phone: searchRegex },
        { product: searchRegex },
        { wilaya: searchRegex },
        { city: searchRegex }
      ];
    }

    const createdAtFilter = buildDateFilter({
      dateFilter,
      dateFrom,
      dateTo
    });

    if (createdAtFilter) {
      filter.createdAt = createdAtFilter;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    res.status(200).json(orders);

  } catch (error) {
    res.status(500).json({
      message: 'خطأ في السيرفر',
      error: error.message
    });
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