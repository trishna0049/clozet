const router = require('express').Router()
const User = require('../models/User')
const { protect } = require('../middleware/auth')
router.get('/', protect, async (req, res) => {
  const user = await User.findById(req.user.id).populate('wishlist')
  res.json({ wishlist: user.wishlist })
})
router.post('/', protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $addToSet: { wishlist: req.body.productId } })
  res.json({ message: 'Added' })
})
router.delete('/:productId', protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { $pull: { wishlist: req.params.productId } })
  res.json({ message: 'Removed' })
})
module.exports = router
