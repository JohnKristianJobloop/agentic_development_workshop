import { readGameSession } from '../../infrastructure/firebase/database'
import { useGameStore } from '../../state/gameStore'
import { useAuthStore } from '../../state/authStore'

export const useResumeGameSession = () => {
  const setActiveSession = useGameStore((s) => s.setActiveSession)
  const user = useAuthStore((s) => s.user)

  const resumeSession = async () => {
    if (user.kind !== 'authenticated') return
    const session = await readGameSession(user.uid)
    setActiveSession(session)
  }

  return { resumeSession }
}
