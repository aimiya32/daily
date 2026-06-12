import { nk } from '../lib/accountStorage'
import { mergeById } from '../lib/mergeById'
import { useLocalStorageState } from './useLocalStorageState'

const byDateAsc = (a, b) => (a.date < b.date ? -1 : 1)

export function useSchedules() {
  const [schedules, setSchedules] = useLocalStorageState(nk('schedule_records'))

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
    setSchedules(prev => prev.filter(s => s.id !== id))
  }

  function mergeSchedules(remote) {
    setSchedules(prev => mergeById(prev, remote, byDateAsc))
  }

  return { schedules, saveSchedule, deleteSchedule, mergeSchedules }
}
