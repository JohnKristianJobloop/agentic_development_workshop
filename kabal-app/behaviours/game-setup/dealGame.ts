import { Card, FaceDownCard, FaceUpCard, Suit, CardValue } from '../../types/card.types'
import { GameBoardState } from '../../types/game.types'

export const TABLEAU_PILE_COUNT = 7
export const FOUNDATION_COUNT = 4

// id format produced by useDeck: "${value}-${suit}", e.g. "1-hearts"
const revealCard = (card: Card): FaceUpCard => {
  const [rawValue, suit] = card.id.split('-')
  return {
    kind: 'face-up',
    id: card.id,
    suit: suit as Suit,
    value: parseInt(rawValue, 10) as CardValue,
  }
}

const faceDown = (card: Card): FaceDownCard => ({ kind: 'face-down', id: card.id })

// Klondike deal: tableau pile i (0-indexed) receives i+1 cards. In each pile the
// topmost card is turned face-up and the rest stay face-down. The cards left over
// after the tableau is filled become the face-down stock; the waste starts empty
// and the four foundations start empty.
export const dealGame = (deck: Card[]): GameBoardState => {
  const remaining = deck.map(faceDown)

  const tableau: Card[][] = []
  for (let pile = 0; pile < TABLEAU_PILE_COUNT; pile++) {
    const pileCards: Card[] = remaining.splice(0, pile + 1)
    const top = pileCards.pop()
    if (top) pileCards.push(revealCard(top))
    tableau.push(pileCards)
  }

  return {
    tableau,
    foundations: Array.from({ length: FOUNDATION_COUNT }, () => []),
    stock: remaining,
    waste: [],
  }
}
