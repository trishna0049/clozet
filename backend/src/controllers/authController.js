const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' })

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

exports.requestOTP = async (req, res) => {
  try {
    const { contact } = req.body
    const otp = generateOTP()
    const expiry = new Date(Date.now() + 10 * 60 * 1000)

    const query = contact.includes('@') ? { email: contact } : { phone: contact }
    let user = await User.findOne(query)
    if (!user) user = new User(query)
    user.otp = otp
    user.otpExpiry = expiry
    await user.save()

    // In dev: log OTP to console. In prod: integrate Twilio/Nodemailer
    console.log(`[DEV] OTP for ${contact}: ${otp}`)

    res.json({ message: 'OTP sent' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.verifyOTP = async (req, res) => {
  try {
    const { contact, otp } = req.body
    const query = contact.includes('@') ? { email: contact } : { phone: contact }
    const user = await User.findOne(query)
    if (!user || user.otp !== otp || user.otpExpiry < new Date())
      return res.status(400).json({ message: 'Invalid or expired OTP' })

    user.otp = undefined
    user.otpExpiry = undefined
    await user.save()

    res.json({ token: signToken(user._id), user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const { email, name, sub: googleId } = ticket.getPayload()

    let user = await User.findOne({ $or: [{ googleId }, { email }] })
    if (!user) user = new User({ email, name, googleId })
    else if (!user.googleId) user.googleId = googleId
    await user.save()

    res.json({ token: signToken(user._id), user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.setupProfile = async (req, res) => {
  try {
    const { name, gender, dob } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, gender, dob, profileComplete: true },
      { new: true }
    )
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-otp -otpExpiry')
    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
