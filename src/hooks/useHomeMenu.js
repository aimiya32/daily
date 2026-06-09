import { useState, useEffect } from 'react'
import { nk } from '../lib/accountStorage'

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
  const STORAGE_KEY = nk('home_menu')
  const [menu, setMenu] = useState(() => {
    let saved = []
    try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { saved = [] }
    return reconcile(Array.isArray(saved) ? saved : [], allIds)
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menu))
  }, [menu])

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
