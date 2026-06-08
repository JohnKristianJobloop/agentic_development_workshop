import { createUser } from '../../infrastructure/firebase/auth'
import { saveSessionToken } from '../../infrastructure/storage/asyncStorage'
import { useAuthStore } from '../../state/authStore'

export const useSignUp = () => {
  const setUser = useAuthStore((s) => s.setUser)

  const signUp = async (email: string, password: string, displayName: string) => {
    const credential = await createUser(email, password)
    const token = await credential.user.getIdToken()
    await saveSessionToken(token)
    setUser({ kind: 'authenticated', uid: credential.user.uid, email, displayName })
  }

  return { signUp }
}
