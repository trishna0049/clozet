const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },
  gender: String,
  dob: Date,
  profileComplete: { type: Boolean, default: false },
  role: { type: String, enum: ['customer','store','admin'], default: 'customer' },
  googleId: String,
  otp: String,
  otpExpiry: Date,
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  savedAddresses: [{
    label: String,
    line1: String,
    city: String,
    pincode: String,
    isDefault: Boolean,
  }],
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  },
}, { timestamps: true })

userSchema.index({ location: '2dsphere' })
module.exports = mongoose.model('User', userSchema)
