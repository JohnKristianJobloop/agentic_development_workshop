import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useSignUp } from '../../behaviours/authentication/useSignUp'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export default function SignUpScreen() {
  const router = useRouter()
  const { signUp } = useSignUp()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSignUp = async () => {
    try {
      await signUp(email, password, displayName)
      router.replace('/(protected)/home')
    } catch {
      setError('Could not create account. The email may already be in use.')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <Input placeholder="Display name" value={displayName} onChangeText={setDisplayName} />
      <Input placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Input placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button label="Sign up" onPress={handleSignUp} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  error: { color: '#c0392b' },
})
