import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, size, color, quantity = 1) => {
        const items = get().items
        const key = `${product._id}-${size}-${color}`
        const existing = items.find(i => i.key === key)
        if (existing) {
          set({ items: items.map(i => i.key === key ? { ...i, quantity: i.quantity + quantity } : i) })
        } else {
          set({ items: [...items, { key, product, size, color, quantity }] })
        }
      },
      removeItem: (key) => set({ items: get().items.filter(i => i.key !== key) }),
      updateQty: (key, quantity) => {
        if (quantity < 1) return
        set({ items: get().items.map(i => i.key === key ? { ...i, quantity } : i) })
      },
      clearCart: () => set({ items: [] }),
      get total() {
        return get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
      },
    }),
    { name: 'clozet-cart' }
  )
)
