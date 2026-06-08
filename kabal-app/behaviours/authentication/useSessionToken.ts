import { useEffect } from 'react'
import { subscribeToAuthState } from '../../infrastructure/firebase/auth'
import { loadSessionToken, clearSessionToken } from '../../infrastructure/storage/asyncStorage'
import { useAuthStore } from '../../state/authStore'

export const useSessionToken = () => {
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      if (!firebaseUser) {
        await clearSessionToken()
        setUser({ kind: 'anonymous' })
        return
      }

      const token = await loadSessionToken()
      if (!token) {
        setUser({ kind: 'anonymous' })
        return
      }

      setUser({
        kind: 'authenticated',
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        displayName: firebaseUser.displayName ?? '',
      })
    })

    return unsubscribe
  }, [])
}
