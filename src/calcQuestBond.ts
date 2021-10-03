export const calcQuestBond = ({
  questLv,
  bondBonus,
  portrait,
}: {
  questLv: number
  bondBonus: number
  portrait: number
}): { questBond: number; questBondBonus: number } => ({
  questBond: questLv * 10 + 15,
  questBondBonus: Math.floor(
    (questLv * 10 + 15) * (bondBonus / 100) + portrait
  ),
})
