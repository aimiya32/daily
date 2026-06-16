import KoreanLunarCalendar from 'korean-lunar-calendar'

const _cal = new KoreanLunarCalendar()

export function getLunarLabel(year, month, day) {
  if (!_cal.setSolarDate(year, month, day)) return ''
  const { month: lm, day: ld, intercalation } = _cal.getLunarCalendar()
  const prefix = intercalation ? `윤${lm}` : `${lm}`
  return `${prefix}.${ld}`
}

export function solarFromLunar(year, lunarMonth, lunarDay) {
  if (!_cal.setLunarDate(year, lunarMonth, lunarDay, false)) return null
  return _cal.getSolarCalendar() // { year, month, day }
}
