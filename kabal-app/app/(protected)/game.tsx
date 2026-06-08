import { useEffect } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import * as ScreenOrientation from 'expo-screen-orientation'
import { useGameStore } from '../../state/gameStore'
import { GameBoard } from '../../components/board/GameBoard'

export default function GameScreen() {
  const activeSession = useGameStore((s) => s.activeSession)

  // The board needs the full width to fit all seven tableau piles, so lock the
  // game screen to landscape while it is mounted and restore portrait on exit.
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
    return () => {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    }
  }, [])

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
