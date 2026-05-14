// models/user.model.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  whatsappTemplates: {
    confirmOrder: {
      type: String,
      default: 'السلام عليكم {name}،\nتم تأكيد طلبك: {product}.\nالإجمالي: {total} دج.\nسيتم التواصل معك بخصوص التوصيل قريباً إن شاء الله.'
    },
    shipped: {
      type: String,
      default: 'السلام عليكم {name}،\nتم إرسال طلبك: {product}.\nيرجى إبقاء الهاتف متاحاً لتسهيل عملية التوصيل.\nشكراً لثقتك بنا.'
    },
    delivered: {
      type: String,
      default: 'السلام عليكم {name}،\nنتمنى أن يكون طلبك قد وصلك بحالة جيدة.\nشكراً لثقتك بنا.'
    },
    followUp: {
      type: String,
      default: 'السلام عليكم {name}،\nنود تأكيد طلبك: {product}.\nيرجى الرد علينا لتأكيد معلومات التوصيل.'
    },
    returned: {
      type: String,
      default: 'السلام عليكم {name}،\nلاحظنا أن طلبك: {product} لم يكتمل تسليمه.\nهل يمكن إخبارنا بسبب الرجوع حتى نساعدك؟'
    }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);