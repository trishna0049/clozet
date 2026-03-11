import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import api from '../utils/api'
import ProductCard from '../components/product/ProductCard'
import StoreCard from '../components/store/StoreCard'

export default function SearchPage() {
  const location = useAuthStore(s => s.location)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ products: [], stores: [] })
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q) => {
    if (!q.trim()) return setResults({ products: [], stores: [] })
    setLoading(true)
    try {
      const params = new URLSearchParams({ q })
      if (location) { params.set('lat', location.lat); params.set('lng', location.lng) }
      const { data } = await api.get(`/search?${params}`)
      setResults(data)
    } finally { setLoading(false) }
  }, [location])

  const handleChange = (e) => {
    setQuery(e.target.value)
    clearTimeout(window._searchTimer)
    window._searchTimer = setTimeout(() => search(e.target.value), 400)
  }

  return (
    <div className="px-4 pt-6 pb-8">
      <div className="flex items-center gap-3 mb-6">
        <input value={query} onChange={handleChange} autoFocus
          className="flex-1 border border-brand-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 bg-white shadow-sm"
          placeholder="Search products, brands, stores..." />
        {query && <button onClick={() => { setQuery(''); setResults({ products: [], stores: [] }) }} className="text-ink/40">✕</button>}
      </div>

      {loading && <div className="text-center py-10 text-4xl animate-spin">✦</div>}

      {!loading && results.stores.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-ink mb-3">Stores</h3>
          <div className="flex flex-col gap-2">
            {results.stores.map((s, i) => <StoreCard key={s._id} store={s} index={i} />)}
          </div>
        </div>
      )}

      {!loading && results.products.length > 0 && (
        <div>
          <h3 className="font-semibold text-ink mb-3">Products</h3>
          <div className="grid grid-cols-2 gap-3">
            {results.products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
          </div>
        </div>
      )}

      {!loading && query && results.products.length === 0 && results.stores.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-ink/50">No results for "{query}"</p>
          <p className="text-xs text-ink/30 mt-1">Try different keywords or check your location</p>
        </div>
      )}

      {!query && (
        <div>
          <p className="text-xs font-medium text-ink/40 uppercase tracking-wider mb-3">Popular Searches</p>
          <div className="flex flex-wrap gap-2">
            {['Kurti', 'Jeans', 'Saree', 'Sneakers', 'Jacket', 'Dress', 'T-shirt', 'Ethnic'].map(t => (
              <button key={t} onClick={() => { setQuery(t); search(t) }}
                className="px-4 py-2 rounded-full bg-brand-50 text-brand-700 text-sm font-medium hover:bg-brand-100 transition-colors">
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
