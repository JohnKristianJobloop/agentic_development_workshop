import React from 'react'
import { View, Pressable, StyleSheet } from 'react-native'
import { Card as CardComponent } from '../cards/Card'
import { CardBack } from '../cards/CardBack'
import { Card, FaceUpCard } from '../../types/card.types'

type Props = {
  cards: Card[]
  selectedCardId?: string
  onCardPress?: (cardId: string) => void
  onBackgroundPress?: () => void
  testID?: string
}

export const Pile = ({ cards, selectedCardId, onCardPress, onBackgroundPress, testID }: Props) => (
  <Pressable testID={testID} onPress={onBackgroundPress} disabled={!onBackgroundPress} style={styles.pile}>
    {cards.map((card, index) => (
      <View key={card.id} style={[styles.cardOffset, { top: index * 20 }]}>
        {card.kind === 'face-up'
          ? <CardComponent
              card={card as FaceUpCard}
              onPress={onCardPress && (() => onCardPress(card.id))}
              selected={card.id === selectedCardId}
              testID={`card-${card.id}`}
            />
          : <CardBack />}
      </View>
    ))}
  </Pressable>
)

const styles = StyleSheet.create({
  pile: {
    width: 60,
    minHeight: 90,
    position: 'relative',
  },
  cardOffset: {
    position: 'absolute',
  },
})
