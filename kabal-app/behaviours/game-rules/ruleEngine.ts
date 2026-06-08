import { FaceUpCard } from '../../types/card.types'
import { GameRules } from '../../types/game.types'

const isRed = (card: FaceUpCard) => card.suit === 'hearts' || card.suit === 'diamonds'

export const canPlaceOnTableau = (
  card: FaceUpCard,
  targetPile: Array<{ kind: string; value?: number; suit?: string }>,
  rules: GameRules
): boolean => {
  if (targetPile.length === 0) {
    return rules.emptyPileRule === 'any' || card.value === 13
  }
  const top = targetPile.at(-1)
  if (!top || top.kind !== 'face-up') return false
  const topCard = top as FaceUpCard
  return topCard.value === card.value + 1 && isRed(topCard) !== isRed(card)
}

export const canPlaceOnFoundation = (
  card: FaceUpCard,
  foundation: Array<{ kind: string; value?: number; suit?: string }>
): boolean => {
  if (foundation.length === 0) return card.value === 1
  const top = foundation.at(-1) as FaceUpCard
  return top.suit === card.suit && top.value === card.value - 1
}
