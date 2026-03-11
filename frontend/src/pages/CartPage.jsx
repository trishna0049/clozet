import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

export default function CartPage() {
  const { cart, loading, fetchCart, updateItem, removeItem } = useCartStore()
  const navigate = useNavigate()

  useEffect(() => { fetchCart() }, [])

  const items = cart?.items || []
  const subtotal = items.reduce((s, i) => s + (i.priceAtAdd * i.quantity), 0)
  const delivery = 0
  const total = subtotal + delivery

  if (loading) return <div className="flex items-center justify-center h-screen text-4xl animate-spin">✦</div>

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="font-display text-3xl font-bold text-ink mb-6">Your Bag</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🛍</div>
          <h3 className="font-display text-xl text-ink mb-2">Your bag is empty</h3>
          <p className="text-ink/50 text-sm mb-6">Discover fashion near you</p>
          <Link to="/products" className="bg-brand-600 text-white px-6 py-3 rounded-full font-medium hover:bg-brand-700 transition-colors">
            Start Shopping →
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 mb-6">
            {items.map((item, i) => (
              <motion.div key={item._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm">
                <div className="w-24 h-28 rounded-xl bg-brand-100 overflow-hidden flex-shrink-0">
                  {item.product?.images?.[0] ? (
                    <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : <div className="w-full h-full flex items-center justify-center text-3xl">👗</div>}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-brand-600 font-medium">{item.store?.name}</p>
                  <h3 className="font-medium text-ink mt-0.5 leading-tight">{item.product?.name}</h3>
                  <div className="flex gap-2 mt-1">
                    {item.size && <span className="text-xs bg-brand-50 text-ink/60 px-2 py-0.5 rounded-full">{item.size}</span>}
                    {item.color && <span className="text-xs bg-brand-50 text-ink/60 px-2 py-0.5 rounded-full capitalize">{item.color}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-bold text-ink">₹{item.priceAtAdd * item.quantity}</span>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateItem(item._id, item.quantity - 1)}
                        className="w-7 h-7 rounded-full border border-brand-200 flex items-center justify-center text-ink/60 hover:border-brand-500">−</button>
                      <span className="font-mono text-sm w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateItem(item._id, item.quantity + 1)}
                        className="w-7 h-7 rounded-full border border-brand-200 flex items-center justify-center text-ink/60 hover:border-brand-500">+</button>
                      <button onClick={() => removeItem(item._id)} className="text-red-400 text-sm ml-1">🗑</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
            <h3 className="font-semibold text-ink mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-ink/60">Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between"><span className="text-ink/60">Delivery</span><span className="text-green-600">Free</span></div>
              <div className="border-t border-brand-100 pt-2 flex justify-between font-bold"><span>Total</span><span>₹{total}</span></div>
            </div>
          </div>

          <button onClick={() => navigate('/checkout')}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-2xl font-semibold text-lg transition-colors">
            Proceed to Checkout →
          </button>
        </>
      )}
    </div>
  )
}
