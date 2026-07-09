import { useMemo } from 'react'
import { nk } from '../lib/accountStorage'
import { mergeById } from '../lib/mergeById'
import { useLocalStorageState } from './useLocalStorageState'
import { tombstone, visible, pruneTombstones } from '../lib/tombstone'

// 로그 1건: { id, categoryId, date(YYYY-MM-DD), planned, actual, updatedAt }
export function useTrackerLogs() {
  const [allLogs, setLogs] = useLocalStorageState(nk('tracker_logs'), [], items => pruneTombstones(items))
  const logs = useMemo(() => visible(allLogs), [allLogs])

  function getLog(categoryId, date) {
    return logs.find(l => l.categoryId === categoryId && l.date === date) ?? null
  }

  // planned / actual 중 전달된 값만 갱신. 둘 다 비면 로그 삭제.
  // actualEntries([number])를 patch에 포함하면 actual은 합계로 자동 계산.
  function setLog(categoryId, date, patch) {
    setLogs(prev => {
      const idx = prev.findIndex(l => l.categoryId === categoryId && l.date === date)
      const base = idx >= 0 ? prev[idx] : { planned: null, actual: null, actualEntries: null }

      let actual, actualEntries
      if ('actualEntries' in patch) {
        const arr = patch.actualEntries && patch.actualEntries.length > 0 ? patch.actualEntries : null
        actualEntries = arr
        actual = arr ? Math.round(arr.reduce((s, v) => s + (Number(v) || 0), 0) * 100) / 100 : null
      } else if ('actual' in patch) {
        actual = patch.actual
        actualEntries = null
      } else {
        actual = base.actual
        actualEntries = base.actualEntries ?? null
      }

      const next = {
        id: idx >= 0 ? prev[idx].id : crypto.randomUUID(),
        categoryId,
        date,
        planned: 'planned' in patch ? patch.planned : base.planned,
        actual,
        actualEntries,
        deleted: false,
        updatedAt: new Date().toISOString(),
      }
      const empty = (next.planned === null || next.planned === undefined || next.planned === '') &&
                    (next.actual === null || next.actual === undefined || next.actual === '')
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = empty ? tombstone(next) : next
        return updated
      }
      if (empty) return prev
      return [...prev, next]
    })
  }

  function deleteLogsByCategory(categoryId) {
    setLogs(prev => prev.map(l => (l.categoryId === categoryId ? tombstone(l) : l)))
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
          const next = { ...arr[idx], planned, deleted: false, updatedAt: now }
          const empty = (next.planned === null || next.planned === undefined) &&
                        (next.actual === null || next.actual === undefined || next.actual === '')
          arr[idx] = empty ? tombstone(next) : next
        } else if (planned !== null) {
          arr.push({ id: crypto.randomUUID(), categoryId: u.categoryId, date: u.date, planned, actual: null, deleted: false, updatedAt: now })
        }
      }
      return arr
    })
  }

  function mergeLogs(remote) {
    if (!Array.isArray(remote)) return
    setLogs(prev => mergeById(prev, remote))
  }

  return { logs, allLogs, getLog, setLog, deleteLogsByCategory, bulkSetPlanned, mergeLogs }
}
