import { useState, useEffect } from 'react'

const STORAGE_KEY = 'routine_checks'

export function useRoutineChecks() {
  const [checks, setChecks] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checks))
  }, [checks])

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
