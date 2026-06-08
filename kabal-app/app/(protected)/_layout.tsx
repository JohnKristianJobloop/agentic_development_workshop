import { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { useAuthStore } from '../../state/authStore'
import { useResumeGameSession } from '../../behaviours/game-session/useResumeGameSession'

export default function ProtectedLayout() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const { resumeSession } = useResumeGameSession()

  useEffect(() => {
    if (user.kind === 'authenticated') {
      resumeSession()
    }
  }, [user])

  return <Stack screenOptions={{ headerShown: false }} />
}
