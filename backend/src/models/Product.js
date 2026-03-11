const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
  name: { type: String, required: true },
  description: String,
  images: [String],
  price: { type: Number, required: true },
  originalPrice: Number,
  category: String,
  sizes: [String],
  colors: [String],
  material: String,
  care: String,
  inventory: [{ size: String, color: String, stock: Number }],
  isFeatured: { type: Boolean, default: false },
  isTrending: { type: Boolean, default: false },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  deliveryTime: Number,  // minutes
  tags: [String],
}, { timestamps: true })

productSchema.index({ name: 'text', tags: 'text' })
module.exports = mongoose.model('Product', productSchema)
