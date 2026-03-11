import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import { useCartStore } from '../store/cartStore'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const addToCart = useCartStore(s => s.addToCart)
  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    api.get(`/products/${id}`).then(r => {
      setProduct(r.data)
      if (r.data.variants?.[0]) {
        setSelectedSize(r.data.variants[0].size)
        setSelectedColor(r.data.variants[0].color)
      }
    }).finally(() => setLoading(false))
  }, [id])

  const sizes = [...new Set(product?.variants?.map(v => v.size).filter(Boolean))]
  const colors = [...new Set(product?.variants?.filter(v => !selectedSize || v.size === selectedSize).map(v => v.color).filter(Boolean))]
  const selectedVariant = product?.variants?.find(v => v.size === selectedSize && v.color === selectedColor)
  const inStock = (selectedVariant?.stock || 0) > 0

  const handleAddToCart = async () => {
    if (sizes.length && !selectedSize) return toast.error('Select a size')
    setAdding(true)
    try {
      await addToCart({
        productId: product._id,
        storeId: product.store._id,
        size: selectedSize,
        color: selectedColor,
        quantity: 1,
        price: product.discountPrice || product.basePrice,
      })
      toast.success('Added to cart!')
    } catch { toast.error('Failed to add') }
    finally { setAdding(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-4xl animate-spin">✦</div></div>
  if (!product) return <div className="text-center py-20 text-ink/50">Product not found</div>

  return (
    <div>
      {/* Image Gallery */}
      <div className="relative bg-brand-50">
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-10 w-9 h-9 bg-white rounded-full shadow flex items-center justify-center">←</button>
        <div className="aspect-[4/5] overflow-hidden">
          {product.images?.[selectedImage] ? (
            <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
          ) : <div className="w-full h-full flex items-center justify-center text-8xl">👗</div>}
        </div>
        {product.images?.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setSelectedImage(i)}
                className={`w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-brand-500' : 'border-transparent'}`}>
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="px-4 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-brand-600 text-sm font-medium">{product.store?.name}</p>
            <h1 className="font-display text-2xl font-bold text-ink mt-1">{product.name}</h1>
          </div>
          <div className="text-right">
            <p className="font-bold text-xl text-ink">₹{product.discountPrice || product.basePrice}</p>
            {product.discountPrice && <p className="text-xs text-ink/40 line-through">₹{product.basePrice}</p>}
          </div>
        </div>

        {product.store?.rating && (
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm text-amber-600">⭐ {product.rating?.toFixed(1) || '4.5'} ({product.totalReviews || 0} reviews)</span>
            {product.store?.expressDeliveryAvailable && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">⚡ Express in {product.store.expressDeliveryMinutes}min</span>
            )}
          </div>
        )}

        {/* Size Selector */}
        {sizes.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-2">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map(s => (
                <button key={s} onClick={() => setSelectedSize(s)}
                  className={`min-w-[48px] px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${selectedSize === s ? 'bg-ink text-white border-ink' : 'border-brand-200 text-ink/70 hover:border-brand-500'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selector */}
        {colors.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-2">Color: <span className="text-ink capitalize">{selectedColor}</span></p>
            <div className="flex flex-wrap gap-2">
              {product.variants?.filter((v, i, a) => a.findIndex(x => x.color === v.color) === i).map(v => (
                <button key={v.color} onClick={() => setSelectedColor(v.color)}
                  className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColor === v.color ? 'border-brand-600 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: v.colorHex || '#ccc' }}
                  title={v.color} />
              ))}
            </div>
          </div>
        )}

        {/* Material & Care */}
        {product.material && (
          <div className="mt-5 bg-brand-50 rounded-xl p-4">
            <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mb-1">Material</p>
            <p className="text-sm text-ink">{product.material}</p>
            {product.careInstructions && <>
              <p className="text-xs font-medium text-ink/50 uppercase tracking-wider mt-3 mb-1">Care</p>
              <p className="text-sm text-ink">{product.careInstructions}</p>
            </>}
          </div>
        )}

        {/* Store Exchange Policy */}
        {product.store?.exchangeDays && (
          <p className="mt-3 text-xs text-green-600">↩️ {product.store.exchangeDays}-day exchange policy</p>
        )}

        {/* Description */}
        {product.description && (
          <p className="mt-4 text-sm text-ink/70 leading-relaxed">{product.description}</p>
        )}
      </div>

      {/* Sticky Add to Cart */}
      <div className="sticky bottom-20 px-4 py-3 bg-cream border-t border-brand-100">
        <div className="flex gap-3">
          <button onClick={handleAddToCart} disabled={!inStock || adding}
            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-2xl font-semibold transition-colors disabled:opacity-40">
            {!inStock ? 'Out of Stock' : adding ? 'Adding...' : '+ Add to Cart'}
          </button>
          <button onClick={async () => { await handleAddToCart(); navigate('/cart') }}
            disabled={!inStock || adding}
            className="flex-1 bg-ink text-white py-4 rounded-2xl font-semibold transition-colors disabled:opacity-40">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  )
}
