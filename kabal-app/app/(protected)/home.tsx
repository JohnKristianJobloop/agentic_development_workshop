import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../state/authStore'
import { useGameStore } from '../../state/gameStore'
import { Button } from '../../components/ui/Button'

export default function HomeScreen() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const activeSession = useGameStore((s) => s.activeSession)

  const displayName = user.kind === 'authenticated' ? user.displayName : 'Guest'

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {displayName}</Text>
      {activeSession
        ? <Button label="Resume game" onPress={() => router.push('/(protected)/game')} />
        : null}
      <Button label="New game" onPress={() => router.push('/(protected)/config')} />
      {user.kind === 'authenticated'
        ? <Button label="Profile" onPress={() => router.push('/(protected)/profile')} />
        : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 16 },
})
