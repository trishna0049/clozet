import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { io } from 'socket.io-client'
import { CheckCircle, Circle, Phone, MapPin } from 'lucide-react'
import Navbar from '../../components/common/Navbar'
import { getOrder } from '../../services/api'

const STEPS = [
  { key: 'placed', label: 'Order Placed' },
  { key: 'accepted', label: 'Order Accepted' },
  { key: 'picked', label: 'Picked Up' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
]

export default function OrderTracking() {
  const { orderId } = useParams()
  const [status, setStatus] = useState('placed')
  const [driver, setDriver] = useState(null)

  const { data: order } = useQuery(
    ['order', orderId],
    () => getOrder(orderId).then(r => r.data.order),
    {
      onSuccess: (data) => {
        setStatus(data.status)
        setDriver(data.deliveryPartner)
      }
    }
  )

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000')
    socket.emit('joinOrderRoom', orderId)
    socket.on('orderStatusUpdate', ({ status: newStatus, driver: driverInfo }) => {
      setStatus(newStatus)
      if (driverInfo) setDriver(driverInfo)
    })
    return () => socket.disconnect()
  }, [orderId])

  const currentStep = STEPS.findIndex(s => s.key === status)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Live Tracking</h1>
          <p className="text-gray-500 text-sm">Order #{orderId?.slice(-6).toUpperCase()}</p>
        </div>

        {/* Status Timeline */}
        <div className="card p-6">
          <div className="space-y-4">
            {STEPS.map((step, i) => {
              const done = i <= currentStep
              const active = i === currentStep
              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    done ? 'bg-brand-600' : 'bg-gray-100'
                  }`}>
                    {done
                      ? <CheckCircle size={16} className="text-white" />
                      : <Circle size={16} className="text-gray-300" />
                    }
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`absolute ml-4 mt-8 w-0.5 h-8 ${done ? 'bg-brand-200' : 'bg-gray-100'}`} />
                  )}
                  <div>
                    <p className={`font-medium text-sm ${active ? 'text-brand-600' : done ? 'text-gray-800' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {active && (
                      <p className="text-xs text-brand-500 animate-pulse">In progress...</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Delivery Partner */}
        {driver && (
          <div className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🛵</span>
              </div>
              <div>
                <p className="font-semibold text-sm">{driver.name}</p>
                <p className="text-xs text-gray-500">Your delivery partner</p>
              </div>
            </div>
            <a href={`tel:${driver.phone}`} className="btn-outline py-2 px-4 flex items-center gap-2 text-sm">
              <Phone size={14} /> Call
            </a>
          </div>
        )}

        {/* Order Items */}
        {order && (
          <div className="card p-4">
            <h2 className="font-semibold mb-3">Order Items</h2>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <img src={item.product?.images?.[0]} className="w-14 h-14 rounded-xl object-cover" />
                  <div>
                    <p className="text-sm font-medium">{item.product?.name}</p>
                    <p className="text-xs text-gray-400">Size: {item.size} | Qty: {item.quantity}</p>
                    <p className="text-sm font-semibold text-brand-600">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
