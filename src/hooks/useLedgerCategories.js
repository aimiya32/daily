import { useState, useEffect, useRef } from 'react'
import { nk } from '../lib/accountStorage'

function loadSeq(categories, SEQ_KEY) {
  if (categories.length === 0) return 0
  return parseInt(localStorage.getItem(SEQ_KEY) ?? '0', 10)
}

// 가계부 카테고리: { id, name, type 'expense'|'income' }
export function useLedgerCategories() {
  const STORAGE_KEY = nk('ledger_categories')
  const SEQ_KEY = nk('ledger_categories_seq')
  const [categories, setCategories] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  const seqRef = useRef(null)
  if (seqRef.current === null) {
    seqRef.current = loadSeq(categories, SEQ_KEY)
    localStorage.setItem(SEQ_KEY, String(seqRef.current))
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
  }, [categories])

  function nextId() {
    seqRef.current += 1
    localStorage.setItem(SEQ_KEY, String(seqRef.current))
    return `lcat_${seqRef.current}`
  }

  function resetSeq() {
    seqRef.current = 0
    localStorage.setItem(SEQ_KEY, '0')
  }

  function addCategory(name, type = 'expense') {
    const trimmed = name.trim()
    if (!trimmed) return
    if (categories.some(c => c.name === trimmed && c.type === type)) return
    setCategories(prev => [...prev, { id: nextId(), name: trimmed, type }])
  }

  function deleteCategory(id) {
    setCategories(prev => {
      const next = prev.filter(c => c.id !== id)
      if (next.length === 0) resetSeq()
      return next
    })
  }

  function setAll(list) {
    if (!Array.isArray(list)) return
    setCategories(list)
    if (list.length === 0) { resetSeq(); return }
    const max = list.reduce((m, c) => {
      const n = parseInt(c.id?.replace('lcat_', '') ?? '0', 10)
      return isNaN(n) ? m : Math.max(m, n)
    }, 0)
    seqRef.current = max
    localStorage.setItem(SEQ_KEY, String(max))
  }

  return { categories, addCategory, deleteCategory, setAll }
}
