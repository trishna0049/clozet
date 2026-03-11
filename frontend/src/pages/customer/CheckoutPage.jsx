import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Navbar from '../../components/common/Navbar'
import { useCartStore } from '../../store/cartStore'
import { createOrder, createPaymentOrder, verifyPayment } from '../../services/api'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCartStore()
  const [address, setAddress] = useState({ line1: '', city: '', pincode: '' })
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [loading, setLoading] = useState(false)
  const deliveryFee = 49
  const grandTotal = total + deliveryFee

  const loadRazorpay = () =>
    new Promise((res) => {
      const s = document.createElement('script')
      s.src = 'https://checkout.razorpay.com/v1/checkout.js'
      s.onload = () => res(true)
      s.onerror = () => res(false)
      document.body.appendChild(s)
    })

  const handlePlaceOrder = async () => {
    if (!address.line1 || !address.city || !address.pincode)
      return toast.error('Fill delivery address')
    setLoading(true)

    try {
      if (paymentMethod === 'cod') {
        const { data } = await createOrder({
          items: items.map(i => ({ product: i.product._id, size: i.size, color: i.color, quantity: i.quantity })),
          deliveryAddress: address,
          paymentMethod: 'cod',
          totalAmount: grandTotal,
        })
        clearCart()
        navigate('/track/' + data.order._id)
        toast.success('Order placed!')
        return
      }

      const ok = await loadRazorpay()
      if (!ok) return toast.error('Razorpay failed to load')

      const { data: rzpOrder } = await createPaymentOrder(grandTotal)

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: 'INR',
        name: 'Clozet',
        description: 'Fashion Delivery',
        order_id: rzpOrder.id,
        handler: async (response) => {
          const verified = await verifyPayment(response)
          const { data } = await createOrder({
            items: items.map(i => ({ product: i.product._id, size: i.size, color: i.color, quantity: i.quantity })),
            deliveryAddress: address,
            paymentMethod: 'online',
            razorpayPaymentId: response.razorpay_payment_id,
            totalAmount: grandTotal,
          })
          clearCart()
          navigate('/track/' + data.order._id)
          toast.success('Payment successful!')
        },
        prefill: {},
        theme: { color: '#db2777' },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (e) {
      toast.error('Order failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
        <h1 className="font-display text-2xl font-bold">Checkout</h1>

        {/* Delivery Address */}
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold">Delivery Address</h2>
          <input className="input-field" placeholder="Address Line 1" value={address.line1}
            onChange={e => setAddress({ ...address, line1: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder="City" value={address.city}
              onChange={e => setAddress({ ...address, city: e.target.value })} />
            <input className="input-field" placeholder="Pincode" value={address.pincode}
              onChange={e => setAddress({ ...address, pincode: e.target.value })} />
          </div>
        </div>

        {/* Delivery Mode */}
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Delivery Mode</h2>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3">
            <p className="font-medium text-sm">⚡ Express Delivery</p>
            <p className="text-xs text-gray-500">Delivered in under 60 minutes</p>
          </div>
        </div>

        {/* Payment */}
        <div className="card p-5">
          <h2 className="font-semibold mb-3">Payment Method</h2>
          <div className="space-y-2">
            {[
              { id: 'razorpay', label: '💳 UPI / Card / Wallet (Razorpay)' },
              { id: 'cod', label: '💵 Cash on Delivery' },
            ].map(m => (
              <label key={m.id} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-gray-50">
                <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id}
                  onChange={() => setPaymentMethod(m.id)} />
                <span className="text-sm">{m.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="card p-5 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>₹{total.toLocaleString()}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Delivery</span><span>₹{deliveryFee}</span></div>
          <div className="flex justify-between font-semibold border-t pt-2">
            <span>Total</span>
            <span className="text-brand-600">₹{grandTotal.toLocaleString()}</span>
          </div>
        </div>

        <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary w-full text-base py-4">
          {loading ? 'Processing...' : `Place Order – ₹${grandTotal.toLocaleString()}`}
        </button>
      </div>
    </div>
  )
}
