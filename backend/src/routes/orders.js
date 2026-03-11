const router = require('express').Router()
const c = require('../controllers/orderController')
const { protect, requireRole } = require('../middleware/auth')
router.post('/', protect, c.createOrder)
router.get('/me', protect, c.getMyOrders)
router.get('/:id', protect, c.getOrder)
router.put('/:id/status', protect, requireRole('store','admin'), c.updateOrderStatus)
module.exports = router
