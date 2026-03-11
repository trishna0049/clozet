import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartStore } from '../store/cartStore'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import toast from 'react-hot-toast'

const loadRazorpay = () => new Promise(res => {
  if (window.Razorpay) return res(true)
  const s = document.createElement('script')
  s.src = 'https://checkout.razorpay.com/v1/checkout.js'
  s.onload = () => res(true); s.onerror = () => res(false)
  document.body.appendChild(s)
})

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const [address, setAddress] = useState({ line1: '', city: '', state: '', pincode: '' })
  const [deliveryType, setDeliveryType] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('upi')
  const [loading, setLoading] = useState(false)
  const [useExisting, setUseExisting] = useState(null)

  const items = cart?.items || []
  const subtotal = items.reduce((s, i) => s + i.priceAtAdd * i.quantity, 0)
  const deliveryCharge = deliveryType === 'express' ? 49 : 0
  const total = subtotal + deliveryCharge

  useEffect(() => {
    if (user?.savedAddresses?.length) setUseExisting(user.savedAddresses.find(a => a.isDefault) || user.savedAddresses[0])
  }, [user])

  const handlePlaceOrder = async () => {
    const deliveryAddress = useExisting || address
    if (!deliveryAddress.line1 || !deliveryAddress.city) return toast.error('Enter delivery address')
    setLoading(true)

    try {
      const orderItems = items.map(i => ({
        product: i.product._id, store: i.store._id,
        name: i.product.name, image: i.product.images?.[0],
        size: i.size, color: i.color,
        quantity: i.quantity, price: i.priceAtAdd,
      }))

      const { data } = await api.post('/orders', { items: orderItems, deliveryAddress, deliveryType })
      const { order, razorpayOrderId, razorpayKey } = data

      if (paymentMethod === 'cod') {
        await api.post('/orders/verify-payment', { orderId: order._id, razorpayPaymentId: 'cod', razorpaySignature: 'cod' })
        await clearCart()
        navigate(`/order-confirm/${order._id}`)
        return
      }

      await loadRazorpay()
      const rzp = new window.Razorpay({
        key: razorpayKey || import.meta.env.VITE_RAZORPAY_KEY_ID,
        order_id: razorpayOrderId,
        amount: total * 100,
        currency: 'INR',
        name: 'Clozet',
        description: 'Fashion Order',
        prefill: { name: user.name, contact: user.phone, email: user.email },
        handler: async (response) => {
          try {
            await api.post('/orders/verify-payment', {
              orderId: order._id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
            await clearCart()
            navigate(`/order-confirm/${order._id}`)
          } catch { toast.error('Payment verification failed') }
        },
        modal: { ondismiss: () => toast('Payment cancelled') },
        theme: { color: '#a020cc' },
      })
      rzp.open()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 pt-6 pb-8">
      <button onClick={() => navigate(-1)} className="text-brand-600 text-sm mb-4">← Back to cart</button>
      <h1 className="font-display text-3xl font-bold text-ink mb-6">Checkout</h1>

      {/* Delivery Address */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="font-semibold text-ink mb-3">📍 Delivery Address</h3>
        {user?.savedAddresses?.length > 0 && (
          <div className="mb-3">
            {user.savedAddresses.map(addr => (
              <button key={addr._id} onClick={() => setUseExisting(addr)}
                className={`w-full text-left p-3 rounded-xl border mb-2 transition-colors ${useExisting?._id === addr._id ? 'border-brand-500 bg-brand-50' : 'border-brand-100'}`}>
                <p className="font-medium text-sm">{addr.label || 'Address'}</p>
                <p className="text-xs text-ink/60">{addr.line1}, {addr.city}</p>
              </button>
            ))}
            <button onClick={() => setUseExisting(null)} className="text-xs text-brand-600 font-medium">+ New Address</button>
          </div>
        )}
        {!useExisting && (
          <div className="grid grid-cols-2 gap-3">
            {[['line1', 'Street Address', 'col-span-2'], ['city', 'City'], ['state', 'State'], ['pincode', 'Pincode']].map(([k, ph, span]) => (
              <input key={k} value={address[k]} onChange={e => setAddress(a => ({ ...a, [k]: e.target.value }))}
                className={`${span || ''} border border-brand-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500`}
                placeholder={ph} />
            ))}
          </div>
        )}
      </div>

      {/* Delivery Type */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="font-semibold text-ink mb-3">🚀 Delivery Option</h3>
        <div className="grid grid-cols-2 gap-3">
          {[['standard', 'Standard', 'Free', '2 hrs'], ['express', 'Express ⚡', '₹49', '<1 hr']].map(([type, label, charge, time]) => (
            <button key={type} onClick={() => setDeliveryType(type)}
              className={`p-3 rounded-xl border-2 text-left transition-colors ${deliveryType === type ? 'border-brand-500 bg-brand-50' : 'border-brand-100'}`}>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-ink/50 mt-0.5">{time}</p>
              <p className="text-xs font-medium text-brand-600 mt-1">{charge}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Payment */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <h3 className="font-semibold text-ink mb-3">💳 Payment Method</h3>
        <div className="flex flex-col gap-2">
          {[['upi', '📱 UPI / Razorpay'], ['card', '💳 Credit/Debit Card'], ['wallet', '👛 Paytm / GPay'], ['cod', '💵 Cash on Delivery']].map(([val, label]) => (
            <button key={val} onClick={() => setPaymentMethod(val)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors text-sm ${paymentMethod === val ? 'border-brand-500 bg-brand-50' : 'border-brand-100'}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentMethod === val ? 'border-brand-500' : 'border-brand-200'}`}>
                {paymentMethod === val && <div className="w-2 h-2 rounded-full bg-brand-500" />}
              </div>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>₹{subtotal}</span></div>
          <div className="flex justify-between"><span className="text-ink/60">Delivery</span><span>{deliveryCharge ? `₹${deliveryCharge}` : 'Free'}</span></div>
          <div className="border-t border-brand-100 pt-2 flex justify-between font-bold text-base"><span>Total</span><span>₹{total}</span></div>
        </div>
      </div>

      <button onClick={handlePlaceOrder} disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-2xl font-bold text-lg transition-colors disabled:opacity-50">
        {loading ? 'Placing Order...' : `Place Order · ₹${total}`}
      </button>
    </div>
  )
}
