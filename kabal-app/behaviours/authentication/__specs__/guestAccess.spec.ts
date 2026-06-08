import { renderHook } from '@testing-library/react-native'
import { useGuestAccess } from '../useGuestAccess'
import { useAuthStore } from '../../../state/authStore'

describe('Guest Access', () => {
  describe('Given an anonymous user', () => {
    it('Then isGuest is true', () => {
      useAuthStore.setState({ user: { kind: 'anonymous' } })
      const { result } = renderHook(() => useGuestAccess())
      expect(result.current.isGuest).toBe(true)
    })
  })

  describe('Given an authenticated user', () => {
    it('Then isGuest is false', () => {
      useAuthStore.setState({
        user: { kind: 'authenticated', uid: 'uid-1', email: 'a@b.com', displayName: 'A' },
      })
      const { result } = renderHook(() => useGuestAccess())
      expect(result.current.isGuest).toBe(false)
    })
  })
})
