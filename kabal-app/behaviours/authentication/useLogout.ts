import { signOut } from '../../infrastructure/firebase/auth'
import { clearSessionToken } from '../../infrastructure/storage/asyncStorage'
import { useAuthStore } from '../../state/authStore'

export const useLogout = () => {
  const setUser = useAuthStore((s) => s.setUser)

  const logout = async () => {
    await signOut()
    await clearSessionToken()
    setUser({ kind: 'anonymous' })
  }

  return { logout }
}
