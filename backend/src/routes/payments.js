const router = require('express').Router()
const c = require('../controllers/paymentController')
const { protect } = require('../middleware/auth')
router.post('/create-order', protect, c.createOrder)
router.post('/verify', protect, c.verifyPayment)
module.exports = router
