import { calcAp } from './calcAp'

test('calc ap', () => {
  expect(
    calcAp(
      new Date('2000-01-01T00:00'),
      new Date('2000-01-02T00:00'),
      100,
      100,
      144,
      20,
      100
    )
  ).toEqual({
    finalSaintQuartz: 88,
    finalApMin: 104,
    finalApMax: 116,
  })
})
