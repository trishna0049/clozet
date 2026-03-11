const router = require('express').Router()
const { protect, requireRole } = require('../middleware/auth')
const Store = require('../models/Store')
const User = require('../models/User')
const Order = require('../models/Order')
router.get('/stats', protect, requireRole('admin'), async (req, res) => {
  const [users, stores, orders] = await Promise.all([
    User.countDocuments(),
    Store.countDocuments(),
    Order.countDocuments(),
  ])
  const revenue = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ])
  res.json({ users, stores, orders, revenue: revenue[0]?.total || 0 })
})
router.put('/stores/:id/verify', protect, requireRole('admin'), async (req, res) => {
  await Store.findByIdAndUpdate(req.params.id, { isVerified: true })
  res.json({ message: 'Store verified' })
})
module.exports = router
