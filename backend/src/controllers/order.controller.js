// controllers/order.controller.js
const Order = require('../models/order.model');
const ExcelJS = require('exceljs');
const deliveryTemplates = require('../utils/deliveryTemplates');

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

// جلب الطلبات مع فلترة + Pagination من Backend
exports.getOrders = async (req, res) => {
  try {
    const {
      status,
      search,
      wilaya,
      dateFilter,
      dateFrom,
      dateTo,
      page = 1,
      limit = 20
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

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      orders,
      total,
      page: pageNumber,
      pages: Math.ceil(total / limitNumber) || 1,
      limit: limitNumber
    });

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
      deliveryType, 
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
      deliveryType: deliveryType || 'home',
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
      deliveryType,
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
        deliveryType: deliveryType || 'home',
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

// دالة تصدير الطلبات المؤكدة فقط لشركات الشحن
exports.exportOrdersToExcel = async (req, res) => {
  try {
    const { provider = 'yalidine', orderIds } = req.body;
    const userId = req.user.id;

    const template = deliveryTemplates[provider.toLowerCase()];
    if (!template) {
      return res.status(400).json({ message: 'شركة التوصيل المحددة غير مدعومة' });
    }

    // شرط أساسي: التصدير لشركات التوصيل محصور حصراً في الطلبات المؤكدة
    const filter = {
      userId,
      status: 'confirmed'
    };

    // إذا حدد التاجر طلبات بعينها، نأخذ فقط المؤكدة منها
    if (orderIds && Array.isArray(orderIds) && orderIds.length > 0) {
      filter._id = { $in: orderIds };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    if (!orders || orders.length === 0) {
      return res.status(400).json({
        message: 'لا توجد أي طلبات بحالة (مؤكد) صالحة للتصدير لشركة الشحن.'
      });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    worksheet.columns = template.columns;

    // تنسيق الصف الأول (Headers)
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' } // Dark Slate
    };

    orders.forEach((order) => {
      worksheet.addRow(template.mapRow(order));
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `${template.fileName}_${dateStr}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    // إرسال عدد الطلبات المصدرة للواجهة
    res.setHeader('X-Exported-Count', orders.length);
    res.setHeader('Access-Control-Expose-Headers', 'X-Exported-Count');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ message: 'فشل تصدير الملف', error: error.message });
  }
};

// تحويل الطلبات المؤكدة إلى قيد التوصيل دفعة واحدة
exports.updateBulkStatus = async (req, res) => {
  try {
    const { orderIds, status = 'shipped' } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: 'يرجى تحديد طلبية واحدة على الأقل.' });
    }

    // نحدد فقط الطلبات المؤكدة لنقلها إلى قيد التوصيل
    const result = await Order.updateMany(
      {
        _id: { $in: orderIds },
        userId: req.user.id,
        status: 'confirmed'
      },
      {
        $set: { status: 'shipped' }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        message: 'لم يتم العثور على طلبيات مؤكدة لتحويلها إلى قيد التوصيل.'
      });
    }

    res.status(200).json({
      message: `تم تحويل ${result.modifiedCount} طلبية إلى (قيد التوصيل) بنجاح!`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk Update Error:', error);
    res.status(500).json({ message: 'خطأ في السيرفر أثناء تحويل الطلبات.', error: error.message });
  }
};

// استيراد طلبات جماعية دفعة واحدة (Bulk Import)
exports.createBulkOrders = async (req, res) => {
  try {
    const { orders } = req.body;

    if (!orders || !Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({
        message: 'يرجى إرسال قائمة تحتوي على طلبية واحدة على الأقل للاستيراد.',
      });
    }

    if (orders.length > 500) {
      return res.status(400).json({
        message: 'الحد الأقصى للاستيراد دفعة واحدة هو 500 طلبية.',
      });
    }

    const validOrders = [];
    const errors = [];

    orders.forEach((item, index) => {
      const rowNum = index + 1;
      const customerName = item.customerName ? String(item.customerName).trim() : '';
      const phone = item.phone ? String(item.phone).replace(/\D/g, '').trim() : '';
      const wilaya = item.wilaya ? String(item.wilaya).trim() : '';
      const city = item.city ? String(item.city).trim() : '';
      const product = item.product ? String(item.product).trim() : '';
      const price = Number(item.price);
      const deliveryPrice = item.deliveryPrice !== undefined && item.deliveryPrice !== '' 
        ? Number(item.deliveryPrice) 
        : 600;
      const deliveryType = item.deliveryType === 'desk' || 
        String(item.deliveryType).toLowerCase().includes('مكتب') || 
        String(item.deliveryType).toLowerCase().includes('stopdesk')
        ? 'desk'
        : 'home';
      const notes = item.notes ? String(item.notes).trim() : '';

      // التحقق من الحقول الإجبارية
      if (!customerName) {
        errors.push(`السطر ${rowNum}: اسم الزبون مطلوب.`);
        return;
      }
      if (!phone || phone.length < 9) {
        errors.push(`السطر ${rowNum}: رقم الهاتف غير صحيح (${phone || 'فارغ'}).`);
        return;
      }
      if (!wilaya) {
        errors.push(`السطر ${rowNum}: الولاية مطلوبة.`);
        return;
      }
      if (!city) {
        errors.push(`السطر ${rowNum}: البلدية مطلوبة.`);
        return;
      }
      if (!product) {
        errors.push(`السطر ${rowNum}: اسم المنتج مطلوب.`);
        return;
      }
      if (Number.isNaN(price) || price <= 0) {
        errors.push(`السطر ${rowNum}: سعر المنتج غير صالح.`);
        return;
      }

      validOrders.push({
        userId: req.user.id,
        customerName,
        phone,
        wilaya,
        city,
        product,
        price,
        deliveryPrice: Number.isNaN(deliveryPrice) ? 600 : deliveryPrice,
        deliveryType,
        notes,
        status: 'new',
      });
    });

    if (validOrders.length === 0) {
      return res.status(400).json({
        message: 'لم يتم العثور على أي صفوف صالحة للاستيراد.',
        errors,
      });
    }

    const insertedOrders = await Order.insertMany(validOrders);

    return res.status(201).json({
      message: `تم استيراد ${insertedOrders.length} طلبية بنجاح!`,
      importedCount: insertedOrders.length,
      failedCount: errors.length,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    console.error('Bulk Import Error:', error);
    return res.status(500).json({
      message: 'خطأ في السيرفر أثناء استيراد الطلبات.',
      error: error.message,
    });
  }
};