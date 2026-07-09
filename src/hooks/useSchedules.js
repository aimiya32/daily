import { useMemo } from 'react'
import { nk } from '../lib/accountStorage'
import { mergeById } from '../lib/mergeById'
import { useLocalStorageState } from './useLocalStorageState'
import { tombstone, visible, pruneTombstones } from '../lib/tombstone'

const byDateAsc = (a, b) => (a.date < b.date ? -1 : 1)

export function useSchedules() {
  const [allSchedules, setSchedules] = useLocalStorageState(nk('schedule_records'), [], items => pruneTombstones(items))

  function saveSchedule(schedule) {
    setSchedules(prev => {
      const idx = prev.findIndex(s => s.id === schedule.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = schedule
        return updated
      }
      return [...prev, schedule].sort(byDateAsc)
    })
  }

  function deleteSchedule(id) {
    setSchedules(prev => prev.map(s => (s.id === id ? tombstone(s) : s)))
  }

  function deleteByRecurrenceId(recurrenceId) {
    setSchedules(prev => prev.map(s => (s.recurrenceId === recurrenceId ? tombstone(s) : s)))
  }

  // 같은 recurrenceId를 공유하는 일괄 등록 일정 전체에 patch(날짜 외 필드) 병합
  function updateByRecurrenceId(recurrenceId, patch) {
    setSchedules(prev => prev.map(s =>
      s.recurrenceId === recurrenceId && !s.deleted
        ? { ...s, ...patch, updatedAt: new Date().toISOString() }
        : s
    ))
  }

  function mergeSchedules(remote) {
    setSchedules(prev => mergeById(prev, remote, byDateAsc))
  }

  const schedules = useMemo(() => visible(allSchedules), [allSchedules])

  return { schedules, allSchedules, saveSchedule, deleteSchedule, deleteByRecurrenceId, updateByRecurrenceId, mergeSchedules }
}
