import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { GameBoard } from '../GameBoard'
import { useGameBoard } from '../../../behaviours/game-board/useGameBoard'
import { GameBoardState } from '../../../types/game.types'
import { FaceUpCard, FaceDownCard } from '../../../types/card.types'

jest.mock('../../../behaviours/game-board/useGameBoard')

const handlers = {
  moveCard: jest.fn(),
  moveToFoundation: jest.fn(),
  drawFromStock: jest.fn(),
  moveFromWaste: jest.fn(),
  moveFromWasteToFoundation: jest.fn(),
}

const faceUp = (id: string, value: number, suit: string): FaceUpCard => ({
  kind: 'face-up', id, suit: suit as any, value: value as any,
})
const faceDown = (id: string): FaceDownCard => ({ kind: 'face-down', id })

const emptyBoard = (): GameBoardState => ({
  tableau: [[], [], [], [], [], [], []],
  foundations: [[], [], [], []],
  stock: [],
  waste: [],
})

const withBoard = (partial: Partial<GameBoardState>): GameBoardState => ({
  ...emptyBoard(),
  ...partial,
})

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(useGameBoard).mockReturnValue(handlers)
})

describe('GameBoard rendering', () => {
  describe('Given a freshly dealt board', () => {
    const board = withBoard({
      tableau: [[faceUp('ah', 1, 'hearts')], [faceDown('x'), faceUp('b8', 8, 'spades')], [], [], [], [], []],
      stock: [faceDown('s1'), faceDown('s2')],
    })

    it('Then the stock, waste and all seven tableau piles are rendered', () => {
      const { getByTestId } = render(<GameBoard board={board} />)
      expect(getByTestId('stock')).toBeTruthy()
      expect(getByTestId('waste')).toBeTruthy()
      for (let i = 0; i < 7; i++) expect(getByTestId(`tableau-${i}`)).toBeTruthy()
    })

    it('Then the four foundations are rendered', () => {
      const { getByTestId } = render(<GameBoard board={board} />)
      for (let i = 0; i < 4; i++) expect(getByTestId(`foundation-${i}`)).toBeTruthy()
    })
  })
})

describe('GameBoard interactions', () => {
  describe('Given a board with cards in the stock', () => {
    const board = withBoard({ stock: [faceDown('s1'), faceDown('s2')] })

    describe('When the stock is tapped', () => {
      it('Then a card is drawn from the stock', () => {
        const { getByTestId } = render(<GameBoard board={board} />)
        fireEvent.press(getByTestId('stock'))
        expect(handlers.drawFromStock).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe('Given a face-up card on tableau pile 0', () => {
    const board = withBoard({
      tableau: [[faceUp('ah', 1, 'hearts')], [faceUp('b8', 8, 'spades')], [], [], [], [], []],
    })

    describe('When the card is selected and a foundation is tapped', () => {
      it('Then it is moved to that foundation', () => {
        const { getByTestId } = render(<GameBoard board={board} />)
        fireEvent.press(getByTestId('card-ah'))
        fireEvent.press(getByTestId('foundation-2'))
        expect(handlers.moveToFoundation).toHaveBeenCalledWith({ cardId: 'ah', fromPile: 0, foundationIndex: 2 })
      })
    })

    describe('When the card is selected and another tableau pile is tapped', () => {
      it('Then it is moved between tableau piles', () => {
        const { getByTestId } = render(<GameBoard board={board} />)
        fireEvent.press(getByTestId('card-ah'))
        fireEvent.press(getByTestId('tableau-1'))
        expect(handlers.moveCard).toHaveBeenCalledWith({ cardId: 'ah', fromPile: 0, toPile: 1 })
      })
    })

    describe('When the same card is tapped twice', () => {
      it('Then no move is made (selection is cleared)', () => {
        const { getByTestId } = render(<GameBoard board={board} />)
        fireEvent.press(getByTestId('card-ah'))
        fireEvent.press(getByTestId('card-ah'))
        fireEvent.press(getByTestId('foundation-0'))
        expect(handlers.moveToFoundation).not.toHaveBeenCalled()
      })
    })
  })

  describe('Given a card on the waste', () => {
    const board = withBoard({
      waste: [faceUp('w1', 5, 'clubs')],
      tableau: [[], [], [], [], [], [], []],
    })

    describe('When the waste card is selected and a tableau pile is tapped', () => {
      it('Then it is moved from waste to that pile', () => {
        const { getByTestId } = render(<GameBoard board={board} />)
        fireEvent.press(getByTestId('card-w1'))
        fireEvent.press(getByTestId('tableau-3'))
        expect(handlers.moveFromWaste).toHaveBeenCalledWith({ cardId: 'w1', toPile: 3 })
      })
    })

    describe('When the waste card is selected and a foundation is tapped', () => {
      it('Then it is moved from waste to that foundation', () => {
        const { getByTestId } = render(<GameBoard board={board} />)
        fireEvent.press(getByTestId('card-w1'))
        fireEvent.press(getByTestId('foundation-1'))
        expect(handlers.moveFromWasteToFoundation).toHaveBeenCalledWith({ cardId: 'w1', foundationIndex: 1 })
      })
    })
  })
})
