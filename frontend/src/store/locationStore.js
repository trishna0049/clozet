import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useLocationStore = create(
  persist(
    (set) => ({
      coords: null,          // { lat, lng }
      address: null,         // human-readable
      setLocation: (coords, address) => set({ coords, address }),
    }),
    { name: 'clozet-location' }
  )
)
