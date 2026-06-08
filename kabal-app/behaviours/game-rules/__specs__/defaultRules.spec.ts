import { defaultRules } from '../defaultRules'

describe('Default Rules', () => {
  it('draws 1 card from stock', () => {
    expect(defaultRules.drawCount).toBe(1)
  })

  it('only allows Kings on empty tableau piles', () => {
    expect(defaultRules.emptyPileRule).toBe('king-only')
  })

  it('uses random sorting', () => {
    expect(defaultRules.sortingBehaviour).toBe('random')
  })

  it('has no custom card scoring values', () => {
    expect(defaultRules.cardScoringValues).toEqual({})
  })
})
