import { getDatabase, ref, set, get, onValue, DatabaseReference } from 'firebase/database'
import { firebaseApp } from './config'
import { Card } from '../../types/card.types'
import { GameBoardState, GameSession } from '../../types/game.types'

export const db = getDatabase(firebaseApp)

// Board dimensions, mirrored from useCreateGameSession.
const TABLEAU_PILE_COUNT = 7
const FOUNDATION_COUNT = 4

// Firebase Realtime Database does not persist empty arrays/objects: any pile
// that is empty when written is dropped, and a populated array comes back with
// `null` holes where the empty entries were. The `as GameSession` cast can't
// see this, so we re-hydrate the board on read to honour the GameSession type.
const toPile = (value: unknown): Card[] =>
  Array.isArray(value) ? value.filter((card): card is Card => card != null) : []

const toFixedPiles = (value: unknown, count: number): Card[][] => {
  const source = Array.isArray(value) ? value : []
  return Array.from({ length: count }, (_, i) => toPile(source[i]))
}

const normalizeBoard = (board: Partial<GameBoardState> | undefined): GameBoardState => ({
  tableau: toFixedPiles(board?.tableau, TABLEAU_PILE_COUNT),
  foundations: toFixedPiles(board?.foundations, FOUNDATION_COUNT),
  stock: toPile(board?.stock),
  waste: toPile(board?.waste),
})

const normalizeSession = (raw: unknown): GameSession => {
  const session = raw as GameSession
  return { ...session, board: normalizeBoard(session?.board) }
}

export const writeGameSession = (userId: string, session: GameSession) =>
  set(ref(db, `users/${userId}/activeSession`), session)

export const readGameSession = async (userId: string): Promise<GameSession | null> => {
  const snapshot = await get(ref(db, `users/${userId}/activeSession`))
  return snapshot.exists() ? normalizeSession(snapshot.val()) : null
}

export const subscribeToGameSession = (
  userId: string,
  callback: (session: GameSession | null) => void
): (() => void) => {
  const sessionRef: DatabaseReference = ref(db, `users/${userId}/activeSession`)
  const unsubscribe = onValue(sessionRef, (snapshot) => {
    callback(snapshot.exists() ? normalizeSession(snapshot.val()) : null)
  })
  return unsubscribe
}
