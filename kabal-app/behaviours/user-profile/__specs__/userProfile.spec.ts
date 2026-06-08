import { renderHook, act } from '@testing-library/react-native'
import { useUserProfile } from '../useUserProfile'
import { useAuthStore } from '../../../state/authStore'
import { useUserStore } from '../../../state/userStore'

const authenticatedUser = {
  kind: 'authenticated' as const,
  uid: 'uid-1',
  email: 'a@b.com',
  displayName: 'Original Name',
}

const existingProfile = {
  uid: 'uid-1',
  displayName: 'Original Name',
  createdAt: Date.now(),
}

describe('User Profile', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: authenticatedUser })
    useUserStore.setState({ profile: existingProfile })
  })

  describe('Given an authenticated user with a profile', () => {
    describe('When they update their display name', () => {
      it('Then the profile store reflects the new name', () => {
        const { result } = renderHook(() => useUserProfile())
        act(() => result.current.updateProfile({ displayName: 'New Name' }))
        expect(useUserStore.getState().profile?.displayName).toBe('New Name')
      })
    })

    describe('When they update their avatar', () => {
      it('Then the profile store reflects the new avatar URL', () => {
        const { result } = renderHook(() => useUserProfile())
        act(() => result.current.updateProfile({ avatarUrl: 'https://example.com/avatar.png' }))
        expect(useUserStore.getState().profile?.avatarUrl).toBe('https://example.com/avatar.png')
      })
    })
  })

  describe('Given an anonymous user', () => {
    it('Then updateProfile is a no-op', () => {
      useAuthStore.setState({ user: { kind: 'anonymous' } })
      const { result } = renderHook(() => useUserProfile())
      act(() => result.current.updateProfile({ displayName: 'Should Not Apply' }))
      expect(useUserStore.getState().profile?.displayName).toBe('Original Name')
    })
  })
})
