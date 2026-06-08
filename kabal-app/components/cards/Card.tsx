import React from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { FaceUpCard } from '../../types/card.types'

type Props = {
  card: FaceUpCard
  onPress?: () => void
  selected?: boolean
  testID?: string
}

const SUIT_SYMBOL: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

const isRed = (suit: string) => suit === 'hearts' || suit === 'diamonds'

export const Card = ({ card, onPress, selected, testID }: Props) => (
  <Pressable testID={testID} onPress={onPress} disabled={!onPress}>
    <View style={[styles.card, selected && styles.selected]}>
      <Text style={[styles.value, isRed(card.suit) && styles.red]}>
        {card.value}{SUIT_SYMBOL[card.suit]}
      </Text>
    </View>
  </Pressable>
)

const styles = StyleSheet.create({
  card: {
    width: 60,
    height: 90,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderColor: '#f1c40f',
    borderWidth: 3,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e1e1e',
  },
  red: {
    color: '#c0392b',
  },
})
