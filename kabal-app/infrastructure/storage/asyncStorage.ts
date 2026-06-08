import AsyncStorage from '@react-native-async-storage/async-storage'

const SESSION_KEY = '@kabal/session_token'

export const saveSessionToken = (token: string) =>
  AsyncStorage.setItem(SESSION_KEY, token)

export const loadSessionToken = () =>
  AsyncStorage.getItem(SESSION_KEY)

export const clearSessionToken = () =>
  AsyncStorage.removeItem(SESSION_KEY)
