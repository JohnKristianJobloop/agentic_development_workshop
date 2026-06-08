import { getDatabase, ref, set, get, onValue, DatabaseReference } from 'firebase/database'
import { firebaseApp } from './config'
import { GameSession } from '../../types/game.types'

export const db = getDatabase(firebaseApp)

export const writeGameSession = (userId: string, session: GameSession) =>
  set(ref(db, `users/${userId}/activeSession`), session)

export const readGameSession = async (userId: string): Promise<GameSession | null> => {
  const snapshot = await get(ref(db, `users/${userId}/activeSession`))
  return snapshot.exists() ? (snapshot.val() as GameSession) : null
}

export const subscribeToGameSession = (
  userId: string,
  callback: (session: GameSession | null) => void
): (() => void) => {
  const sessionRef: DatabaseReference = ref(db, `users/${userId}/activeSession`)
  const unsubscribe = onValue(sessionRef, (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as GameSession) : null)
  })
  return unsubscribe
}
