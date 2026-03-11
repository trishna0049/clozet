const Store = require('../models/Store')
const Product = require('../models/Product')

exports.getNearbyStores = async (req, res) => {
  try {
    const { lat, lng, radius = 15 } = req.query
    const stores = await Store.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: radius * 1000,
        },
      },
      isVerified: true,
    }).lean()

    // Calculate distance for each store
    const withDist = stores.map(s => {
      const dLat = (s.location.coordinates[1] - lat) * (Math.PI / 180)
      const dLng = (s.location.coordinates[0] - lng) * (Math.PI / 180)
      const a = Math.sin(dLat/2)**2 + Math.cos(lat * Math.PI/180) * Math.cos(s.location.coordinates[1] * Math.PI/180) * Math.sin(dLng/2)**2
      const distKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return { ...s, distanceKm: distKm }
    })

    res.json({ stores: withDist })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
    if (!store) return res.status(404).json({ message: 'Store not found' })
    res.json({ store })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getStoreProducts = async (req, res) => {
  try {
    const products = await Product.find({ store: req.params.id }).lean()
    res.json({ products })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createStore = async (req, res) => {
  try {
    const store = new Store({ ...req.body, owner: req.user.id })
    await store.save()
    res.status(201).json({ store })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updateStore = async (req, res) => {
  try {
    const store = await Store.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      req.body,
      { new: true }
    )
    res.json({ store })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
