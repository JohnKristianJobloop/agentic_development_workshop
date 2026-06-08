import { renderHook, act } from '@testing-library/react-native'
import { useSignUp } from '../useSignUp'
import * as firebaseAuth from '../../../infrastructure/firebase/auth'
import * as storage from '../../../infrastructure/storage/asyncStorage'
import { useAuthStore } from '../../../state/authStore'

jest.mock('../../../infrastructure/firebase/auth')
jest.mock('../../../infrastructure/storage/asyncStorage')

const mockCredential = {
  user: {
    uid: 'uid-123',
    getIdToken: jest.fn().mockResolvedValue('token-abc'),
  },
}

describe('Sign Up', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState({ user: { kind: 'anonymous' } })
  })

  describe('Given a new anonymous user', () => {
    describe('When they provide a valid email and password', () => {
      it('Then a new Firebase account is created', async () => {
        jest.spyOn(firebaseAuth, 'createUser').mockResolvedValue(mockCredential as any)
        const { result } = renderHook(() => useSignUp())
        await act(() => result.current.signUp('test@test.com', 'password123', 'Tester'))
        expect(firebaseAuth.createUser).toHaveBeenCalledWith('test@test.com', 'password123')
      })

      it('Then the session token is saved to AsyncStorage', async () => {
        jest.spyOn(firebaseAuth, 'createUser').mockResolvedValue(mockCredential as any)
        jest.spyOn(storage, 'saveSessionToken')
        const { result } = renderHook(() => useSignUp())
        await act(() => result.current.signUp('test@test.com', 'password123', 'Tester'))
        expect(storage.saveSessionToken).toHaveBeenCalledWith('token-abc')
      })

      it('Then the auth store is set to authenticated', async () => {
        jest.spyOn(firebaseAuth, 'createUser').mockResolvedValue(mockCredential as any)
        const { result } = renderHook(() => useSignUp())
        await act(() => result.current.signUp('test@test.com', 'password123', 'Tester'))
        const user = useAuthStore.getState().user
        expect(user.kind).toBe('authenticated')
      })
    })

    describe('When Firebase rejects the request', () => {
      it('Then an error is thrown without updating the auth store', async () => {
        jest.spyOn(firebaseAuth, 'createUser').mockRejectedValue(new Error('email-already-in-use'))
        const { result } = renderHook(() => useSignUp())
        await expect(
          act(() => result.current.signUp('taken@test.com', 'password123', 'Tester'))
        ).rejects.toThrow('email-already-in-use')
        expect(useAuthStore.getState().user.kind).toBe('anonymous')
      })
    })
  })
})
