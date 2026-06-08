import { renderHook, act } from '@testing-library/react-native'
import { useCreateGameSession } from '../useCreateGameSession'
import * as database from '../../../infrastructure/firebase/database'
import { useGameStore } from '../../../state/gameStore'
import { useAuthStore } from '../../../state/authStore'
import { GameRules } from '../../../types/game.types'

jest.mock('../../../infrastructure/firebase/database')

// `uuid`'s dist ships ESM `export` tokens that Jest can't parse, so it must be
// mocked. The counter lives inside the factory closure (jest.mock factories may
// not reference out-of-scope variables) and gives each call a fresh id for the
// uniqueness assertion.
jest.mock('uuid', () => {
  let counter = 0
  return { v4: () => `uuid-${++counter}` }
})

const defaultRules: GameRules = {
  drawCount: 1,
  emptyPileRule: 'king-only',
  sortingBehaviour: 'random',
  cardScoringValues: {},
}

describe('Create Game Session', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState({
      user: { kind: 'authenticated', uid: 'uid-1', email: 'a@b.com', displayName: 'A' },
    })
    useGameStore.setState({ activeSession: null })
  })

  describe('Given an authenticated user', () => {
    describe('When they start a new game session with valid rules', () => {
      it('Then a session is written to the Realtime Database', async () => {
        jest.spyOn(database, 'writeGameSession').mockResolvedValue()
        const { result } = renderHook(() => useCreateGameSession())
        await act(() => result.current.createSession(defaultRules))
        expect(database.writeGameSession).toHaveBeenCalledWith('uid-1', expect.objectContaining({
          userId: 'uid-1',
          rules: defaultRules,
        }))
      })

      it('Then the game store holds the new active session', async () => {
        jest.spyOn(database, 'writeGameSession').mockResolvedValue()
        const { result } = renderHook(() => useCreateGameSession())
        await act(() => result.current.createSession(defaultRules))
        expect(useGameStore.getState().activeSession).not.toBeNull()
      })

      it('Then the session has a unique id', async () => {
        jest.spyOn(database, 'writeGameSession').mockResolvedValue()
        const { result } = renderHook(() => useCreateGameSession())
        await act(() => result.current.createSession(defaultRules))
        await act(() => result.current.createSession(defaultRules))
        const sessions = jest.mocked(database.writeGameSession).mock.calls
        expect(sessions[0][1].id).not.toBe(sessions[1][1].id)
      })
    })
  })
})
