// backend/src/models/product.model.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'اسم المنتج مطلوب'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'سعر البيع مطلوب'],
      min: [0, 'سعر البيع يجب أن يكون 0 أو أكثر'],
    },
    costPrice: {
      type: Number,
      default: 0,
      min: [0, 'سعر التكلفة لا يمكن أن يكون سالباً'],
    },
    sizes: {
      type: [String],
      default: [],
    },
    colors: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Product', productSchema);