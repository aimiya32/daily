import { useState, useEffect } from 'react'
import { nk } from '../lib/accountStorage'

export function useSchedules() {
  const STORAGE_KEY = nk('schedule_entries')
  const [schedules, setSchedules] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules))
  }, [schedules])

  function saveSchedule(schedule) {
    setSchedules(prev => {
      const idx = prev.findIndex(s => s.id === schedule.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = schedule
        return updated
      }
      return [...prev, schedule].sort((a, b) => a.date < b.date ? -1 : 1)
    })
  }

  function deleteSchedule(id) {
    setSchedules(prev => prev.filter(s => s.id !== id))
  }

  function mergeSchedules(remote) {
    setSchedules(prev => {
      const map = new Map(prev.map(s => [s.id, s]))
      for (const s of remote) {
        const existing = map.get(s.id)
        if (!existing || s.updatedAt > existing.updatedAt) map.set(s.id, s)
      }
      return Array.from(map.values()).sort((a, b) => a.date < b.date ? -1 : 1)
    })
  }

  return { schedules, saveSchedule, deleteSchedule, mergeSchedules }
}
