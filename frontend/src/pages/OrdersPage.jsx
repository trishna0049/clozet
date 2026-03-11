import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  picked_up: 'bg-purple-100 text-purple-700',
  out_for_delivery: 'bg-brand-100 text-brand-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders').then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-screen text-4xl animate-spin">✦</div>

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="font-display text-3xl font-bold text-ink mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-ink/50">No orders yet</p>
          <Link to="/products" className="mt-4 inline-block text-brand-600 font-medium">Start Shopping →</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order, i) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-mono text-xs text-brand-600">#{order.orderNumber}</p>
                  <p className="text-xs text-ink/40">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {order.status?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex gap-2 mb-3">
                {order.items?.slice(0, 3).map(item => (
                  <div key={item._id} className="w-14 h-14 rounded-lg bg-brand-50 overflow-hidden">
                    {item.product?.images?.[0] ? <img src={item.product.images[0]} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center">👗</div>}
                  </div>
                ))}
                {order.items?.length > 3 && <div className="w-14 h-14 rounded-lg bg-brand-100 flex items-center justify-center text-sm text-ink/60">+{order.items.length - 3}</div>}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink/60">{order.store?.name}</p>
                  <p className="font-bold text-ink">₹{order.total}</p>
                </div>
                <div className="flex gap-2">
                  {['pending', 'confirmed', 'preparing', 'picked_up', 'out_for_delivery'].includes(order.status) && (
                    <Link to={`/track/${order._id}`} className="text-xs bg-brand-100 text-brand-700 px-3 py-1.5 rounded-full font-medium hover:bg-brand-200 transition-colors">Track</Link>
                  )}
                  {order.status === 'delivered' && (
                    <Link to={`/orders/${order._id}/review`} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-medium">Review</Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
