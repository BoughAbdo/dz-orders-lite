const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  wilaya: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  product: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  deliveryPrice: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['new', 'confirmed', 'shipped', 'delivered', 'returned'],
    default: 'new'
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);