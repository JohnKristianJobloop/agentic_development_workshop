import { useGameStore } from '../../state/gameStore'
import { canPlaceOnTableau, canPlaceOnFoundation } from '../game-rules/ruleEngine'
import { Card, FaceDownCard, FaceUpCard, Suit, CardValue } from '../../types/card.types'
import { GameBoardState } from '../../types/game.types'

type TableauMoveArgs = { cardId: string; fromPile: number; toPile: number }
type FoundationMoveArgs = { cardId: string; fromPile: number; foundationIndex: number }
type WasteToTableauArgs = { cardId: string; toPile: number }
type WasteToFoundationArgs = { cardId: string; foundationIndex: number }

// id format produced by useDeck: "${value}-${suit}", e.g. "1-hearts"
export const revealCard = (card: FaceDownCard): FaceUpCard => {
  const [rawValue, suit] = card.id.split('-')
  return {
    kind: 'face-up',
    id: card.id,
    suit: suit as Suit,
    value: parseInt(rawValue, 10) as CardValue,
  }
}

const flipTopCard = (pile: Card[]): Card[] => {
  if (pile.length === 0) return pile
  const top = pile.at(-1)!
  if (top.kind !== 'face-down') return pile
  return [...pile.slice(0, -1), revealCard(top)]
}

export const useGameBoard = () => {
  const session = useGameStore((s) => s.activeSession)
  const setActiveSession = useGameStore((s) => s.setActiveSession)

  const updateBoard = (board: GameBoardState) => {
    if (!session) return
    setActiveSession({ ...session, board, updatedAt: Date.now() })
  }

  const moveCard = ({ cardId, fromPile, toPile }: TableauMoveArgs) => {
    if (!session) return
    const { tableau } = session.board
    const from = [...tableau[fromPile]]
    const cardIndex = from.findIndex((c) => c.id === cardId)
    if (cardIndex === -1) return
    const card = from[cardIndex] as FaceUpCard
    if (!canPlaceOnTableau(card, tableau[toPile], session.rules)) return
    const newFrom = flipTopCard(from.slice(0, cardIndex))
    const newTo = [...tableau[toPile], ...from.slice(cardIndex)]
    const newTableau = tableau.map((p, i) => i === fromPile ? newFrom : i === toPile ? newTo : p)
    updateBoard({ ...session.board, tableau: newTableau })
  }

  const moveToFoundation = ({ cardId, fromPile, foundationIndex }: FoundationMoveArgs) => {
    if (!session) return
    const { tableau, foundations } = session.board
    const from = [...tableau[fromPile]]
    const card = from.at(-1) as FaceUpCard
    if (!card || card.id !== cardId) return
    if (!canPlaceOnFoundation(card, foundations[foundationIndex])) return
    const newFrom = flipTopCard(from.slice(0, -1))
    const newFoundations = foundations.map((f, i) => i === foundationIndex ? [...f, card] : f)
    const newTableau = tableau.map((p, i) => i === fromPile ? newFrom : p)
    updateBoard({ ...session.board, tableau: newTableau, foundations: newFoundations })
  }

  const drawFromStock = () => {
    if (!session) return
    const { stock, waste } = session.board
    if (stock.length === 0) {
      const newStock = [...waste].reverse().map((c): FaceDownCard => ({ kind: 'face-down', id: c.id }))
      updateBoard({ ...session.board, stock: newStock, waste: [] })
      return
    }
    const top = stock.at(-1)!
    const drawn = top.kind === 'face-down' ? revealCard(top) : top as FaceUpCard
    updateBoard({ ...session.board, stock: stock.slice(0, -1), waste: [...waste, drawn] })
  }

  const moveFromWaste = ({ cardId, toPile }: WasteToTableauArgs) => {
    if (!session) return
    const { waste, tableau } = session.board
    const card = waste.at(-1) as FaceUpCard
    if (!card || card.id !== cardId) return
    if (!canPlaceOnTableau(card, tableau[toPile], session.rules)) return
    const newTableau = tableau.map((p, i) => i === toPile ? [...p, card] : p)
    updateBoard({ ...session.board, waste: waste.slice(0, -1), tableau: newTableau })
  }

  const moveFromWasteToFoundation = ({ cardId, foundationIndex }: WasteToFoundationArgs) => {
    if (!session) return
    const { waste, foundations } = session.board
    const card = waste.at(-1) as FaceUpCard
    if (!card || card.id !== cardId) return
    if (!canPlaceOnFoundation(card, foundations[foundationIndex])) return
    const newFoundations = foundations.map((f, i) => i === foundationIndex ? [...f, card] : f)
    updateBoard({ ...session.board, waste: waste.slice(0, -1), foundations: newFoundations })
  }

  return { moveCard, moveToFoundation, drawFromStock, moveFromWaste, moveFromWasteToFoundation }
}
