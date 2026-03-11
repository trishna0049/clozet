import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) useAuthStore.getState().logout()
    return Promise.reject(err)
  }
)

// Auth
export const sendOTP = (contact) => api.post('/auth/send-otp', { contact })
export const verifyOTP = (contact, otp) => api.post('/auth/verify-otp', { contact, otp })
export const googleLogin = (credential) => api.post('/auth/google', { credential })
export const setupProfile = (data) => api.put('/auth/profile', data)

// Products
export const getProducts = (params) => api.get('/products', { params })
export const getProduct = (id) => api.get('/products/' + id)
export const searchProducts = (q, filters) => api.get('/products/search', { params: { q, ...filters } })

// Stores
export const getNearbyStores = (lat, lng, radius = 15) =>
  api.get('/stores/nearby', { params: { lat, lng, radius } })
export const getStore = (id) => api.get('/stores/' + id)
export const getStoreProducts = (id, params) => api.get('/stores/' + id + '/products', { params })

// Orders
export const createOrder = (data) => api.post('/orders', data)
export const getOrder = (id) => api.get('/orders/' + id)
export const getMyOrders = () => api.get('/orders/me')

// Wishlist
export const getWishlist = () => api.get('/wishlist')
export const addToWishlist = (productId) => api.post('/wishlist', { productId })
export const removeFromWishlist = (productId) => api.delete('/wishlist/' + productId)

// Payments
export const createPaymentOrder = (amount) => api.post('/payments/create-order', { amount })
export const verifyPayment = (data) => api.post('/payments/verify', data)

// Reviews
export const submitReview = (orderId, data) => api.post('/orders/' + orderId + '/review', data)

export default api
