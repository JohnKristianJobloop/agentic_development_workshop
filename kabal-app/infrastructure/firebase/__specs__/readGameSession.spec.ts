import { GameSession } from '../../../types/game.types'

// Mock the firebase/database module that database.ts depends on.
const mockGet = jest.fn()
jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(() => ({})),
  ref: jest.fn((_db, path) => ({ path })),
  get: (...args: unknown[]) => mockGet(...args),
  set: jest.fn(),
  onValue: jest.fn(),
}))
jest.mock('../config', () => ({ firebaseApp: {} }))

import { readGameSession } from '../database'

/**
 * Firebase Realtime Database does NOT persist empty arrays/objects.
 * Any key whose value serialises to an empty array `[]`, empty object `{}`
 * or `null` is dropped on write and is therefore absent on read.
 *
 * This helper reproduces that serialisation so a stored snapshot matches
 * what the real RTDB would hand back from `snapshot.val()`.
 */
const stripEmpty = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    const mapped = value.map(stripEmpty).filter((v) => v !== undefined)
    return mapped.length === 0 ? undefined : mapped
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value)) {
      const cleaned = stripEmpty(v)
      if (cleaned !== undefined) out[k] = cleaned
    }
    return Object.keys(out).length === 0 ? undefined : out
  }
  return value
}

const snapshotOf = (stored: unknown) => ({
  exists: () => stored !== undefined,
  val: () => stored,
})

describe('readGameSession – Firebase round-trip', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('Given an in-progress game where cards are dealt but no foundation has been played yet', () => {
    const card = { kind: 'face-up', id: '1-hearts', suit: 'hearts', value: 1 } as const
    // Tableau/stock are populated (game is mid-play) but every foundation pile
    // is still empty - the normal state before the first ace is played.
    const inProgressSession: GameSession = {
      id: 'session-abc',
      userId: 'uid-1',
      board: {
        tableau: [[card], [], [], [], [], [], []],
        foundations: [[], [], [], []],
        stock: [{ kind: 'face-down', id: '5-spades' }],
        waste: [],
      },
      deck: { cards: [card], seed: 'default' },
      rules: { drawCount: 1, emptyPileRule: 'king-only', sortingBehaviour: 'random', cardScoringValues: {} },
      createdAt: 1000,
      updatedAt: 1000,
    }

    describe('When it is read back after being persisted to Realtime Database', () => {
      it('Then board.foundations is re-hydrated to the correct number of empty piles', async () => {
        const stored = stripEmpty(inProgressSession)
        mockGet.mockResolvedValue(snapshotOf(stored))

        const session = await readGameSession('uid-1')

        expect(session).not.toBeNull()
        expect(session!.board.foundations).toEqual([[], [], [], []])
      })

      it('Then mapping over foundations (as GameBoard does) no longer throws', async () => {
        const stored = stripEmpty(inProgressSession)
        mockGet.mockResolvedValue(snapshotOf(stored))

        const session = await readGameSession('uid-1')

        // GameBoard.tsx:14 -> board.foundations.map(...)
        expect(() => session!.board.foundations.map((f) => f)).not.toThrow()
      })

      it('Then populated piles survive and empty ones default, with the full board shape intact', async () => {
        const stored = stripEmpty(inProgressSession)
        mockGet.mockResolvedValue(snapshotOf(stored))

        const session = await readGameSession('uid-1')

        const board = session!.board
        expect(board.tableau).toHaveLength(7)
        expect(board.tableau[0]).toEqual([card])
        expect(board.tableau[1]).toEqual([])
        expect(board.foundations).toHaveLength(4)
        expect(board.stock).toEqual([{ kind: 'face-down', id: '5-spades' }])
        expect(board.waste).toEqual([])
      })
    })
  })

  describe('Given a brand-new game session where the entire board is empty', () => {
    const freshSession: GameSession = {
      id: 'session-new',
      userId: 'uid-1',
      board: { tableau: [[], [], [], [], [], [], []], foundations: [[], [], [], []], stock: [], waste: [] },
      deck: { cards: [], seed: 'default' },
      rules: { drawCount: 1, emptyPileRule: 'king-only', sortingBehaviour: 'random', cardScoringValues: {} },
      createdAt: 1000,
      updatedAt: 1000,
    }

    describe('When it is read back (Firebase drops the whole board)', () => {
      it('Then the board is fully re-hydrated to its empty starting shape', async () => {
        mockGet.mockResolvedValue(snapshotOf(stripEmpty(freshSession)))

        const session = await readGameSession('uid-1')

        expect(session!.board).toEqual({
          tableau: [[], [], [], [], [], [], []],
          foundations: [[], [], [], []],
          stock: [],
          waste: [],
        })
      })
    })
  })
})
