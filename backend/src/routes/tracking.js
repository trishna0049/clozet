// tracking.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// PUT /api/tracking/:orderId/location (delivery partner updates location)
router.put('/:orderId/location', protect, async (req, res) => {
  const { lat, lng } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.orderId,
    { deliveryPartnerLocation: { lat, lng, updatedAt: new Date() } },
    { new: true }
  );
  req.io?.to(`order_${order._id}`).emit('location_update', { lat, lng });
  res.json({ lat, lng });
});

// GET /api/tracking/:orderId
router.get('/:orderId', protect, async (req, res) => {
  const order = await Order.findById(req.params.orderId)
    .select('status statusHistory deliveryPartnerLocation estimatedDeliveryTime deliveryPartner')
    .populate('deliveryPartner', 'name phone avatar');
  res.json(order);
});

module.exports = router;
