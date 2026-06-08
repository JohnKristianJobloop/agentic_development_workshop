import { View, Text, StyleSheet } from 'react-native'
import { useGameStore } from '../../state/gameStore'
import { GameBoard } from '../../components/board/GameBoard'

export default function GameScreen() {
  const activeSession = useGameStore((s) => s.activeSession)

  if (!activeSession) {
    return (
      <View style={styles.empty}>
        <Text>No active game session.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <GameBoard board={activeSession.board} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a6b3c' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
})
