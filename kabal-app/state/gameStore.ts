import { create } from 'zustand'
import { GameSession } from '../types/game.types'

type GameStore = {
  activeSession: GameSession | null
  setActiveSession: (session: GameSession | null) => void
}

export const useGameStore = create<GameStore>((set) => ({
  activeSession: null,
  setActiveSession: (session) => set({ activeSession: session }),
}))
