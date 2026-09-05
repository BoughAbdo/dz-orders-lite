// backend/src/controllers/product.controller.js
const Product = require('../models/product.model');

// جلب جميع منتجات التاجر الحالي
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: 'خطأ في السيرفر أثناء جلب المنتجات',
      error: error.message,
    });
  }
};

// إنشاء منتج جديد
exports.createProduct = async (req, res) => {
  try {
    const { name, price, costPrice, sizes, colors } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'اسم المنتج مطلوب' });
    }

    if (price === undefined || price === null || price === '') {
      return res.status(400).json({ message: 'سعر البيع مطلوب' });
    }

    if (Number.isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ message: 'سعر البيع غير صالح' });
    }

    const cleanSizes = Array.isArray(sizes)
      ? sizes.map((s) => String(s).trim()).filter(Boolean)
      : typeof sizes === 'string' && sizes.trim()
      ? sizes.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const cleanColors = Array.isArray(colors)
      ? colors.map((c) => String(c).trim()).filter(Boolean)
      : typeof colors === 'string' && colors.trim()
      ? colors.split(',').map((c) => c.trim()).filter(Boolean)
      : [];

    const product = await Product.create({
      userId: req.user.id,
      name: name.trim(),
      price: Number(price),
      costPrice: Number(costPrice) || 0,
      sizes: cleanSizes,
      colors: cleanColors,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({
      message: 'خطأ في السيرفر أثناء إنشاء المنتج',
      error: error.message,
    });
  }
};

// تعديل منتج
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, costPrice, sizes, colors } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'اسم المنتج مطلوب' });
    }

    if (price === undefined || price === null || price === '') {
      return res.status(400).json({ message: 'سعر البيع مطلوب' });
    }

    if (Number.isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ message: 'سعر البيع غير صالح' });
    }

    const cleanSizes = Array.isArray(sizes)
      ? sizes.map((s) => String(s).trim()).filter(Boolean)
      : typeof sizes === 'string' && sizes.trim()
      ? sizes.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const cleanColors = Array.isArray(colors)
      ? colors.map((c) => String(c).trim()).filter(Boolean)
      : typeof colors === 'string' && colors.trim()
      ? colors.split(',').map((c) => c.trim()).filter(Boolean)
      : [];

    const product = await Product.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        name: name.trim(),
        price: Number(price),
        costPrice: Number(costPrice) || 0,
        sizes: cleanSizes,
        colors: cleanColors,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: 'خطأ في السيرفر أثناء تعديل المنتج',
      error: error.message,
    });
  }
};

// حذف منتج
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }

    res.status(200).json({ message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    res.status(500).json({
      message: 'خطأ في السيرفر أثناء حذف المنتج',
      error: error.message,
    });
  }
};