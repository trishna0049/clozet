const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    size: String,
    color: String,
    quantity: Number,
    price: Number,
  }],
  deliveryAddress: { line1: String, city: String, pincode: String },
  deliveryPartner: {
    name: String,
    phone: String,
  },
  status: {
    type: String,
    enum: ['placed','accepted','picked','out_for_delivery','delivered','cancelled'],
    default: 'placed',
  },
  paymentMethod: { type: String, enum: ['razorpay','cod'] },
  paymentStatus: { type: String, enum: ['pending','paid','failed'], default: 'pending' },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  totalAmount: Number,
  deliveryFee: { type: Number, default: 49 },
  estimatedDelivery: Date,
  deliveredAt: Date,
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
