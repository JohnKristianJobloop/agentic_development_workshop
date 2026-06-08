import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Pile } from './Pile'
import { Foundation } from './Foundation'
import { GameBoardState } from '../../types/game.types'

type Props = {
  board: GameBoardState
}

export const GameBoard = ({ board }: Props) => (
  <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.topRow}>
      {board.foundations.map((foundation, i) => (
        <Foundation key={i} cards={foundation} />
      ))}
    </View>
    <View style={styles.tableau}>
      {board.tableau.map((pile, i) => (
        <Pile key={i} cards={pile} />
      ))}
    </View>
  </ScrollView>
)

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
  },
  tableau: {
    flexDirection: 'row',
    gap: 8,
  },
})
