import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { io } from 'socket.io-client'
import api from '../utils/api'

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'picked_up', 'out_for_delivery', 'delivered']
const STATUS_LABELS = {
  pending: 'Order Placed',
  confirmed: 'Order Confirmed',
  preparing: 'Store Preparing',
  picked_up: 'Picked Up by Delivery Partner',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered 🎉',
}

export default function TrackingPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [partnerLocation, setPartnerLocation] = useState(null)

  useEffect(() => {
    api.get(`/tracking/${orderId}`).then(r => setOrder(r.data))

    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || '')
    socket.emit('join_order', orderId)
    socket.on('order_status', ({ status, note }) => {
      setOrder(prev => prev ? { ...prev, status, statusHistory: [...(prev.statusHistory || []), { status, note, timestamp: new Date() }] } : prev)
    })
    socket.on('location_update', ({ lat, lng }) => setPartnerLocation({ lat, lng }))
    return () => socket.disconnect()
  }, [orderId])

  const currentStep = STATUS_STEPS.indexOf(order?.status || 'pending')

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="font-display text-2xl font-bold text-ink mb-6">Live Tracking</h1>

      {/* Map placeholder */}
      <div className="bg-brand-100 rounded-2xl h-48 flex items-center justify-center mb-6 relative overflow-hidden">
        <div className="text-center">
          <p className="text-4xl mb-2">🗺</p>
          <p className="text-sm text-ink/50">
            {partnerLocation ? `Partner at ${partnerLocation.lat.toFixed(4)}, ${partnerLocation.lng.toFixed(4)}` : 'Map loading...'}
          </p>
          <p className="text-xs text-ink/40 mt-1">Integrate Google Maps with VITE_GOOGLE_MAPS_KEY</p>
        </div>
      </div>

      {/* Status Steps */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-ink mb-4">Order Status</h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-brand-100" />
          {STATUS_STEPS.map((step, i) => {
            const done = i <= currentStep
            const current = i === currentStep
            const historyEntry = order?.statusHistory?.findLast?.(h => h.status === step)
            return (
              <motion.div key={step} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className={`relative flex items-start gap-4 pb-5 ${i === STATUS_STEPS.length - 1 ? '' : ''}`}>
                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${done ? 'bg-brand-600 border-brand-600' : 'bg-white border-brand-200'}`}>
                  {done ? <span className="text-white text-xs">✓</span> : <span className="text-brand-200 text-xs">{i + 1}</span>}
                </div>
                <div className="pt-1">
                  <p className={`font-medium text-sm ${done ? 'text-ink' : 'text-ink/40'}`}>{STATUS_LABELS[step]}</p>
                  {historyEntry && <p className="text-xs text-ink/40 mt-0.5">{new Date(historyEntry.timestamp).toLocaleTimeString()}</p>}
                  {current && <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-xs text-brand-600 font-medium mt-0.5">● In progress</motion.p>}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Delivery Partner Info */}
      {order?.deliveryPartner && (
        <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-xl">🛵</div>
          <div className="flex-1">
            <p className="font-medium text-ink">{order.deliveryPartner.name}</p>
            <p className="text-xs text-ink/50">Your delivery partner</p>
          </div>
          <a href={`tel:${order.deliveryPartner.phone}`} className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 hover:bg-brand-200 transition-colors">📞</a>
        </div>
      )}
    </div>
  )
}
