import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { Button } from '../../components/ui/Button'

export default function LandingScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kabal</Text>
      <Button label="Log in" onPress={() => router.push('/(public)/login')} />
      <Button label="Sign up" onPress={() => router.push('/(public)/signup')} />
      <Button label="Continue as guest" onPress={() => router.push('/(protected)/home')} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  title: { fontSize: 48, fontWeight: 'bold', marginBottom: 24 },
})
