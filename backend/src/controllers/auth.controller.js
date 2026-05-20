// backend/src/controllers/auth.controller.js
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  businessName: user.businessName,
  phone: user.phone || '',
  isEmailVerified: user.isEmailVerified !== false,
  whatsappTemplates: user.whatsappTemplates || {}
});

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async ({ to, name, code }) => {
  await sendEmail({
    to,
    subject: 'رمز تأكيد بريدك في طلبيات',
    html: `
      <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; line-height: 1.8; color: #0f172a;">
        <h2 style="margin-bottom: 12px;">تأكيد البريد الإلكتروني</h2>
        <p>مرحباً ${name}،</p>
        <p>رمز تأكيد حسابك في طلبيات هو:</p>

        <div style="font-size: 30px; font-weight: bold; letter-spacing: 8px; background: #f1f5f9; padding: 18px; border-radius: 14px; text-align: center; margin: 18px 0;">
          ${code}
        </div>

        <p>هذا الرمز صالح لمدة 10 دقائق فقط.</p>
        <p>إذا لم تقم بإنشاء حساب في طلبيات، يمكنك تجاهل هذه الرسالة.</p>
      </div>
    `
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, businessName, phone } = req.body;

    if (!name || !email || !password || !businessName) {
      return res.status(400).json({
        message: 'يرجى ملء جميع الحقول الإجبارية'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser && existingUser.isEmailVerified !== false) {
      return res.status(400).json({
        message: 'البريد الإلكتروني مستخدم مسبقاً'
      });
    }

    const verificationCode = generateVerificationCode();
    const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000);
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;

    if (existingUser && existingUser.isEmailVerified === false) {
      existingUser.name = name.trim();
      existingUser.email = cleanEmail;
      existingUser.password = hashedPassword;
      existingUser.businessName = businessName.trim();
      existingUser.phone = phone ? String(phone).trim() : '';
      existingUser.emailVerificationCode = hashedVerificationCode;
      existingUser.emailVerificationCodeExpires = verificationExpires;

      user = await existingUser.save();
    } else {
      user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        businessName: businessName.trim(),
        phone: phone ? String(phone).trim() : '',
        isEmailVerified: false,
        emailVerificationCode: hashedVerificationCode,
        emailVerificationCodeExpires: verificationExpires
      });
    }

    await sendVerificationEmail({
      to: cleanEmail,
      name: user.name,
      code: verificationCode
    });

    return res.status(201).json({
      message: 'تم إنشاء الحساب. أرسلنا رمز التأكيد إلى بريدك الإلكتروني.',
      email: cleanEmail
    });

  } catch (error) {
    return res.status(500).json({
      message: 'خطأ في السيرفر',
      error: error.message
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        message: 'يرجى إدخال البريد الإلكتروني ورمز التأكيد'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = String(code).trim();

    if (cleanCode.length !== 6) {
      return res.status(400).json({
        message: 'رمز التأكيد يجب أن يتكون من 6 أرقام'
      });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        message: 'المستخدم غير موجود'
      });
    }

    if (user.isEmailVerified !== false) {
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'البريد الإلكتروني مؤكد مسبقاً',
        token,
        user: buildUserResponse(user)
      });
    }

    if (!user.emailVerificationCode || !user.emailVerificationCodeExpires) {
      return res.status(400).json({
        message: 'لا يوجد رمز تأكيد صالح. اطلب رمزاً جديداً.'
      });
    }

    if (user.emailVerificationCodeExpires < new Date()) {
      return res.status(400).json({
        message: 'انتهت صلاحية رمز التأكيد. اطلب رمزاً جديداً.'
      });
    }

    const isCodeValid = await bcrypt.compare(
      cleanCode,
      user.emailVerificationCode
    );

    if (!isCodeValid) {
      return res.status(400).json({
        message: 'رمز التأكيد غير صحيح'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationCodeExpires = undefined;

    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'تم تأكيد البريد الإلكتروني بنجاح',
      token,
      user: buildUserResponse(user)
    });

  } catch (error) {
    return res.status(500).json({
      message: 'خطأ في السيرفر',
      error: error.message
    });
  }
};

exports.resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'يرجى إدخال البريد الإلكتروني'
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        message: 'المستخدم غير موجود'
      });
    }

    if (user.isEmailVerified !== false) {
      return res.status(400).json({
        message: 'هذا البريد مؤكد مسبقاً'
      });
    }

    const verificationCode = generateVerificationCode();
    const hashedVerificationCode = await bcrypt.hash(verificationCode, 10);

    user.emailVerificationCode = hashedVerificationCode;
    user.emailVerificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await sendVerificationEmail({
      to: cleanEmail,
      name: user.name,
      code: verificationCode
    });

    return res.status(200).json({
      message: 'تم إرسال رمز تأكيد جديد إلى بريدك الإلكتروني'
    });

  } catch (error) {
    return res.status(500).json({
      message: 'خطأ في السيرفر',
      error: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = email ? email.trim().toLowerCase() : '';

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(400).json({
        message: 'البريد أو كلمة المرور غير صحيحة'
      });
    }

    if (user.isEmailVerified === false) {
      return res.status(403).json({
        message: 'يرجى تأكيد بريدك الإلكتروني قبل تسجيل الدخول'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'البريد أو كلمة المرور غير صحيحة'
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      token,
      user: buildUserResponse(user)
    });

  } catch (error) {
    return res.status(500).json({
      message: 'خطأ في السيرفر',
      error: error.message
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'المستخدم غير موجود'
      });
    }

    return res.status(200).json(buildUserResponse(user));

  } catch (error) {
    return res.status(500).json({
      message: 'خطأ في السيرفر',
      error: error.message
    });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { name, businessName, phone } = req.body;

    if (!name || !businessName) {
      return res.status(400).json({
        message: 'اسم المستخدم واسم المتجر مطلوبان'
      });
    }

    const cleanPhone = phone ? String(phone).replace(/\D/g, '') : '';

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name: name.trim(),
        businessName: businessName.trim(),
        phone: cleanPhone
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        message: 'المستخدم غير موجود'
      });
    }

    return res.status(200).json({
      message: 'تم حفظ الإعدادات بنجاح',
      user: buildUserResponse(user)
    });

  } catch (error) {
    return res.status(500).json({
      message: 'خطأ في السيرفر',
      error: error.message
    });
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
      return res.status(404).json({
        message: 'المستخدم غير موجود'
      });
    }

    return res.status(200).json({
      message: 'تم حفظ القوالب بنجاح',
      user: buildUserResponse(user)
    });

  } catch (error) {
    return res.status(500).json({
      message: 'خطأ في السيرفر',
      error: error.message
    });
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