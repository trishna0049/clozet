import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark text-white overflow-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6">
        <h1 className="font-display text-2xl tracking-tight">Clozet</h1>
        <button onClick={() => navigate('/login')} className="btn-primary text-sm">
          Get Started
        </button>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-brand-500 text-sm font-medium tracking-widest uppercase mb-4">
            Fashion. Delivered in Minutes.
          </p>
          <h2 className="font-display text-6xl md:text-8xl font-bold leading-tight mb-6">
            Your City's<br />
            <span className="text-brand-500">Wardrobe</span><br />
            At Your Door
          </h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto mb-10">
            Browse nearby stores, discover trending outfits, and receive fashion within the hour.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/login')} className="btn-primary text-base px-8 py-4">
              Start Shopping
            </button>
            <button onClick={() => navigate('/store/login')} className="btn-outline border-white text-white hover:bg-white/10 text-base px-8 py-4">
              List Your Store
            </button>
          </div>
        </motion.div>

        {/* Decorative floating cards */}
        <motion.div
          className="absolute left-8 top-1/4 bg-white/10 backdrop-blur rounded-2xl p-4 hidden md:block"
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <p className="text-xs text-gray-300">⚡ Express Delivery</p>
          <p className="text-white font-semibold">Under 60 min</p>
        </motion.div>
        <motion.div
          className="absolute right-8 top-1/3 bg-white/10 backdrop-blur rounded-2xl p-4 hidden md:block"
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 3.5 }}
        >
          <p className="text-xs text-gray-300">🏪 Stores Nearby</p>
          <p className="text-white font-semibold">Within 15 km</p>
        </motion.div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-20">
        {[
          { icon: '🗺️', title: 'Hyperlocal', desc: 'Real inventory from stores near you' },
          { icon: '⚡', title: 'Express Delivery', desc: 'Receive fashion in under an hour' },
          { icon: '💳', title: 'Secure Payments', desc: 'UPI, cards, wallets & COD' },
        ].map((f) => (
          <motion.div
            key={f.title}
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6"
          >
            <span className="text-4xl">{f.icon}</span>
            <h3 className="font-display text-xl mt-3 mb-2">{f.title}</h3>
            <p className="text-gray-400 text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </section>
    </div>
  )
}
