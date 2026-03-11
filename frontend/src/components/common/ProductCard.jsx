import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { addToWishlist, removeFromWishlist } from '../../services/api'
import toast from 'react-hot-toast'

export default function ProductCard({ product, wishlisted = false }) {
  const navigate = useNavigate()
  const [liked, setLiked] = useState(wishlisted)

  const toggleWishlist = async (e) => {
    e.stopPropagation()
    try {
      if (liked) {
        await removeFromWishlist(product._id)
        toast.success('Removed from wishlist')
      } else {
        await addToWishlist(product._id)
        toast.success('Added to wishlist')
      }
      setLiked(!liked)
    } catch {
      toast.error('Please log in')
    }
  }

  return (
    <div
      className="card cursor-pointer hover:shadow-md transition-shadow group"
      onClick={() => navigate('/products/' + product._id)}
    >
      <div className="relative overflow-hidden aspect-[3/4] bg-gray-50">
        <img
          src={product.images?.[0] || '/placeholder.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={toggleWishlist}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm"
        >
          <Heart
            size={16}
            className={liked ? 'fill-brand-600 text-brand-600' : 'text-gray-400'}
          />
        </button>
        {product.deliveryTime && (
          <span className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            ⚡ {product.deliveryTime} min
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="text-xs text-gray-400 mb-0.5">{product.storeName}</p>
        <p className="font-medium text-sm truncate">{product.name}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="font-semibold text-brand-600">₹{product.price.toLocaleString()}</p>
          {product.originalPrice > product.price && (
            <p className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</p>
          )}
        </div>
      </div>
    </div>
  )
}
