import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import ProductCard from '../components/product/ProductCard'
import StoreCard from '../components/store/StoreCard'

export default function HomePage() {
  const { user, location } = useAuthStore()
  const [trending, setTrending] = useState([])
  const [nearbyStores, setNearbyStores] = useState([])
  const [browseMode, setBrowseMode] = useState('product') // 'product' | 'store'
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = location ? `?lat=${location.lat}&lng=${location.lng}` : ''
    Promise.all([
      api.get(`/products/trending${params}`),
      api.get(`/stores/nearby${params || '?lat=28.6&lng=77.2'}`)
    ]).then(([p, s]) => {
      setTrending(p.data)
      setNearbyStores(s.data)
    }).finally(() => setLoading(false))
  }, [location])

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-ink/50 text-sm">Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'} 👋</p>
        <h1 className="font-display text-3xl font-bold text-ink">{user?.name?.split(' ')[0] || 'Explorer'}</h1>
      </motion.div>

      {/* Promo Banner */}
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
        className="mt-5 rounded-2xl bg-gradient-to-r from-brand-700 to-brand-500 p-5 text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 text-[80px] opacity-20">👗</div>
        <p className="text-brand-200 text-xs font-medium uppercase tracking-widest mb-1">Today's Offer</p>
        <h3 className="font-display text-2xl font-bold">Express delivery<br />in under 60 min</h3>
        <Link to="/products?deliveryType=express" className="mt-3 inline-block bg-white text-brand-700 text-xs font-semibold px-4 py-2 rounded-full hover:bg-brand-50 transition-colors">
          Shop Now →
        </Link>
      </motion.div>

      {/* Category Pills */}
      <div className="mt-5 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {[['All', '✨'], ['Women', '👗'], ['Men', '👔'], ['Footwear', '👟'], ['Accessories', '💍'], ['Kids', '🧸']].map(([cat, icon]) => (
          <Link key={cat} to={`/products?category=${cat.toLowerCase()}`}
            className="flex-shrink-0 flex items-center gap-1.5 bg-white border border-brand-100 hover:border-brand-400 rounded-full px-4 py-2 text-sm font-medium text-ink/70 hover:text-brand-600 transition-colors shadow-sm">
            <span>{icon}</span>{cat}
          </Link>
        ))}
      </div>

      {/* Browse Mode Toggle */}
      <div className="mt-7 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-ink">Explore</h2>
        <div className="flex bg-brand-100 rounded-full p-1 gap-1">
          <button onClick={() => setBrowseMode('product')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${browseMode === 'product' ? 'bg-brand-600 text-white shadow' : 'text-ink/60'}`}>
            Products
          </button>
          <button onClick={() => setBrowseMode('store')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${browseMode === 'store' ? 'bg-brand-600 text-white shadow' : 'text-ink/60'}`}>
            Stores
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-brand-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : browseMode === 'product' ? (
        <>
          <p className="mt-1 text-xs text-ink/40">Trending near you</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {trending.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
          <Link to="/products" className="mt-4 block text-center text-brand-600 text-sm font-medium py-3 border border-brand-200 rounded-xl hover:bg-brand-50 transition-colors">
            View all products →
          </Link>
        </>
      ) : (
        <>
          <p className="mt-1 text-xs text-ink/40">Within 15km of you</p>
          <div className="mt-3 flex flex-col gap-3">
            {nearbyStores.map((store, i) => <StoreCard key={store._id} store={store} index={i} />)}
          </div>
        </>
      )}
    </div>
  )
}
