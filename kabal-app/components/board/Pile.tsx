import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Card as CardComponent } from '../cards/Card'
import { CardBack } from '../cards/CardBack'
import { Card, FaceUpCard } from '../../types/card.types'

type Props = {
  cards: Card[]
}

export const Pile = ({ cards }: Props) => (
  <View style={styles.pile}>
    {cards.map((card, index) => (
      <View key={card.id} style={[styles.cardOffset, { top: index * 20 }]}>
        {card.kind === 'face-up'
          ? <CardComponent card={card as FaceUpCard} />
          : <CardBack />}
      </View>
    ))}
  </View>
)

const styles = StyleSheet.create({
  pile: {
    width: 60,
    position: 'relative',
  },
  cardOffset: {
    position: 'absolute',
  },
})
