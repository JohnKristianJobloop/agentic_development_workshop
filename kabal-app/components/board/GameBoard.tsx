import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Pressable } from 'react-native'
import { Pile } from './Pile'
import { Foundation } from './Foundation'
import { Card as CardComponent } from '../cards/Card'
import { CardBack } from '../cards/CardBack'
import { GameBoardState } from '../../types/game.types'
import { FaceUpCard } from '../../types/card.types'
import { useGameBoard } from '../../behaviours/game-board/useGameBoard'

type Props = {
  board: GameBoardState
}

// A move always starts by selecting a source card (the top of the waste, or a
// face-up card in a tableau pile) and is completed by tapping a destination
// (another tableau pile or a foundation). Tapping the selected card again clears
// the selection.
type Selection =
  | { source: 'tableau'; pile: number; cardId: string }
  | { source: 'waste'; cardId: string }
  | null

export const GameBoard = ({ board }: Props) => {
  const {
    moveCard,
    moveToFoundation,
    drawFromStock,
    moveFromWaste,
    moveFromWasteToFoundation,
  } = useGameBoard()
  const [selection, setSelection] = useState<Selection>(null)

  const toggle = (next: Exclude<Selection, null>) =>
    setSelection((current) => (current?.cardId === next.cardId ? null : next))

  const targetTableau = (toPile: number) => {
    if (!selection) return
    if (selection.source === 'waste') {
      moveFromWaste({ cardId: selection.cardId, toPile })
    } else if (selection.pile !== toPile) {
      moveCard({ cardId: selection.cardId, fromPile: selection.pile, toPile })
    }
    setSelection(null)
  }

  const targetFoundation = (foundationIndex: number) => {
    if (!selection) return
    if (selection.source === 'waste') {
      moveFromWasteToFoundation({ cardId: selection.cardId, foundationIndex })
    } else {
      moveToFoundation({ cardId: selection.cardId, fromPile: selection.pile, foundationIndex })
    }
    setSelection(null)
  }

  const handleTableauCardPress = (pile: number) => (cardId: string) => {
    if (selection) targetTableau(pile)
    else toggle({ source: 'tableau', pile, cardId })
  }

  const wasteTop = board.waste.at(-1) as FaceUpCard | undefined

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.stockWaste}>
          <Pressable testID="stock" onPress={drawFromStock}>
            {board.stock.length > 0 ? <CardBack /> : <View style={styles.emptySlot} />}
          </Pressable>
          <View testID="waste">
            {wasteTop
              ? <CardComponent
                  card={wasteTop}
                  onPress={() => toggle({ source: 'waste', cardId: wasteTop.id })}
                  selected={selection?.cardId === wasteTop.id}
                  testID={`card-${wasteTop.id}`}
                />
              : <View style={styles.emptySlot} />}
          </View>
        </View>
        <View style={styles.foundations}>
          {board.foundations.map((foundation, i) => (
            <Foundation
              key={i}
              cards={foundation}
              onPress={() => targetFoundation(i)}
              testID={`foundation-${i}`}
            />
          ))}
        </View>
      </View>
      <View style={styles.tableau}>
        {board.tableau.map((pile, i) => (
          <Pile
            key={i}
            cards={pile}
            testID={`tableau-${i}`}
            selectedCardId={selection?.source === 'tableau' ? selection.cardId : undefined}
            onCardPress={handleTableauCardPress(i)}
            onBackgroundPress={() => targetTableau(i)}
          />
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockWaste: {
    flexDirection: 'row',
    gap: 8,
  },
  foundations: {
    flexDirection: 'row',
    gap: 8,
  },
  emptySlot: {
    width: 60,
    height: 90,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#aaa',
  },
  tableau: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
})
