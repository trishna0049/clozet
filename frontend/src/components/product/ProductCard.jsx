import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useAuthStore } from '../../store/authStore'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function ProductCard({ product, index = 0 }) {
  const [wishlisted, setWishlisted] = useState(false)
  const token = useAuthStore(s => s.token)

  const toggleWishlist = async (e) => {
    e.preventDefault()
    if (!token) return toast.error('Login to wishlist')
    try {
      const { data } = await api.post('/wishlist/toggle', { productId: product._id })
      setWishlisted(data.wishlisted)
      toast(data.wishlisted ? 'Added to wishlist ♡' : 'Removed from wishlist')
    } catch { toast.error('Failed') }
  }

  const price = product.discountPrice || product.basePrice
  const original = product.discountPrice ? product.basePrice : null

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Link to={`/products/${product._id}`} className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
        <div className="relative aspect-[3/4] overflow-hidden bg-brand-50">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">👗</div>
          )}
          {product.isTrending && (
            <span className="absolute top-2 left-2 bg-brand-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Trending</span>
          )}
          <button onClick={toggleWishlist}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
            <span className={wishlisted ? 'text-red-500' : 'text-ink/30'}>♥</span>
          </button>
        </div>
        <div className="p-3">
          <p className="text-xs text-brand-600 font-medium">{product.store?.name}</p>
          <h3 className="text-sm font-semibold text-ink mt-0.5 line-clamp-2 leading-tight">{product.name}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="font-bold text-ink">₹{price}</span>
            {original && <span className="text-xs text-ink/40 line-through">₹{original}</span>}
            {product.discountPercent && <span className="text-xs text-green-600 font-medium">{product.discountPercent}% off</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
