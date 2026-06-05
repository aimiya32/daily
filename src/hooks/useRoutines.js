import { useState, useEffect, useRef } from 'react'
import { nk } from '../lib/accountStorage'

function loadSeq(routines, SEQ_KEY) {
  if (routines.length === 0) return 0
  return parseInt(localStorage.getItem(SEQ_KEY) ?? '0', 10)
}

export function useRoutines() {
  const STORAGE_KEY = nk('routine_list')
  const SEQ_KEY = nk('routine_list_seq')
  const [routines, setRoutines] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  const seqRef = useRef(null)
  if (seqRef.current === null) {
    seqRef.current = loadSeq(routines, SEQ_KEY)
    localStorage.setItem(SEQ_KEY, String(seqRef.current))
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(routines))
  }, [routines])

  function nextId() {
    seqRef.current += 1
    localStorage.setItem(SEQ_KEY, String(seqRef.current))
    return `rout_${seqRef.current}`
  }

  function addRoutine(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (routines.some(r => r.name === trimmed)) return
    setRoutines(prev => [...prev, { id: nextId(), name: trimmed, visible: true }])
  }

  function updateRoutine(id, name) {
    const trimmed = name.trim()
    if (!trimmed) return
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, name: trimmed } : r))
  }

  function toggleVisible(id) {
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, visible: !r.visible } : r))
  }

  function setAll(list) {
    if (!Array.isArray(list)) return
    setRoutines(list)
    if (list.length === 0) { seqRef.current = 0; localStorage.setItem(SEQ_KEY, '0'); return }
    const max = list.reduce((m, r) => {
      const n = parseInt(r.id?.replace('rout_', '') ?? '0', 10)
      return isNaN(n) ? m : Math.max(m, n)
    }, 0)
    seqRef.current = max
    localStorage.setItem(SEQ_KEY, String(max))
  }

  return { routines, addRoutine, updateRoutine, toggleVisible, setAll }
}
