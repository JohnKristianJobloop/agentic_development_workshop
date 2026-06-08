import { renderHook, act } from '@testing-library/react-native'
import { useGameBoard } from '../useGameBoard'
import { useGameStore } from '../../../state/gameStore'
import { FaceUpCard, FaceDownCard } from '../../../types/card.types'
import { GameSession } from '../../../types/game.types'

const faceUp = (id: string, value: number, suit: string): FaceUpCard => ({
  kind: 'face-up', id, suit: suit as any, value: value as any,
})
const faceDown = (id: string): FaceDownCard => ({ kind: 'face-down', id })

const baseSession: GameSession = {
  id: 'session-1',
  userId: 'uid-1',
  deck: { cards: [], seed: 'default' },
  rules: { drawCount: 1, emptyPileRule: 'king-only', sortingBehaviour: 'random', cardScoringValues: {} },
  createdAt: 1000,
  updatedAt: 1000,
  board: {
    tableau: [[], [], [], [], [], [], []],
    foundations: [[], [], [], []],
    stock: [],
    waste: [],
  },
}

const withBoard = (partial: Partial<GameSession['board']>): GameSession => ({
  ...baseSession,
  board: { ...baseSession.board, ...partial },
})

describe('Game Board', () => {
  beforeEach(() => useGameStore.setState({ activeSession: baseSession }))

  // ─── Tableau → Tableau ────────────────────────────────────────────────────

  describe('Tableau to Tableau move', () => {
    describe('Given a red 7 on pile 0 and a black 8 on pile 1', () => {
      beforeEach(() => {
        useGameStore.setState({
          activeSession: withBoard({
            tableau: [
              [faceUp('r7', 7, 'hearts')],
              [faceUp('b8', 8, 'spades')],
              [], [], [], [], [],
            ],
          }),
        })
      })

      describe('When the red 7 is moved onto the black 8', () => {
        it('Then the red 7 is removed from pile 0', () => {
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.moveCard({ cardId: 'r7', fromPile: 0, toPile: 1 }))
          expect(useGameStore.getState().activeSession!.board.tableau[0]).toHaveLength(0)
        })

        it('Then the red 7 is added on top of pile 1', () => {
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.moveCard({ cardId: 'r7', fromPile: 0, toPile: 1 }))
          const top = useGameStore.getState().activeSession!.board.tableau[1].at(-1)
          expect(top?.id).toBe('r7')
        })

        it('Then the newly exposed top card of pile 0 is flipped face-up', () => {
          useGameStore.setState({
            activeSession: withBoard({
              tableau: [
                [faceDown('hidden'), faceUp('r7', 7, 'hearts')],
                [faceUp('b8', 8, 'spades')],
                [], [], [], [], [],
              ],
            }),
          })
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.moveCard({ cardId: 'r7', fromPile: 0, toPile: 1 }))
          const top = useGameStore.getState().activeSession!.board.tableau[0].at(-1)
          expect(top?.kind).toBe('face-up')
        })
      })
    })

    describe('Given a King and an empty pile', () => {
      beforeEach(() => {
        useGameStore.setState({
          activeSession: withBoard({
            tableau: [[faceUp('k', 13, 'spades')], [], [], [], [], [], []],
          }),
        })
      })

      describe('When the King is moved to the empty pile (king-only rule)', () => {
        it('Then the move is accepted', () => {
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.moveCard({ cardId: 'k', fromPile: 0, toPile: 1 }))
          expect(useGameStore.getState().activeSession!.board.tableau[1]).toHaveLength(1)
        })
      })
    })

    describe('Given a non-King and an empty pile under the king-only rule', () => {
      beforeEach(() => {
        useGameStore.setState({
          activeSession: withBoard({
            tableau: [[faceUp('q', 12, 'hearts')], [], [], [], [], [], []],
          }),
        })
      })

      describe('When the Queen is moved to the empty pile', () => {
        it('Then the move is rejected and the board is unchanged', () => {
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.moveCard({ cardId: 'q', fromPile: 0, toPile: 1 }))
          expect(useGameStore.getState().activeSession!.board.tableau[0]).toHaveLength(1)
          expect(useGameStore.getState().activeSession!.board.tableau[1]).toHaveLength(0)
        })
      })
    })
  })

  // ─── Tableau → Foundation ─────────────────────────────────────────────────

  describe('Tableau to Foundation move', () => {
    describe('Given an Ace of hearts and an empty hearts foundation', () => {
      beforeEach(() => {
        useGameStore.setState({
          activeSession: withBoard({
            tableau: [[faceUp('ah', 1, 'hearts')], [], [], [], [], [], []],
            foundations: [[], [], [], []],
          }),
        })
      })

      describe('When the Ace is moved to foundation 0', () => {
        it('Then the Ace is placed on foundation 0', () => {
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.moveToFoundation({ cardId: 'ah', fromPile: 0, foundationIndex: 0 }))
          expect(useGameStore.getState().activeSession!.board.foundations[0]).toHaveLength(1)
        })

        it('Then the Ace is removed from the tableau pile', () => {
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.moveToFoundation({ cardId: 'ah', fromPile: 0, foundationIndex: 0 }))
          expect(useGameStore.getState().activeSession!.board.tableau[0]).toHaveLength(0)
        })
      })
    })

    describe('Given a 2 of hearts and an Ace of hearts already on foundation 0', () => {
      beforeEach(() => {
        useGameStore.setState({
          activeSession: withBoard({
            tableau: [[faceUp('2h', 2, 'hearts')], [], [], [], [], [], []],
            foundations: [[faceUp('ah', 1, 'hearts')], [], [], []],
          }),
        })
      })

      describe('When the 2 is moved to foundation 0', () => {
        it('Then the 2 is accepted onto the foundation', () => {
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.moveToFoundation({ cardId: '2h', fromPile: 0, foundationIndex: 0 }))
          expect(useGameStore.getState().activeSession!.board.foundations[0]).toHaveLength(2)
        })
      })
    })

    describe('Given a 3 of hearts and only an Ace on foundation 0', () => {
      beforeEach(() => {
        useGameStore.setState({
          activeSession: withBoard({
            tableau: [[faceUp('3h', 3, 'hearts')], [], [], [], [], [], []],
            foundations: [[faceUp('ah', 1, 'hearts')], [], [], []],
          }),
        })
      })

      describe('When the 3 is moved to foundation 0', () => {
        it('Then the move is rejected and the board is unchanged', () => {
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.moveToFoundation({ cardId: '3h', fromPile: 0, foundationIndex: 0 }))
          expect(useGameStore.getState().activeSession!.board.foundations[0]).toHaveLength(1)
          expect(useGameStore.getState().activeSession!.board.tableau[0]).toHaveLength(1)
        })
      })
    })
  })

  // ─── Stock → Waste ────────────────────────────────────────────────────────

  describe('Stock draw', () => {
    describe('Given cards in the stock', () => {
      beforeEach(() => {
        useGameStore.setState({
          activeSession: withBoard({
            stock: [faceDown('s1'), faceDown('s2')],
            waste: [],
          }),
        })
      })

      describe('When the player draws from stock (drawCount: 1)', () => {
        it('Then the top stock card is removed from stock', () => {
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.drawFromStock())
          expect(useGameStore.getState().activeSession!.board.stock).toHaveLength(1)
        })

        it('Then the drawn card is added face-up to waste', () => {
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.drawFromStock())
          const waste = useGameStore.getState().activeSession!.board.waste
          expect(waste).toHaveLength(1)
          expect(waste[0].kind).toBe('face-up')
        })
      })
    })

    describe('Given an empty stock', () => {
      describe('When the player draws from stock', () => {
        it('Then the waste pile is reset as the new stock', () => {
          useGameStore.setState({
            activeSession: withBoard({
              stock: [],
              waste: [faceUp('w1', 5, 'clubs'), faceUp('w2', 6, 'diamonds')],
            }),
          })
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.drawFromStock())
          const board = useGameStore.getState().activeSession!.board
          expect(board.waste).toHaveLength(0)
          expect(board.stock).toHaveLength(2)
        })
      })
    })
  })

  // ─── Waste → Tableau ─────────────────────────────────────────────────────

  describe('Waste to Tableau move', () => {
    describe('Given a red 6 on waste and a black 7 on tableau pile 0', () => {
      beforeEach(() => {
        useGameStore.setState({
          activeSession: withBoard({
            waste: [faceUp('r6', 6, 'hearts')],
            tableau: [[faceUp('b7', 7, 'spades')], [], [], [], [], [], []],
          }),
        })
      })

      describe('When the red 6 is moved from waste onto the black 7', () => {
        it('Then the card is removed from waste', () => {
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.moveFromWaste({ cardId: 'r6', toPile: 0 }))
          expect(useGameStore.getState().activeSession!.board.waste).toHaveLength(0)
        })

        it('Then the card is added to the tableau pile', () => {
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.moveFromWaste({ cardId: 'r6', toPile: 0 }))
          expect(useGameStore.getState().activeSession!.board.tableau[0]).toHaveLength(2)
        })
      })
    })
  })

  // ─── Waste → Foundation ──────────────────────────────────────────────────

  describe('Waste to Foundation move', () => {
    describe('Given an Ace of spades on waste and an empty foundation', () => {
      beforeEach(() => {
        useGameStore.setState({
          activeSession: withBoard({
            waste: [faceUp('as', 1, 'spades')],
            foundations: [[], [], [], []],
          }),
        })
      })

      describe('When the Ace is moved from waste to foundation 1', () => {
        it('Then the Ace is placed on the foundation', () => {
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.moveFromWasteToFoundation({ cardId: 'as', foundationIndex: 1 }))
          expect(useGameStore.getState().activeSession!.board.foundations[1]).toHaveLength(1)
        })

        it('Then the Ace is removed from waste', () => {
          const { result } = renderHook(() => useGameBoard())
          act(() => result.current.moveFromWasteToFoundation({ cardId: 'as', foundationIndex: 1 }))
          expect(useGameStore.getState().activeSession!.board.waste).toHaveLength(0)
        })
      })
    })
  })
})
