import { calcQuestBond } from './calcQuestBond'

expect(calcQuestBond({ questLv: 70, bondBonus: 10, portrait: 50 })).toEqual({
  questBond: 715,
  questBondBonus: 121,
})
