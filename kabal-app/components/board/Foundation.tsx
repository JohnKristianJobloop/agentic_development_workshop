import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { Card as CardComponent } from '../cards/Card'
import { Card, FaceUpCard } from '../../types/card.types'

type Props = {
  cards: Card[]
  onPress?: () => void
  testID?: string
}

export const Foundation = ({ cards, onPress, testID }: Props) => {
  const top = cards.at(-1)

  return (
    <Pressable testID={testID} onPress={onPress} disabled={!onPress}>
      <View style={styles.foundation}>
        {top?.kind === 'face-up' && <CardComponent card={top as FaceUpCard} />}
      </View>
    </Pressable>
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
