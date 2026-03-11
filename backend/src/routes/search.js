const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Store = require('../models/Store');

// GET /api/search?q=...&lat=&lng=
router.get('/', async (req, res) => {
  try {
    const { q, lat, lng } = req.query;
    if (!q) return res.json({ products: [], stores: [] });

    let storeIds = null;
    if (lat && lng) {
      const stores = await Store.find({
        location: { $near: { $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: 15000 } },
        isActive: true,
      }).select('_id');
      storeIds = stores.map(s => s._id);
    }

    const productFilter = { $text: { $search: q }, isActive: true };
    if (storeIds) productFilter.store = { $in: storeIds };

    const products = await Product.find(productFilter)
      .populate('store', 'name logo')
      .limit(20);

    const stores = await Store.find({
      $or: [{ name: { $regex: q, $options: 'i' } }, { category: { $regex: q, $options: 'i' } }],
      isActive: true,
      ...(lat && lng ? { location: { $near: { $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: 15000 } } } : {}),
    }).limit(5);

    res.json({ products, stores });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
