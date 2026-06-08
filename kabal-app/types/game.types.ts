import { Card } from './card.types'
import { DeckState } from './deck.types'

export type Pile = Card[]
export type Foundation = Card[]

export type GameBoardState = {
  tableau: Pile[]
  foundations: Foundation[]
  stock: Card[]
  waste: Card[]
}

export type DrawCount = 1 | 3

export type EmptyPileRule = 'any' | 'king-only'

export type SortingBehaviour = 'random' | 'custom'

export type GameRules = {
  drawCount: DrawCount
  emptyPileRule: EmptyPileRule
  sortingBehaviour: SortingBehaviour
  cardScoringValues: Record<string, number>
}

export type GameSession = {
  id: string
  userId: string
  board: GameBoardState
  deck: DeckState
  rules: GameRules
  createdAt: number
  updatedAt: number
}
