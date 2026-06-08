import { renderHook, act } from '@testing-library/react-native'
import { useLogout } from '../useLogout'
import * as firebaseAuth from '../../../infrastructure/firebase/auth'
import * as storage from '../../../infrastructure/storage/asyncStorage'
import { useAuthStore } from '../../../state/authStore'

jest.mock('../../../infrastructure/firebase/auth')
jest.mock('../../../infrastructure/storage/asyncStorage')

describe('Logout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState({
      user: { kind: 'authenticated', uid: 'uid-1', email: 'a@b.com', displayName: 'A' },
    })
  })

  describe('Given an authenticated user', () => {
    describe('When they log out', () => {
      it('Then Firebase signOut is called', async () => {
        jest.spyOn(firebaseAuth, 'signOut').mockResolvedValue()
        const { result } = renderHook(() => useLogout())
        await act(() => result.current.logout())
        expect(firebaseAuth.signOut).toHaveBeenCalled()
      })

      it('Then the session token is removed from AsyncStorage', async () => {
        jest.spyOn(firebaseAuth, 'signOut').mockResolvedValue()
        jest.spyOn(storage, 'clearSessionToken')
        const { result } = renderHook(() => useLogout())
        await act(() => result.current.logout())
        expect(storage.clearSessionToken).toHaveBeenCalled()
      })

      it('Then the auth store is reset to anonymous', async () => {
        jest.spyOn(firebaseAuth, 'signOut').mockResolvedValue()
        const { result } = renderHook(() => useLogout())
        await act(() => result.current.logout())
        expect(useAuthStore.getState().user.kind).toBe('anonymous')
      })
    })
  })
})
