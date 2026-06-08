import 'react-native-get-random-values'
import { useEffect } from 'react'
import { Stack } from 'expo-router'
import * as ScreenOrientation from 'expo-screen-orientation'
import { useSessionToken } from '../behaviours/authentication/useSessionToken'

export default function RootLayout() {
  useSessionToken()

  // app.json allows all orientations so the game screen can lock to landscape;
  // every other screen should stay portrait, so default to it app-wide here.
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
  }, [])

  return <Stack screenOptions={{ headerShown: false }} />
}
