import { useUserStore } from '../../state/userStore'
import { useAuthStore } from '../../state/authStore'
import { UserProfile } from '../../types/auth.types'

export const useUserProfile = () => {
  const profile = useUserStore((s) => s.profile)
  const setProfile = useUserStore((s) => s.setProfile)
  const user = useAuthStore((s) => s.user)

  const updateProfile = (fields: Partial<Pick<UserProfile, 'displayName' | 'avatarUrl'>>) => {
    if (user.kind !== 'authenticated' || !profile) return
    setProfile({ ...profile, ...fields })
  }

  return { profile, updateProfile }
}
