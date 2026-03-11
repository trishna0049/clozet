import { useAuthStore } from '../store/authStore'
import { Link, useNavigate } from 'react-router-dom'

const menuItems = [
  { icon: '📦', label: 'My Orders', path: '/orders' },
  { icon: '♡', label: 'Wishlist', path: '/wishlist' },
  { icon: '📍', label: 'Saved Addresses', path: '/account/addresses' },
  { icon: '💳', label: 'Payment Methods', path: '/account/payments' },
  { icon: '🔔', label: 'Notifications', path: '/account/notifications' },
  { icon: '⚙️', label: 'Settings', path: '/account/settings' },
]

export default function AccountPage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-200 flex items-center justify-center overflow-hidden">
          {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">👤</span>}
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-ink">{user?.name || 'User'}</h2>
          <p className="text-sm text-ink/50">{user?.phone || user?.email}</p>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
        {menuItems.map((item, i) => (
          <Link key={item.path} to={item.path}
            className={`flex items-center gap-4 px-5 py-4 hover:bg-brand-50 transition-colors ${i < menuItems.length - 1 ? 'border-b border-brand-50' : ''}`}>
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium text-ink text-sm">{item.label}</span>
            <span className="ml-auto text-ink/30">›</span>
          </Link>
        ))}
      </div>

      {/* Store Owner CTA */}
      <div className="bg-gradient-to-r from-brand-700 to-brand-500 rounded-2xl p-4 mb-4 text-white">
        <h3 className="font-semibold">Own a fashion store?</h3>
        <p className="text-xs text-brand-200 mt-0.5 mb-3">Partner with Clozet and reach customers nearby</p>
        <Link to="/store/register" className="inline-block bg-white text-brand-700 text-xs font-semibold px-4 py-2 rounded-full hover:bg-brand-50 transition-colors">
          Register your store →
        </Link>
      </div>

      <button onClick={handleLogout} className="w-full border border-red-200 text-red-500 py-3 rounded-xl font-medium text-sm hover:bg-red-50 transition-colors">
        Sign Out
      </button>
    </div>
  )
}
