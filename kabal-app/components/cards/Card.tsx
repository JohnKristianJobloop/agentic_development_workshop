import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { FaceUpCard } from '../../types/card.types'

type Props = {
  card: FaceUpCard
}

const SUIT_SYMBOL: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

const isRed = (suit: string) => suit === 'hearts' || suit === 'diamonds'

export const Card = ({ card }: Props) => (
  <View style={styles.card}>
    <Text style={[styles.value, isRed(card.suit) && styles.red]}>
      {card.value}{SUIT_SYMBOL[card.suit]}
    </Text>
  </View>
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
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e1e1e',
  },
  red: {
    color: '#c0392b',
  },
})
