import { calcBond } from './calcBond'

test('calc bond', () => {
  expect(calcBond(0, 715, 71, 100)).toEqual(78600)
})
