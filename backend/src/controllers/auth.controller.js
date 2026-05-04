const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, businessName, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم مسبقاً' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name, email, password: hashedPassword, businessName, phone
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, businessName: user.businessName }
    });

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

    return res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, businessName: user.businessName }
    });

  } catch (error) {
    return res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في السيرفر', error: error.message });
  }
};