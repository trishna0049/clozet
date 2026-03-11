import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import ProductCard from '../components/product/ProductCard'
import { useAuthStore } from '../store/authStore'

const CATEGORIES = ['clothing', 'footwear', 'accessories']
const GENDERS = ['men', 'women', 'unisex', 'kids']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34']

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useAuthStore(s => s.location)
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    gender: searchParams.get('gender') || '',
    minPrice: '', maxPrice: '',
    size: '', color: '',
  })

  const fetchProducts = useCallback(async (pg = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: pg, limit: 20, ...filters })
      if (location) { params.set('lat', location.lat); params.set('lng', location.lng) }
      const { data } = await api.get(`/products?${params}`)
      setProducts(pg === 1 ? data.products : prev => [...prev, ...data.products])
      setTotal(data.total)
    } finally { setLoading(false) }
  }, [filters, location])

  useEffect(() => { setPage(1); fetchProducts(1) }, [filters])

  const applyFilter = (key, val) => setFilters(f => ({ ...f, [key]: f[key] === val ? '' : val }))

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Shop</h1>
          <p className="text-xs text-ink/40">{total} items found</p>
        </div>
        <button onClick={() => setShowFilters(v => !v)}
          className="flex items-center gap-2 border border-brand-200 rounded-xl px-4 py-2 text-sm font-medium text-ink/70 hover:border-brand-400 transition-colors">
          <span>⚙️</span> Filters
          {Object.values(filters).some(Boolean) && <span className="w-2 h-2 rounded-full bg-brand-500" />}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-white rounded-2xl p-4 mb-4 shadow-sm overflow-hidden">
          <div className="mb-4">
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => applyFilter('category', c)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${filters.category === c ? 'bg-brand-600 text-white border-brand-600' : 'border-brand-200 text-ink/60'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-2">Gender</p>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map(g => (
                <button key={g} onClick={() => applyFilter('gender', g)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${filters.gender === g ? 'bg-brand-600 text-white border-brand-600' : 'border-brand-200 text-ink/60'}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {SIZES.map(s => (
                <button key={s} onClick={() => applyFilter('size', s)}
                  className={`w-12 py-1.5 rounded-lg text-sm border transition-colors ${filters.size === s ? 'bg-brand-600 text-white border-brand-600' : 'border-brand-200 text-ink/60'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-1">Min Price</p>
              <input type="number" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                className="w-full border border-brand-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500" placeholder="₹0" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-1">Max Price</p>
              <input type="number" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                className="w-full border border-brand-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-500" placeholder="₹99999" />
            </div>
          </div>
          <button onClick={() => setFilters({ category: '', gender: '', minPrice: '', maxPrice: '', size: '', color: '' })}
            className="mt-3 text-xs text-brand-600 font-medium">Clear all filters</button>
        </motion.div>
      )}

      {loading && products.length === 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-64 bg-brand-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {products.map((p, i) => <ProductCard key={p._id} product={p} index={i % 6} />)}
          </div>
          {products.length < total && (
            <button onClick={() => { const next = page + 1; setPage(next); fetchProducts(next) }}
              className="w-full mt-6 py-3 border border-brand-200 rounded-xl text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors">
              {loading ? 'Loading...' : 'Load more'}
            </button>
          )}
        </>
      )}
    </div>
  )
}
