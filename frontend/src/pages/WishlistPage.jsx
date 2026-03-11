// WishlistPage.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import ProductCard from '../components/product/ProductCard'

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([])

  useEffect(() => { api.get('/wishlist').then(r => setWishlist(r.data.products || [])) }, [])

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="font-display text-3xl font-bold text-ink mb-6">Saved Items</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">♡</div>
          <p className="text-ink/50">No saved items</p>
          <Link to="/products" className="mt-4 inline-block text-brand-600 font-medium">Browse Fashion →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {wishlist.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
        </div>
      )}
    </div>
  )
}
