import { renderHook, act } from '@testing-library/react-native'
import { useGameRules } from '../useGameRules'
import { defaultRules } from '../defaultRules'

describe('Custom Rules', () => {
  describe('Given the default rules are active', () => {
    describe('When the draw count is changed to 3', () => {
      it('Then the active rules reflect drawCount 3', () => {
        const { result } = renderHook(() => useGameRules())
        act(() => result.current.updateRules({ drawCount: 3 }))
        expect(result.current.rules.drawCount).toBe(3)
      })
    })

    describe('When the empty pile rule is changed to any', () => {
      it('Then any card can be placed on an empty pile', () => {
        const { result } = renderHook(() => useGameRules())
        act(() => result.current.updateRules({ emptyPileRule: 'any' }))
        expect(result.current.rules.emptyPileRule).toBe('any')
      })
    })

    describe('When a custom card scoring value is set', () => {
      it('Then the scoring value is stored against that card key', () => {
        const { result } = renderHook(() => useGameRules())
        act(() => result.current.updateRules({ cardScoringValues: { 'ace-hearts': 100 } }))
        expect(result.current.rules.cardScoringValues['ace-hearts']).toBe(100)
      })
    })

    describe('When the rules are reset', () => {
      it('Then the active rules return to the defaults', () => {
        const { result } = renderHook(() => useGameRules())
        act(() => result.current.updateRules({ drawCount: 3, emptyPileRule: 'any' }))
        act(() => result.current.resetRules())
        expect(result.current.rules).toEqual(defaultRules)
      })
    })
  })
})
