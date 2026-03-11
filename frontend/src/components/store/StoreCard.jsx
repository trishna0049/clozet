import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function StoreCard({ store, index = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.07 }}>
      <Link to={`/stores/${store._id}`} className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="w-16 h-16 rounded-xl bg-brand-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {store.logo ? <img src={store.logo} alt={store.name} className="w-full h-full object-cover" /> : <span className="text-2xl">🏪</span>}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-ink">{store.name}</h3>
          <p className="text-xs text-ink/50 capitalize mt-0.5">{store.category}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-amber-600 font-medium">⭐ {store.rating?.toFixed(1) || '4.5'}</span>
            {store.expressDeliveryAvailable && <span className="text-xs text-green-600 font-medium">⚡ Express</span>}
          </div>
        </div>
        <span className="text-brand-400">→</span>
      </Link>
    </motion.div>
  )
}
