import { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useUserProfile } from '../../behaviours/user-profile/useUserProfile'
import { useLogout } from '../../behaviours/authentication/useLogout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export default function ProfileScreen() {
  const router = useRouter()
  const { profile, updateProfile } = useUserProfile()
  const { logout } = useLogout()
  const [displayName, setDisplayName] = useState(profile?.displayName ?? '')

  const handleSave = () => updateProfile({ displayName })

  const handleLogout = async () => {
    await logout()
    router.replace('/(public)')
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Input placeholder="Display name" value={displayName} onChangeText={setDisplayName} />
      <Button label="Save" onPress={handleSave} />
      <Button label="Log out" onPress={handleLogout} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 12, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
})
