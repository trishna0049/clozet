import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Minus } from 'lucide-react'
import Navbar from '../../components/common/Navbar'
import { useCartStore } from '../../store/cartStore'

export default function CartPage() {
  const navigate = useNavigate()
  const { items, removeItem, updateQty, total } = useCartStore()

  const deliveryFee = items.length > 0 ? 49 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="font-display text-2xl font-bold mb-6">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <button onClick={() => navigate('/products')} className="btn-primary">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.key} className="card p-4 flex gap-4">
                <img
                  src={item.product.images?.[0]}
                  alt={item.product.name}
                  className="w-20 h-24 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <p className="text-xs text-gray-400">{item.product.storeName}</p>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-gray-500">Size: {item.size} | Color: {item.color || 'N/A'}</p>
                  <p className="text-brand-600 font-semibold mt-1">₹{(item.product.price * item.quantity).toLocaleString()}</p>

                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => updateQty(item.key, item.quantity - 1)} className="p-1 rounded-full border hover:bg-gray-50">
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQty(item.key, item.quantity + 1)} className="p-1 rounded-full border hover:bg-gray-50">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button onClick={() => removeItem(item.key)} className="text-gray-400 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            {/* Summary */}
            <div className="card p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span>₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                <span>Total</span>
                <span className="text-brand-600">₹{(total + deliveryFee).toLocaleString()}</span>
              </div>
            </div>

            <button onClick={() => navigate('/checkout')} className="btn-primary w-full text-base py-4">
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
