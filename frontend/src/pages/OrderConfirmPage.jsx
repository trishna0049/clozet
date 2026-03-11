// OrderConfirmPage.jsx
import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'

export default function OrderConfirmPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)

  useEffect(() => { api.get(`/orders/${id}`).then(r => setOrder(r.data)) }, [id])

  return (
    <div className="px-4 pt-12 pb-8 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}
        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">✅</motion.div>
      <h1 className="font-display text-3xl font-bold text-ink">Order Confirmed!</h1>
      <p className="text-ink/50 mt-2 mb-1">Order ID: <span className="font-mono text-brand-600">{order?.orderNumber}</span></p>
      <p className="text-sm text-ink/50 mb-8">Estimated delivery: <strong>{order?.estimatedDeliveryTime} mins</strong></p>
      <p className="text-sm text-ink/60 mb-8">A confirmation will be sent to your registered phone/email.</p>
      <div className="flex flex-col gap-3">
        <Link to={`/track/${id}`} className="block bg-brand-600 text-white py-3 rounded-xl font-medium hover:bg-brand-700 transition-colors">📍 Track Order</Link>
        <Link to="/" className="block border border-brand-200 text-ink py-3 rounded-xl font-medium hover:bg-brand-50 transition-colors">Continue Shopping</Link>
      </div>
    </div>
  )
}
