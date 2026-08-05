import dayjs from 'dayjs'

export const WEEKDAYS_KO = ['일', '월', '화', '수', '목', '금', '토']

export const DATE_FMT = 'YYYY-MM-DD'
export function todayStr() { return dayjs().format(DATE_FMT) }
