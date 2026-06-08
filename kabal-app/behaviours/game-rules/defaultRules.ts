import { GameRules } from '../../types/game.types'

export const defaultRules: GameRules = {
  drawCount: 1,
  emptyPileRule: 'king-only',
  sortingBehaviour: 'random',
  cardScoringValues: {},
}
