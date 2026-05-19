// src/controllers/auth.controller.js
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  businessName: user.businessName,
  phone: user.phone || '',
  whatsappTemplates: user.whatsappTemplates || {}
});

exports.register = async (req, res) => {
  try {
    const { name, email, password, businessName, phone } = req.body;

    if (!name || !email || !password || !businessName) {
      return res.status(400).json({ message: 'يرجى ملء جميع الحقول الإجبارية' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم مسبقاً' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name, email, password: hashedPassword, businessName, phone
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ token, user: buildUserResponse(user) });

  } catch (error) {
    return res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'البريد أو كلمة المرور غير صحيحة' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'البريد أو كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({ token, user: buildUserResponse(user) });

  } catch (error) {
    return res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    return res.status(200).json(buildUserResponse(user));

  } catch (error) {
    return res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { name, businessName, phone } = req.body;

    if (!name || !businessName) {
      return res.status(400).json({ message: 'اسم المستخدم واسم المتجر مطلوبان' });
    }

    const cleanPhone = phone ? String(phone).replace(/\D/g, '') : '';

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim(), businessName: businessName.trim(), phone: cleanPhone },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    return res.status(200).json({
      message: 'تم حفظ الإعدادات بنجاح',
      user: buildUserResponse(user)
    });

  } catch (error) {
    return res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};

exports.updateWhatsappTemplates = async (req, res) => {
  try {
    const { confirmOrder, shipped, delivered, followUp, returned } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        whatsappTemplates: {
          confirmOrder: confirmOrder || '',
          shipped: shipped || '',
          delivered: delivered || '',
          followUp: followUp || '',
          returned: returned || ''
        }
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    return res.status(200).json({
      message: 'تم حفظ القوالب بنجاح',
      user: buildUserResponse(user)
    });

  } catch (error) {
    return res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        message: 'يرجى ملء جميع حقول كلمة المرور'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: 'تأكيد كلمة المرور غير مطابق'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'المستخدم غير موجود'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'كلمة المرور الحالية غير صحيحة'
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        message: 'كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية'
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.status(200).json({
      message: 'تم تغيير كلمة المرور بنجاح'
    });

  } catch (error) {
    return res.status(500).json({
      message: 'خطأ في السيرفر',
      error: error.message
    });
  }
};