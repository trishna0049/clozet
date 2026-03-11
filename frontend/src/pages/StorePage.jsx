import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import ProductCard from '../components/product/ProductCard'

export default function StorePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [store, setStore] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/stores/${id}`),
      api.get(`/stores/${id}/products`)
    ]).then(([s, p]) => {
      setStore(s.data)
      setProducts(p.data.products)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex items-center justify-center h-screen text-4xl animate-spin">✦</div>
  if (!store) return <div className="text-center py-20 text-ink/50">Store not found</div>

  return (
    <div>
      {/* Cover */}
      <div className="relative">
        <div className="h-40 bg-gradient-to-br from-brand-200 to-brand-400 overflow-hidden">
          {store.coverImage && <img src={store.coverImage} alt="" className="w-full h-full object-cover" />}
        </div>
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center">←</button>
        <div className="absolute -bottom-6 left-4 w-16 h-16 rounded-xl bg-white shadow-md overflow-hidden flex items-center justify-center">
          {store.logo ? <img src={store.logo} alt="" className="w-full h-full object-cover" /> : <span className="text-3xl">🏪</span>}
        </div>
      </div>

      <div className="px-4 pt-9 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-ink">{store.name}</h1>
            <p className="text-sm text-ink/50 capitalize">{store.category}</p>
          </div>
          <div className="text-right">
            <p className="text-amber-600 font-medium">⭐ {store.rating?.toFixed(1)}</p>
            <p className="text-xs text-ink/40">{store.totalReviews} reviews</p>
          </div>
        </div>
        {store.description && <p className="mt-2 text-sm text-ink/70">{store.description}</p>}
        <div className="flex gap-3 mt-3">
          {store.expressDeliveryAvailable && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">⚡ Express in {store.expressDeliveryMinutes}min</span>}
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">↩️ {store.exchangeDays}-day exchange</span>
        </div>
      </div>

      <div className="px-4 pb-8">
        <h2 className="font-semibold text-ink mb-4">{products.length} Products</h2>
        <div className="grid grid-cols-2 gap-3">
          {products.map((p, i) => <ProductCard key={p._id} product={{ ...p, store }} index={i} />)}
        </div>
      </div>
    </div>
  )
}
