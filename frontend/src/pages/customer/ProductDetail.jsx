import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { ChevronLeft, Heart, ShoppingCart, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import Navbar from '../../components/common/Navbar'
import { getProduct } from '../../services/api'
import { useCartStore } from '../../store/cartStore'

export default function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCartStore()

  const { data: product, isLoading } = useQuery(
    ['product', productId],
    () => getProduct(productId).then(r => r.data.product)
  )

  const [selectedImg, setSelectedImg] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')

  const handleAddToCart = () => {
    if (!selectedSize) return toast.error('Select a size')
    if (product.colors?.length && !selectedColor) return toast.error('Select a color')
    addItem(product, selectedSize, selectedColor)
    toast.success('Added to cart!')
  }

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-96 bg-gray-200 rounded-2xl" />
        <div className="h-6 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 mb-4 hover:text-gray-800">
          <ChevronLeft size={18} /> Back
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={product.images?.[selectedImg]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              {product.images?.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-xl object-cover cursor-pointer border-2 transition ${i === selectedImg ? 'border-brand-600' : 'border-transparent'}`}
                />
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <p
                className="text-brand-600 text-sm cursor-pointer hover:underline"
                onClick={() => navigate('/stores/' + product.storeId)}
              >
                {product.storeName}
              </p>
              <h1 className="font-display text-3xl font-bold mt-1">{product.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-2xl font-semibold text-brand-600">₹{product.price?.toLocaleString()}</span>
                {product.originalPrice > product.price && (
                  <span className="text-gray-400 line-through">₹{product.originalPrice?.toLocaleString()}</span>
                )}
                {product.deliveryTime && (
                  <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                    ⚡ {product.deliveryTime} min delivery
                  </span>
                )}
              </div>
            </div>

            {/* Rating */}
            {product.avgRating && (
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} size={14} className={s <= product.avgRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'} />
                ))}
                <span className="text-sm text-gray-500">({product.reviewCount} reviews)</span>
              </div>
            )}

            {/* Sizes */}
            <div>
              <p className="text-sm font-medium mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes?.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-12 h-12 rounded-xl border text-sm font-medium transition ${
                      selectedSize === s ? 'border-brand-600 bg-brand-600 text-white' : 'border-gray-200 hover:border-brand-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Color</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-4 py-2 rounded-full text-sm border transition ${
                        selectedColor === c ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-gray-200'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="text-sm text-gray-600 space-y-1">
              <p>{product.description}</p>
              {product.material && <p><span className="font-medium">Material:</span> {product.material}</p>}
              {product.care && <p><span className="font-medium">Care:</span> {product.care}</p>}
            </div>

            {/* CTA */}
            <div className="flex gap-3 pt-2">
              <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <ShoppingCart size={18} /> Add to Cart
              </button>
              <button className="btn-outline p-3">
                <Heart size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
