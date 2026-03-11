const Order = require('../models/Order')
const Product = require('../models/Product')
const nodemailer = require('nodemailer')

exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, razorpayPaymentId, totalAmount } = req.body

    // Enrich items with store and price
    const enriched = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.product).populate('store')
      return {
        product: item.product,
        store: product.store._id,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        price: product.price,
      }
    }))

    const order = new Order({
      customer: req.user.id,
      items: enriched,
      deliveryAddress,
      paymentMethod,
      razorpayPaymentId,
      totalAmount,
      paymentStatus: paymentMethod === 'razorpay' ? 'paid' : 'pending',
      estimatedDelivery: new Date(Date.now() + 60 * 60 * 1000),
    })

    await order.save()

    // Notify store owners via socket
    req.io.to('store:' + enriched[0].store).emit('newOrder', { orderId: order._id })

    res.status(201).json({ order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images price')
      .populate('customer', 'name phone')
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json({ order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
    res.json({ orders })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, driverName, driverPhone } = req.body
    const update = { status }
    if (driverName) update.deliveryPartner = { name: driverName, phone: driverPhone }
    if (status === 'delivered') update.deliveredAt = new Date()

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    // Broadcast real-time update
    req.io.to('order:' + req.params.id).emit('orderStatusUpdate', {
      status,
      driver: order.deliveryPartner,
    })

    res.json({ order })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getStoreOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.store': req.storeId })
      .populate('customer', 'name phone')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
    res.json({ orders })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
