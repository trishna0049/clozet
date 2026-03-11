const mongoose = require('mongoose')

const storeSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  logo: String,
  category: String,
  address: { line1: String, city: String, pincode: String },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],  // [lng, lat]
  },
  phone: String,
  isOpen: { type: Boolean, default: true },
  openHours: { open: String, close: String },
  exchangePolicy: String,
  razorpayAccountId: String,
  isVerified: { type: Boolean, default: false },
  avgRating: { type: Number, default: 0 },
}, { timestamps: true })

storeSchema.index({ location: '2dsphere' })
module.exports = mongoose.model('Store', storeSchema)
