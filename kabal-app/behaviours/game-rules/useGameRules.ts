import { useState } from 'react'
import { GameRules } from '../../types/game.types'
import { defaultRules } from './defaultRules'

export const useGameRules = () => {
  const [rules, setRules] = useState<GameRules>(defaultRules)

  const updateRules = (patch: Partial<GameRules>) => {
    setRules((current) => ({ ...current, ...patch }))
  }

  const resetRules = () => setRules(defaultRules)

  return { rules, updateRules, resetRules }
}
