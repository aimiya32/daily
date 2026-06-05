import { useState, useEffect } from 'react'
import { nk } from '../lib/accountStorage'

// 로그 1건: { id, categoryId, date(YYYY-MM-DD), planned, actual, updatedAt }
export function useTrackerLogs() {
  const STORAGE_KEY = nk('tracker_logs')
  const [logs, setLogs] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
  }, [logs])

  function getLog(categoryId, date) {
    return logs.find(l => l.categoryId === categoryId && l.date === date) ?? null
  }

  // planned / actual 중 전달된 값만 갱신. 둘 다 비면 로그 삭제.
  function setLog(categoryId, date, patch) {
    setLogs(prev => {
      const idx = prev.findIndex(l => l.categoryId === categoryId && l.date === date)
      const base = idx >= 0 ? prev[idx] : { planned: null, actual: null }
      const next = {
        id: idx >= 0 ? prev[idx].id : crypto.randomUUID(),
        categoryId,
        date,
        planned: 'planned' in patch ? patch.planned : base.planned,
        actual: 'actual' in patch ? patch.actual : base.actual,
        updatedAt: new Date().toISOString(),
      }
      const empty = (next.planned === null || next.planned === undefined || next.planned === '') &&
                    (next.actual === null || next.actual === undefined || next.actual === '')
      if (idx >= 0) {
        const updated = [...prev]
        if (empty) { updated.splice(idx, 1); return updated }
        updated[idx] = next
        return updated
      }
      if (empty) return prev
      return [...prev, next]
    })
  }

  function deleteLogsByCategory(categoryId) {
    setLogs(prev => prev.filter(l => l.categoryId !== categoryId))
  }

  // updates: [{ categoryId, date, planned }] — planned가 null/''이면 계획만 비움.
  // (실제값이 함께 비어있는 로그는 제거)
  function bulkSetPlanned(updates) {
    if (!Array.isArray(updates) || updates.length === 0) return
    const now = new Date().toISOString()
    setLogs(prev => {
      const arr = [...prev]
      for (const u of updates) {
        const planned = (u.planned === '' || u.planned === undefined) ? null : u.planned
        const idx = arr.findIndex(l => l.categoryId === u.categoryId && l.date === u.date)
        if (idx >= 0) {
          const next = { ...arr[idx], planned, updatedAt: now }
          const empty = (next.planned === null || next.planned === undefined) &&
                        (next.actual === null || next.actual === undefined || next.actual === '')
          if (empty) arr.splice(idx, 1)
          else arr[idx] = next
        } else if (planned !== null) {
          arr.push({ id: crypto.randomUUID(), categoryId: u.categoryId, date: u.date, planned, actual: null, updatedAt: now })
        }
      }
      return arr
    })
  }

  function mergeLogs(remote) {
    if (!Array.isArray(remote)) return
    setLogs(prev => {
      const map = new Map(prev.map(l => [l.id, l]))
      for (const l of remote) {
        const existing = map.get(l.id)
        if (!existing || l.updatedAt > existing.updatedAt) map.set(l.id, l)
      }
      return Array.from(map.values())
    })
  }

  return { logs, getLog, setLog, deleteLogsByCategory, bulkSetPlanned, mergeLogs }
}
