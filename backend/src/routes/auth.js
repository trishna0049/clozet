const router = require('express').Router()
const c = require('../controllers/authController')
const { protect } = require('../middleware/auth')
router.post('/send-otp', c.requestOTP)
router.post('/verify-otp', c.verifyOTP)
router.post('/google', c.googleLogin)
router.put('/profile', protect, c.setupProfile)
router.get('/me', protect, c.getMe)
module.exports = router
