import { useMemo } from 'react'
import { nk } from '../lib/accountStorage'
import { mergeById } from '../lib/mergeById'
import { tombstone, visible, pruneTombstones } from '../lib/tombstone'
import { useLocalStorageState } from './useLocalStorageState'

// 체크 1건: { id, routineId, date, deleted, updatedAt }
// id는 routineId|date로 결정론적으로 만든다. 두 기기가 같은 날 같은 루틴을 각각 체크해도
// 같은 id가 나와야 병합 때 중복되지 않는다.
const keyOf = (routineId, date) => `${routineId}|${date}`

// 옛 데이터({ routineId, date }만 있는 항목)에 id를 채워 넣는다. 로컬·원격 모두 거쳐 간다.
function normalize(list) {
  if (!Array.isArray(list)) return []
  return list.map(c => (c.id ? c : { ...c, id: keyOf(c.routineId, c.date) }))
}

export function useRoutineChecks() {
  const [allChecks, setChecks] = useLocalStorageState(
    nk('routine_checks'),
    [],
    list => pruneTombstones(normalize(list)),
  )
  const checks = useMemo(() => visible(allChecks), [allChecks])

  function isChecked(routineId, date) {
    return checks.some(c => c.routineId === routineId && c.date === date)
  }

  // 체크 해제는 항목을 지우지 않고 tombstone으로 남긴다. 그래야 Drive 병합에서
  // "아직 못 받은 체크"와 "해제한 체크"를 구분할 수 있다.
  function toggle(routineId, date) {
    setChecks(prev => {
      const id = keyOf(routineId, date)
      const idx = prev.findIndex(c => c.id === id)
      const now = new Date().toISOString()
      if (idx < 0) return [...prev, { id, routineId, date, deleted: false, updatedAt: now }]

      const updated = [...prev]
      updated[idx] = prev[idx].deleted
        ? { ...prev[idx], deleted: false, updatedAt: now }
        : tombstone(prev[idx])
      return updated
    })
  }

  function getCheckedRoutineIds(date) {
    return checks.filter(c => c.date === date).map(c => c.routineId)
  }

  function mergeChecks(remote) {
    setChecks(prev => mergeById(prev, normalize(remote)))
  }

  return { checks, allChecks, isChecked, toggle, getCheckedRoutineIds, mergeChecks }
}
