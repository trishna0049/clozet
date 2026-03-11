const Product = require('../models/Product')
const Store = require('../models/Store')

exports.getProducts = async (req, res) => {
  try {
    const { sort, featured, limit = 20, page = 1, category, minPrice, maxPrice, size, color, store } = req.query
    const filter = {}
    if (featured === 'true') filter.isFeatured = true
    if (sort === 'trending') filter.isTrending = true
    if (category) filter.category = category
    if (store) filter.store = store
    if (size) filter.sizes = size
    if (color) filter.colors = color
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    const sortMap = { trending: { reviewCount: -1 }, newest: { createdAt: -1 }, price_asc: { price: 1 }, price_desc: { price: -1 } }
    const sortQuery = sortMap[sort] || { createdAt: -1 }

    const products = await Product.find(filter)
      .populate('store', 'name logo')
      .sort(sortQuery)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .lean()

    const formatted = products.map(p => ({ ...p, storeName: p.store?.name }))
    res.json({ products: formatted })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('store', 'name logo exchangePolicy').lean()
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.json({ product: { ...product, storeName: product.store?.name, storeId: product.store?._id } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.searchProducts = async (req, res) => {
  try {
    const { q, ...filters } = req.query
    const products = await Product.find(
      { $text: { $search: q }, ...filters },
      { score: { $meta: 'textScore' } }
    )
      .populate('store', 'name')
      .sort({ score: { $meta: 'textScore' } })
      .limit(30)
      .lean()
    res.json({ products })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.createProduct = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.id })
    if (!store) return res.status(403).json({ message: 'No store found for this account' })
    const product = new Product({ ...req.body, store: store._id })
    await product.save()
    res.status(201).json({ product })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json({ product })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id)
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
