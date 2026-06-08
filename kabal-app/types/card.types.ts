export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'

export type CardValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13

export type FaceDownCard = {
  kind: 'face-down'
  id: string
}

export type FaceUpCard = {
  kind: 'face-up'
  id: string
  suit: Suit
  value: CardValue
}

export type Card = FaceDownCard | FaceUpCard
