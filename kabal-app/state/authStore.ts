import { create } from 'zustand'
import { AuthUser } from '../types/auth.types'

type AuthStore = {
  user: AuthUser
  setUser: (user: AuthUser) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: { kind: 'anonymous' },
  setUser: (user) => set({ user }),
}))
