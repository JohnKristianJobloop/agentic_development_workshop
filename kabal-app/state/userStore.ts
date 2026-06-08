import { create } from 'zustand'
import { UserProfile } from '../types/auth.types'

type UserStore = {
  profile: UserProfile | null
  setProfile: (profile: UserProfile | null) => void
}

export const useUserStore = create<UserStore>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}))
