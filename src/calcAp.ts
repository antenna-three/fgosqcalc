export const calcAp = (initialTime: Date, currentTime: Date, initialSaintQuartz: number, initialAp: number, maxAp: number, questAp: number, lap: number) => {
    const consumedAp = questAp * lap
    const reocoveredAp = Math.floor((currentTime.getTime() - initialTime.getTime()) / (1000 * 60 * 5))
    const paidAp = consumedAp - initialAp - reocoveredAp
    const consumedSaintQuartz = Math.ceil(paidAp / maxAp)
    const finalApMax = (maxAp - paidAp % maxAp) % maxAp
    const finalApMin = finalApMax - consumedSaintQuartz
    const finalSaintQuartz = initialSaintQuartz - consumedSaintQuartz
    return {finalSaintQuartz, finalApMin, finalApMax}
}