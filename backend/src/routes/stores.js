const router = require('express').Router()
const c = require('../controllers/storeController')
const { protect, requireRole } = require('../middleware/auth')
router.get('/nearby', c.getNearbyStores)
router.get('/:id', c.getStore)
router.get('/:id/products', c.getStoreProducts)
router.post('/', protect, requireRole('store'), c.createStore)
router.put('/:id', protect, requireRole('store'), c.updateStore)
module.exports = router
