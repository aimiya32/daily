import { useState } from 'react'
import dayjs from 'dayjs'

// 달력 화면의 현재 위치(커서). 위치를 저장하지 않으므로 화면에 들어올 때마다
// 오늘 기준으로 시작한다. 새 달력 화면도 이 훅을 쓰면 같은 동작을 얻는다.
export function useMonthCursor() {
  return useState(() => dayjs().startOf('month'))
}

export function useWeekCursor() {
  return useState(() => dayjs().startOf('week'))
}

export function useDayCursor() {
  return useState(() => dayjs().startOf('day'))
}
