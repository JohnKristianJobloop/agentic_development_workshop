import { dealGame } from '../dealGame'
import { Card } from '../../../types/card.types'

const SUITS = ['hearts', 'diamonds', 'clubs', 'spades']
const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

// A full, ordered 52-card face-down deck using the same id format as useDeck.
const fullDeck = (): Card[] =>
  SUITS.flatMap((suit) =>
    VALUES.map((value): Card => ({ kind: 'face-down', id: `${value}-${suit}` }))
  )

describe('Game Setup — initial deal', () => {
  describe('Given a full 52-card deck', () => {
    describe('When a new game is dealt', () => {
      it('Then there are 7 tableau piles', () => {
        const board = dealGame(fullDeck())
        expect(board.tableau).toHaveLength(7)
      })

      it('Then tableau pile i holds i+1 cards (1 through 7)', () => {
        const board = dealGame(fullDeck())
        const sizes = board.tableau.map((pile) => pile.length)
        expect(sizes).toEqual([1, 2, 3, 4, 5, 6, 7])
      })

      it('Then 28 cards in total are dealt to the tableau', () => {
        const board = dealGame(fullDeck())
        const total = board.tableau.reduce((sum, pile) => sum + pile.length, 0)
        expect(total).toBe(28)
      })

      it('Then the top card of every tableau pile is face-up', () => {
        const board = dealGame(fullDeck())
        const tops = board.tableau.map((pile) => pile.at(-1)!)
        expect(tops.every((card) => card.kind === 'face-up')).toBe(true)
      })

      it('Then every tableau card beneath the top is face-down', () => {
        const board = dealGame(fullDeck())
        const buried = board.tableau.flatMap((pile) => pile.slice(0, -1))
        expect(buried.every((card) => card.kind === 'face-down')).toBe(true)
      })

      it('Then the 24 remaining cards form the stock', () => {
        const board = dealGame(fullDeck())
        expect(board.stock).toHaveLength(24)
      })

      it('Then every stock card is face-down', () => {
        const board = dealGame(fullDeck())
        expect(board.stock.every((card) => card.kind === 'face-down')).toBe(true)
      })

      it('Then the waste pile starts empty', () => {
        const board = dealGame(fullDeck())
        expect(board.waste).toHaveLength(0)
      })

      it('Then there are 4 empty foundations', () => {
        const board = dealGame(fullDeck())
        expect(board.foundations).toHaveLength(4)
        expect(board.foundations.every((f) => f.length === 0)).toBe(true)
      })

      it('Then every card from the deck appears exactly once on the board', () => {
        const deck = fullDeck()
        const board = dealGame(deck)
        const dealtIds = [
          ...board.tableau.flat(),
          ...board.stock,
          ...board.waste,
        ].map((card) => card.id)
        expect(dealtIds).toHaveLength(52)
        expect(new Set(dealtIds).size).toBe(52)
        expect(new Set(dealtIds)).toEqual(new Set(deck.map((c) => c.id)))
      })

      it('Then the face-up cards expose the suit and value encoded in the deck', () => {
        const board = dealGame(fullDeck())
        const top = board.tableau[0].at(-1)!
        expect(top).toMatchObject({ kind: 'face-up', id: '1-hearts', suit: 'hearts', value: 1 })
      })
    })

    describe('When the same deck is dealt twice', () => {
      it('Then the two boards are identical (the deal is deterministic)', () => {
        expect(dealGame(fullDeck())).toEqual(dealGame(fullDeck()))
      })
    })
  })
})
