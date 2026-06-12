import { nk } from '../lib/accountStorage'
import { useLocalStorageState } from './useLocalStorageState'

// 저장된 메뉴 설정을 현재 앱 목록과 맞춘다.
// - 사라진 id는 제거, 새로 생긴 id는 뒤에 보이도록 추가
function reconcile(saved, allIds) {
  const known = new Set(allIds)
  const kept = saved.filter(m => known.has(m.id))
  const seen = new Set(kept.map(m => m.id))
  const appended = allIds.filter(id => !seen.has(id)).map(id => ({ id, visible: true }))
  return [...kept, ...appended]
}

export function useHomeMenu(allIds) {
  const [menu, setMenu] = useLocalStorageState(
    nk('home_menu'), [],
    saved => reconcile(Array.isArray(saved) ? saved : [], allIds),
  )

  function toggleVisible(id) {
    setMenu(prev => prev.map(m => (m.id === id ? { ...m, visible: !m.visible } : m)))
  }

  function move(id, dir) {
    setMenu(prev => {
      const idx = prev.findIndex(m => m.id === id)
      const next = idx + dir
      if (idx < 0 || next < 0 || next >= prev.length) return prev
      const arr = [...prev]
      ;[arr[idx], arr[next]] = [arr[next], arr[idx]]
      return arr
    })
  }

  // activeId 항목을 overId 위치로 이동(드래그 정렬)
  function reorder(activeId, overId) {
    setMenu(prev => {
      const from = prev.findIndex(m => m.id === activeId)
      const to = prev.findIndex(m => m.id === overId)
      if (from < 0 || to < 0 || from === to) return prev
      const arr = [...prev]
      const [moved] = arr.splice(from, 1)
      arr.splice(to, 0, moved)
      return arr
    })
  }

  return { menu, toggleVisible, move, reorder }
}
