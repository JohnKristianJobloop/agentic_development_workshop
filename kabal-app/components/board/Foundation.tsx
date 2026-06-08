import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Card as CardComponent } from '../cards/Card'
import { Card, FaceUpCard } from '../../types/card.types'

type Props = {
  cards: Card[]
}

export const Foundation = ({ cards }: Props) => {
  const top = cards.at(-1)

  return (
    <View style={styles.foundation}>
      {top?.kind === 'face-up' && <CardComponent card={top as FaceUpCard} />}
    </View>
  )
}

const styles = StyleSheet.create({
  foundation: {
    width: 60,
    height: 90,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#aaa',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
