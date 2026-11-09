// 표시 위치가 없는 기존 일정은 시간 유무에 따른 기존 분류를 유지한다.
export function getScheduleVisibility(schedule) {
  return schedule.visibility ?? (schedule.time ? 'weekly' : 'monthly')
}

export function isScheduleVisible(schedule, view) {
  const visibility = getScheduleVisibility(schedule)
  return visibility === 'both' || visibility === view
}
