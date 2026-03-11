import { Outlet, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCartStore } from '../../store/cartStore'
import { useAuthStore } from '../../store/authStore'
import { useEffect } from 'react'

const navItems = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/products', icon: '👗', label: 'Shop' },
  { path: '/cart', icon: '🛍', label: 'Cart' },
  { path: '/wishlist', icon: '♡', label: 'Saved' },
  { path: '/account', icon: '👤', label: 'Account' },
]

export default function Layout() {
  const location = useLocation()
  const { fetchCart, cart } = useCartStore()
  const token = useAuthStore(s => s.token)
  const itemCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0

  useEffect(() => { if (token) fetchCart() }, [token])

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-brand-100 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl font-bold text-brand-700 italic">Clozet</Link>
        <Link to="/search" className="flex items-center gap-2 bg-white border border-brand-200 rounded-full px-4 py-2 text-sm text-ink/50 w-48">
          <span>🔍</span> Search fashion...
        </Link>
        <Link to="/orders" className="text-ink/60 hover:text-brand-600 text-sm font-medium">Orders</Link>
      </header>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-brand-100 flex items-center justify-around px-2 py-2 shadow-lg">
        {navItems.map(item => {
          const isActive = location.pathname === item.path
          return (
            <Link key={item.path} to={item.path} className="relative flex flex-col items-center gap-0.5 py-1 px-3 group">
              <span className={`text-xl transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </span>
              <span className={`text-xs font-medium transition-colors ${isActive ? 'text-brand-600' : 'text-ink/40'}`}>
                {item.label}
              </span>
              {item.path === '/cart' && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-mono">
                  {itemCount}
                </span>
              )}
              {isActive && <motion.div layoutId="nav-dot" className="absolute -bottom-1 w-1 h-1 rounded-full bg-brand-500" />}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
