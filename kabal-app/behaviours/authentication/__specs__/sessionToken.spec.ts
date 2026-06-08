import { renderHook } from '@testing-library/react-native'
import { useSessionToken } from '../useSessionToken'
import * as firebaseAuth from '../../../infrastructure/firebase/auth'
import * as storage from '../../../infrastructure/storage/asyncStorage'
import { useAuthStore } from '../../../state/authStore'

jest.mock('../../../infrastructure/firebase/auth')
jest.mock('../../../infrastructure/storage/asyncStorage')

const mockFirebaseUser = {
  uid: 'uid-789',
  email: 'returning@test.com',
  displayName: 'Returning User',
}

describe('Session Token', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useAuthStore.setState({ user: { kind: 'anonymous' } })
  })

  describe('Given a user opens the app', () => {
    describe('When a valid session token exists in AsyncStorage', () => {
      it('Then the auth store is set to authenticated', async () => {
        jest.spyOn(firebaseAuth, 'subscribeToAuthState').mockImplementation((cb) => {
          cb(mockFirebaseUser as any)
          return jest.fn()
        })
        jest.spyOn(storage, 'loadSessionToken').mockResolvedValue('valid-token')

        renderHook(() => useSessionToken())

        await new Promise((r) => setTimeout(r, 0))
        expect(useAuthStore.getState().user.kind).toBe('authenticated')
      })
    })

    describe('When no session token exists in AsyncStorage', () => {
      it('Then the auth store remains anonymous', async () => {
        jest.spyOn(firebaseAuth, 'subscribeToAuthState').mockImplementation((cb) => {
          cb(mockFirebaseUser as any)
          return jest.fn()
        })
        jest.spyOn(storage, 'loadSessionToken').mockResolvedValue(null)

        renderHook(() => useSessionToken())

        await new Promise((r) => setTimeout(r, 0))
        expect(useAuthStore.getState().user.kind).toBe('anonymous')
      })
    })

    describe('When Firebase reports no active user', () => {
      it('Then the token is cleared and the store is anonymous', async () => {
        jest.spyOn(firebaseAuth, 'subscribeToAuthState').mockImplementation((cb) => {
          cb(null)
          return jest.fn()
        })
        jest.spyOn(storage, 'clearSessionToken')

        renderHook(() => useSessionToken())

        await new Promise((r) => setTimeout(r, 0))
        expect(storage.clearSessionToken).toHaveBeenCalled()
        expect(useAuthStore.getState().user.kind).toBe('anonymous')
      })
    })
  })
})
