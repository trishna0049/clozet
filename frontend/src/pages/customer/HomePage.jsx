import { useEffect, useState } from 'react'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import Navbar from '../../components/common/Navbar'
import ProductCard from '../../components/common/ProductCard'
import { getProducts, getNearbyStores } from '../../services/api'
import { useLocationStore } from '../../store/locationStore'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const { coords } = useLocationStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: trending } = useQuery('trending', () =>
    getProducts({ sort: 'trending', limit: 8 }).then(r => r.data.products)
  )

  const { data: stores } = useQuery(
    ['nearbyStores', coords],
    () => getNearbyStores(coords?.lat, coords?.lng).then(r => r.data.stores),
    { enabled: !!coords }
  )

  const { data: featured } = useQuery('featured', () =>
    getProducts({ featured: true, limit: 4 }).then(r => r.data.products)
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">

        {/* Greeting */}
        <div>
          <h2 className="font-display text-3xl font-bold">
            Hi {user?.name?.split(' ')[0] || 'there'} 👋
          </h2>
          <p className="text-gray-500 mt-1">Discover fashion near you</p>
        </div>

        {/* Browse Mode Toggle */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/products')}
            className="flex-1 bg-brand-600 text-white rounded-2xl p-5 text-left hover:bg-brand-700 transition"
          >
            <p className="text-2xl mb-2">👗</p>
            <p className="font-display font-semibold text-lg">Browse Products</p>
            <p className="text-brand-100 text-sm">Discover individual items</p>
          </button>
          <button
            onClick={() => navigate('/stores')}
            className="flex-1 bg-dark text-white rounded-2xl p-5 text-left hover:bg-gray-800 transition"
          >
            <p className="text-2xl mb-2">🏪</p>
            <p className="font-display font-semibold text-lg">Browse Stores</p>
            <p className="text-gray-400 text-sm">Shop by your favourite stores</p>
          </button>
        </div>

        {/* Trending */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl font-semibold">🔥 Trending Now</h3>
            <button onClick={() => navigate('/products?sort=trending')} className="text-sm text-brand-600">
              View all
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trending?.map(p => <ProductCard key={p._id} product={p} />)}
            {!trending && Array(8).fill(0).map((_, i) => (
              <div key={i} className="card animate-pulse aspect-[3/4] bg-gray-100" />
            ))}
          </div>
        </section>

        {/* Nearby Stores */}
        {stores?.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl font-semibold">📍 Nearby Stores</h3>
              <button onClick={() => navigate('/stores')} className="text-sm text-brand-600">View all</button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {stores.map(store => (
                <motion.div
                  key={store._id}
                  whileHover={{ scale: 1.02 }}
                  className="card cursor-pointer min-w-[200px] flex-shrink-0 p-4"
                  onClick={() => navigate('/stores/' + store._id)}
                >
                  <img
                    src={store.logo || '/store-placeholder.jpg'}
                    alt={store.name}
                    className="w-12 h-12 rounded-full object-cover mb-3"
                  />
                  <p className="font-semibold text-sm">{store.name}</p>
                  <p className="text-xs text-gray-400">{store.distanceKm?.toFixed(1)} km away</p>
                  <p className="text-xs text-green-600 mt-1">
                    {store.isOpen ? '● Open' : '● Closed'}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Collections */}
        <section>
          <h3 className="font-display text-xl font-semibold mb-4">✨ Featured Collections</h3>
          <div className="grid grid-cols-2 gap-4">
            {featured?.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </section>
      </div>
    </div>
  )
}
