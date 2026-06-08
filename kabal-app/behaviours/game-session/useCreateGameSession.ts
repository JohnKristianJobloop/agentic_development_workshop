import { v4 as uuid } from 'uuid'
import { writeGameSession } from '../../infrastructure/firebase/database'
import { useGameStore } from '../../state/gameStore'
import { useAuthStore } from '../../state/authStore'
import { GameRules, GameSession } from '../../types/game.types'
import { buildDeck } from '../deck/useDeck'
import { dealGame } from '../game-setup/dealGame'
import { DEFAULT_SEED } from '../../types/deck.types'

export const useCreateGameSession = () => {
  const setActiveSession = useGameStore((s) => s.setActiveSession)
  const user = useAuthStore((s) => s.user)

  const createSession = async (rules: GameRules) => {
    if (user.kind !== 'authenticated') return

    const seed = DEFAULT_SEED()
    const cards = buildDeck(seed)

    const session: GameSession = {
      id: uuid(),
      userId: user.uid,
      board: dealGame(cards),
      deck: { cards, seed },
      rules,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    await writeGameSession(user.uid, session)
    setActiveSession(session)
  }

  return { createSession }
}
