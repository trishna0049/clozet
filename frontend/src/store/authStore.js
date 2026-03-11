import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null, // 'customer' | 'store' | 'admin'
      setAuth: (token, user, role) => set({ token, user, role }),
      updateUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null, role: null }),
    }),
    { name: 'clozet-auth' }
  )
)
