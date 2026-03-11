const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
  productRating: Number,
  storeRating: Number,
  deliveryRating: Number,
  comment: String,
}, { timestamps: true })

module.exports = mongoose.model('Review', reviewSchema)
