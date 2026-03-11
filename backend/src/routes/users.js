const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/me', protect, async (req, res) => res.json(req.user));

router.put('/me', protect, async (req, res) => {
  const { name, gender, dob, preferences, fcmToken } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { name, gender, dob, preferences, fcmToken }, { new: true });
  res.json(user);
});

router.put('/location', protect, async (req, res) => {
  const { lat, lng } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, { location: { type: 'Point', coordinates: [lng, lat] } }, { new: true });
  res.json(user);
});

router.post('/addresses', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) user.savedAddresses.forEach(a => a.isDefault = false);
  user.savedAddresses.push(req.body);
  await user.save();
  res.json(user.savedAddresses);
});

router.delete('/addresses/:id', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.savedAddresses.pull(req.params.id);
  await user.save();
  res.json(user.savedAddresses);
});

module.exports = router;
