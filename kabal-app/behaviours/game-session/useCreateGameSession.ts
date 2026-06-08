import { v4 as uuid } from 'uuid'
import { writeGameSession } from '../../infrastructure/firebase/database'
import { useGameStore } from '../../state/gameStore'
import { useAuthStore } from '../../state/authStore'
import { GameRules, GameSession } from '../../types/game.types'

export const useCreateGameSession = () => {
  const setActiveSession = useGameStore((s) => s.setActiveSession)
  const user = useAuthStore((s) => s.user)

  const createSession = async (rules: GameRules) => {
    if (user.kind !== 'authenticated') return

    const session: GameSession = {
      id: uuid(),
      userId: user.uid,
      board: { tableau: [[], [], [], [], [], [], []], foundations: [[], [], [], []], stock: [], waste: [] },
      deck: { cards: [], seed: 'default' },
      rules,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    await writeGameSession(user.uid, session)
    setActiveSession(session)
  }

  return { createSession }
}
