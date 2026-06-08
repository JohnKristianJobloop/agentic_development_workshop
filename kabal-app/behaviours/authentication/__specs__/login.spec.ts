import { renderHook, act } from '@testing-library/react-native'
import { useLogin } from '../useLogin'
import * as firebaseAuth from '../../../infrastructure/firebase/auth'
import * as storage from '../../../infrastructure/storage/asyncStorage'
import { useAuthStore } from '../../../state/authStore'

jest.mock('../../../infrastructure/firebase/auth')
jest.mock('../../../infrastructure/storage/asyncStorage')

const mockCredential = {
  user: {
    uid: 'uid-456',
    email: 'user@test.com',
    displayName: 'Existing User',
    getIdToken: jest.fn().mockResolvedValue('token-xyz'),
  },
}

describe('Login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState({ user: { kind: 'anonymous' } })
  })

  describe('Given an existing user', () => {
    describe('When they provide valid credentials', () => {
      it('Then Firebase signIn is called with the credentials', async () => {
        jest.spyOn(firebaseAuth, 'signIn').mockResolvedValue(mockCredential as any)
        const { result } = renderHook(() => useLogin())
        await act(() => result.current.login('user@test.com', 'password123'))
        expect(firebaseAuth.signIn).toHaveBeenCalledWith('user@test.com', 'password123')
      })

      it('Then the session token is persisted in AsyncStorage', async () => {
        jest.spyOn(firebaseAuth, 'signIn').mockResolvedValue(mockCredential as any)
        jest.spyOn(storage, 'saveSessionToken')
        const { result } = renderHook(() => useLogin())
        await act(() => result.current.login('user@test.com', 'password123'))
        expect(storage.saveSessionToken).toHaveBeenCalledWith('token-xyz')
      })

      it('Then the auth store reflects the authenticated user', async () => {
        jest.spyOn(firebaseAuth, 'signIn').mockResolvedValue(mockCredential as any)
        const { result } = renderHook(() => useLogin())
        await act(() => result.current.login('user@test.com', 'password123'))
        const user = useAuthStore.getState().user
        expect(user.kind).toBe('authenticated')
        if (user.kind === 'authenticated') {
          expect(user.uid).toBe('uid-456')
        }
      })
    })

    describe('When they provide wrong credentials', () => {
      it('Then an error is thrown and the store remains anonymous', async () => {
        jest.spyOn(firebaseAuth, 'signIn').mockRejectedValue(new Error('wrong-password'))
        const { result } = renderHook(() => useLogin())
        await expect(
          act(() => result.current.login('user@test.com', 'wrong'))
        ).rejects.toThrow('wrong-password')
        expect(useAuthStore.getState().user.kind).toBe('anonymous')
      })
    })
  })
})
