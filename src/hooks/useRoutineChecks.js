import { nk } from '../lib/accountStorage'
import { useLocalStorageState } from './useLocalStorageState'

export function useRoutineChecks() {
  const [checks, setChecks] = useLocalStorageState(nk('routine_checks'))

  function isChecked(routineId, date) {
    return checks.some(c => c.routineId === routineId && c.date === date)
  }

  function toggle(routineId, date) {
    setChecks(prev => {
      const exists = prev.some(c => c.routineId === routineId && c.date === date)
      if (exists) return prev.filter(c => !(c.routineId === routineId && c.date === date))
      return [...prev, { routineId, date }]
    })
  }

  function getCheckedRoutineIds(date) {
    return checks.filter(c => c.date === date).map(c => c.routineId)
  }

  function mergeChecks(remote) {
    setChecks(prev => {
      const set = new Set(prev.map(c => `${c.routineId}|${c.date}`))
      const newItems = remote.filter(c => !set.has(`${c.routineId}|${c.date}`))
      return [...prev, ...newItems]
    })
  }

  return { checks, isChecked, toggle, getCheckedRoutineIds, mergeChecks }
}
