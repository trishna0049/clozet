import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Customer pages
import LandingPage from './pages/customer/LandingPage'
import LoginPage from './pages/customer/LoginPage'
import OTPPage from './pages/customer/OTPPage'
import ProfileSetup from './pages/customer/ProfileSetup'
import HomePage from './pages/customer/HomePage'
import ProductBrowse from './pages/customer/ProductBrowse'
import StoreBrowse from './pages/customer/StoreBrowse'
import StoreDetail from './pages/customer/StoreDetail'
import ProductDetail from './pages/customer/ProductDetail'
import CartPage from './pages/customer/CartPage'
import CheckoutPage from './pages/customer/CheckoutPage'
import OrderTracking from './pages/customer/OrderTracking'
import OrderHistory from './pages/customer/OrderHistory'
import WishlistPage from './pages/customer/WishlistPage'
import AccountPage from './pages/customer/AccountPage'
import SearchPage from './pages/customer/SearchPage'

// Store owner pages
import StoreLogin from './pages/store/StoreLogin'
import StoreDashboard from './pages/store/StoreDashboard'
import StoreInventory from './pages/store/StoreInventory'
import StoreOrders from './pages/store/StoreOrders'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'

// Guards
const PrivateRoute = ({ children }) => {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/verify-otp" element={<OTPPage />} />
      <Route path="/setup-profile" element={<ProfileSetup />} />

      {/* Customer (protected) */}
      <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
      <Route path="/products" element={<PrivateRoute><ProductBrowse /></PrivateRoute>} />
      <Route path="/stores" element={<PrivateRoute><StoreBrowse /></PrivateRoute>} />
      <Route path="/stores/:storeId" element={<PrivateRoute><StoreDetail /></PrivateRoute>} />
      <Route path="/products/:productId" element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
      <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
      <Route path="/checkout" element={<PrivateRoute><CheckoutPage /></PrivateRoute>} />
      <Route path="/track/:orderId" element={<PrivateRoute><OrderTracking /></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
      <Route path="/wishlist" element={<PrivateRoute><WishlistPage /></PrivateRoute>} />
      <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
      <Route path="/search" element={<PrivateRoute><SearchPage /></PrivateRoute>} />

      {/* Store */}
      <Route path="/store/login" element={<StoreLogin />} />
      <Route path="/store/dashboard" element={<StoreDashboard />} />
      <Route path="/store/inventory" element={<StoreInventory />} />
      <Route path="/store/orders" element={<StoreOrders />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  )
}
