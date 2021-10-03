export const calcBond = (
  initialBond: number,
  questBond: number,
  questBondBonus: number,
  lap: number
): number =>
  initialBond + (questBond + (isNaN(questBondBonus) ? 0 : questBondBonus)) * lap
