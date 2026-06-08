import { useAuthStore } from '../../state/authStore'

export const useGuestAccess = () => {
  const user = useAuthStore((s) => s.user)

  const isGuest = user.kind === 'anonymous'

  return { isGuest }
}
