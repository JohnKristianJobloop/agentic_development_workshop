import { renderHook, act } from '@testing-library/react-native'
import { useResumeGameSession } from '../useResumeGameSession'
import * as database from '../../../infrastructure/firebase/database'
import { useGameStore } from '../../../state/gameStore'
import { useAuthStore } from '../../../state/authStore'
import { GameSession } from '../../../types/game.types'

jest.mock('../../../infrastructure/firebase/database')

const mockSession: GameSession = {
  id: 'session-abc',
  userId: 'uid-1',
  board: { tableau: [], foundations: [], stock: [], waste: [] },
  deck: { cards: [], seed: 'default' },
  rules: { drawCount: 1, emptyPileRule: 'king-only', sortingBehaviour: 'random', cardScoringValues: {} },
  createdAt: 1000,
  updatedAt: 1000,
}

describe('Resume Game Session', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState({
      user: { kind: 'authenticated', uid: 'uid-1', email: 'a@b.com', displayName: 'A' },
    })
    useGameStore.setState({ activeSession: null })
  })

  describe('Given an authenticated user', () => {
    describe('When an active session exists in the database', () => {
      it('Then the session is loaded into the game store', async () => {
        jest.spyOn(database, 'readGameSession').mockResolvedValue(mockSession)
        const { result } = renderHook(() => useResumeGameSession())
        await act(() => result.current.resumeSession())
        expect(useGameStore.getState().activeSession?.id).toBe('session-abc')
      })
    })

    describe('When no active session exists in the database', () => {
      it('Then the game store remains empty', async () => {
        jest.spyOn(database, 'readGameSession').mockResolvedValue(null)
        const { result } = renderHook(() => useResumeGameSession())
        await act(() => result.current.resumeSession())
        expect(useGameStore.getState().activeSession).toBeNull()
      })
    })
  })
})
