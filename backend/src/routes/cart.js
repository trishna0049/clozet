// cart.js
const express = require('express');
const router = express.Router();
const { Cart } = require('../models/CartWishlist');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name images basePrice variants').populate('items.store', 'name logo');
  res.json(cart || { items: [] });
});

router.post('/add', protect, async (req, res) => {
  const { productId, storeId, size, color, quantity = 1, price } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const idx = cart.items.findIndex(i => i.product.toString() === productId && i.size === size && i.color === color);
  if (idx > -1) {
    cart.items[idx].quantity += quantity;
  } else {
    cart.items.push({ product: productId, store: storeId, size, color, quantity, priceAtAdd: price });
  }
  await cart.save();
  res.json(cart);
});

router.put('/item/:itemId', protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  const item = cart.items.id(req.params.itemId);
  if (item) item.quantity = req.body.quantity;
  if (req.body.quantity < 1) cart.items.pull(req.params.itemId);
  await cart.save();
  res.json(cart);
});

router.delete('/item/:itemId', protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  cart.items.pull(req.params.itemId);
  await cart.save();
  res.json(cart);
});

router.delete('/clear', protect, async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ message: 'Cart cleared' });
});

module.exports = router;
