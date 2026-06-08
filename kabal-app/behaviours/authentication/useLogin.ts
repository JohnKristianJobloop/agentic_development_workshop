import { signIn } from '../../infrastructure/firebase/auth'
import { saveSessionToken } from '../../infrastructure/storage/asyncStorage'
import { useAuthStore } from '../../state/authStore'

export const useLogin = () => {
  const setUser = useAuthStore((s) => s.setUser)

  const login = async (email: string, password: string) => {
    const credential = await signIn(email, password)
    const token = await credential.user.getIdToken()
    await saveSessionToken(token)
    setUser({
      kind: 'authenticated',
      uid: credential.user.uid,
      email: credential.user.email ?? email,
      displayName: credential.user.displayName ?? email,
    })
  }

  return { login }
}
