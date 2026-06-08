import 'react-native-get-random-values'
import { Stack } from 'expo-router'
import { useSessionToken } from '../behaviours/authentication/useSessionToken'

export default function RootLayout() {
  useSessionToken()
  return <Stack screenOptions={{ headerShown: false }} />
}
