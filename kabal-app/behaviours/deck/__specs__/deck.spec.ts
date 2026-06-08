import { renderHook, act } from '@testing-library/react-native'
import { useDeck } from '../useDeck'

describe('Deck', () => {
  describe('Given a request to initialise a deck', () => {
    describe('When no seed is provided', () => {
      it('Then a deck of 52 cards is created with the default seed', () => {
        const { result } = renderHook(() => useDeck())
        act(() => result.current.initDeck())
        expect(result.current.deck.cards).toHaveLength(52)
      })

      it('Then all cards start face-down', () => {
        const { result } = renderHook(() => useDeck())
        act(() => result.current.initDeck())
        const allFaceDown = result.current.deck.cards.every((c) => c.kind === 'face-down')
        expect(allFaceDown).toBe(true)
      })

      it('Then cards are in a random order', () => {
        const { result: r1 } = renderHook(() => useDeck())
        const { result: r2 } = renderHook(() => useDeck())
        act(() => r1.current.initDeck())
        act(() => r2.current.initDeck())
        const ids1 = r1.current.deck.cards.map((c) => c.id).join(',')
        const ids2 = r2.current.deck.cards.map((c) => c.id).join(',')
        expect(ids1).not.toBe(ids2)
      })
    })

    describe('When a custom seed is provided', () => {
      it('Then the deck carries that seed value', () => {
        const { result } = renderHook(() => useDeck())
        act(() => result.current.initDeck('my-custom-seed'))
        expect(result.current.deck.seed).toBe('my-custom-seed')
      })

      it('Then two decks initialised with the same seed produce the same card order', () => {
        const { result: r1 } = renderHook(() => useDeck())
        const { result: r2 } = renderHook(() => useDeck())
        act(() => r1.current.initDeck('fixed-seed'))
        act(() => r2.current.initDeck('fixed-seed'))
        const ids1 = r1.current.deck.cards.map((c) => c.id).join(',')
        const ids2 = r2.current.deck.cards.map((c) => c.id).join(',')
        expect(ids1).toBe(ids2)
      })

      it('Then two decks with different seeds produce different card orders', () => {
        const { result: r1 } = renderHook(() => useDeck())
        const { result: r2 } = renderHook(() => useDeck())
        act(() => r1.current.initDeck('seed-a'))
        act(() => r2.current.initDeck('seed-b'))
        const ids1 = r1.current.deck.cards.map((c) => c.id).join(',')
        const ids2 = r2.current.deck.cards.map((c) => c.id).join(',')
        expect(ids1).not.toBe(ids2)
      })
    })
  })
})
