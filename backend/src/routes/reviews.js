const router = require('express').Router()
const Review = require('../models/Review')
const Product = require('../models/Product')
const { protect } = require('../middleware/auth')
router.post('/orders/:orderId', protect, async (req, res) => {
  try {
    const review = new Review({ ...req.body, order: req.params.orderId, customer: req.user.id })
    await review.save()
    // Update product avg rating
    if (req.body.product && req.body.productRating) {
      const reviews = await Review.find({ product: req.body.product })
      const avg = reviews.reduce((s, r) => s + r.productRating, 0) / reviews.length
      await Product.findByIdAndUpdate(req.body.product, { avgRating: avg, reviewCount: reviews.length })
    }
    res.status(201).json({ review })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
module.exports = router
