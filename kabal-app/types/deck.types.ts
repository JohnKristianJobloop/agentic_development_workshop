import { Card } from './card.types'

export const DEFAULT_SEED = () => Math.random().toString(16);

export type DeckState = {
  cards: Card[]
  seed: string
}
