import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Heart, User, Search, MapPin } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { useLocationStore } from '../../store/locationStore'

export default function Navbar() {
  const navigate = useNavigate()
  const { items } = useCartStore()
  const { address } = useLocationStore()
  const cartCount = items.reduce((s, i) => s + i.quantity, 0)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 md:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Logo */}
        <Link to="/home" className="font-display text-2xl font-bold text-brand-600 mr-4">
          Clozet
        </Link>

        {/* Location */}
        <button
          onClick={() => navigate('/home')}
          className="hidden md:flex items-center gap-1 text-sm text-gray-600 hover:text-brand-600"
        >
          <MapPin size={14} />
          <span className="max-w-[160px] truncate">{address || 'Set Location'}</span>
        </button>

        {/* Search */}
        <div
          className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 cursor-pointer hover:bg-gray-100 transition"
          onClick={() => navigate('/search')}
        >
          <Search size={16} className="text-gray-400" />
          <span className="text-sm text-gray-400">Search products, stores...</span>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/wishlist')} className="p-2 hover:bg-gray-50 rounded-full">
            <Heart size={20} className="text-gray-600" />
          </button>
          <button onClick={() => navigate('/cart')} className="relative p-2 hover:bg-gray-50 rounded-full">
            <ShoppingCart size={20} className="text-gray-600" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => navigate('/account')} className="p-2 hover:bg-gray-50 rounded-full">
            <User size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Bottom nav tabs */}
      <div className="flex gap-1 mt-2 max-w-7xl mx-auto">
        {[
          { label: 'Home', path: '/home' },
          { label: 'Products', path: '/products' },
          { label: 'Stores', path: '/stores' },
          { label: 'Orders', path: '/orders' },
        ].map((t) => (
          <Link
            key={t.path}
            to={t.path}
            className="text-sm px-4 py-1 rounded-full text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition"
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
