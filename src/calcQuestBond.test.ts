import { calcQuestBond } from './calcQuestBond'

test('quest bond', () => {
  expect(calcQuestBond({ questLv: 70, bondBonus: 10, portrait: 50 })).toEqual({
    questBond: 715,
    questBondBonus: 121,
  })
})
