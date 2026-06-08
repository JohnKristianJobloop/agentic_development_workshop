import { useState } from 'react'
import { DeckState, DEFAULT_SEED } from '../../types/deck.types'
import { FaceDownCard, Suit, CardValue } from '../../types/card.types'

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const VALUES: CardValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

const seededRandom = (seed: string) => {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  }
  return () => {
    h ^= h << 13; h ^= h >> 17; h ^= h << 5
    return ((h >>> 0) / 0xffffffff)
  }
}

const shuffle = <T>(arr: T[], rand: () => number): T[] => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const buildDeck = (seed: string): FaceDownCard[] => {
  const cards: FaceDownCard[] = SUITS.flatMap((suit) =>
    VALUES.map((value) => ({ kind: 'face-down' as const, id: `${value}-${suit}` }))
  )
  return shuffle(cards, seededRandom(seed))
}

export const useDeck = () => {
  const [deck, setDeck] = useState<DeckState>({ cards: [], seed: DEFAULT_SEED() })

  const initDeck = (seed: string = DEFAULT_SEED()) => {
    setDeck({ cards: buildDeck(seed), seed })
  }

  return { deck, initDeck }
}
