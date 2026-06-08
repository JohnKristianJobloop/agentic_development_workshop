import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useGameRules } from '../../behaviours/game-rules/useGameRules'
import { useCreateGameSession } from '../../behaviours/game-session/useCreateGameSession'
import { Button } from '../../components/ui/Button'

export default function ConfigScreen() {
  const router = useRouter()
  const { rules, updateRules, resetRules } = useGameRules()
  const { createSession } = useCreateGameSession()

  const handleStart = async () => {
    await createSession(rules)
    router.replace('/(protected)/game')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game config</Text>

      <Text style={styles.label}>Draw count: {rules.drawCount}</Text>
      <View style={styles.row}>
        <Button label="Draw 1" onPress={() => updateRules({ drawCount: 1 })} />
        <Button label="Draw 3" onPress={() => updateRules({ drawCount: 3 })} />
      </View>

      <Text style={styles.label}>Empty pile rule: {rules.emptyPileRule}</Text>
      <View style={styles.row}>
        <Button label="King only" onPress={() => updateRules({ emptyPileRule: 'king-only' })} />
        <Button label="Any card" onPress={() => updateRules({ emptyPileRule: 'any' })} />
      </View>

      <Button label="Reset to defaults" onPress={resetRules} />
      <Button label="Start game" onPress={handleStart} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  label: { fontSize: 16, color: '#555' },
  row: { flexDirection: 'row', gap: 8 },
})
