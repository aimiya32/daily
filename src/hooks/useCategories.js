import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'diary_categories'
const SEQ_KEY = 'diary_categories_seq'

function loadSeq(categories) {
  if (categories.length === 0) return 0
  return parseInt(localStorage.getItem(SEQ_KEY) ?? '0', 10)
}

export function useCategories() {
  const [categories, setCategories] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  const seqRef = useRef(null)
  if (seqRef.current === null) {
    seqRef.current = loadSeq(categories)
    localStorage.setItem(SEQ_KEY, String(seqRef.current))
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories))
  }, [categories])

  function nextId() {
    seqRef.current += 1
    localStorage.setItem(SEQ_KEY, String(seqRef.current))
    return `cate_${seqRef.current}`
  }

  function resetSeq() {
    seqRef.current = 0
    localStorage.setItem(SEQ_KEY, '0')
  }

  function addCategory(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (categories.some(c => c.name === trimmed)) return
    setCategories(prev => [...prev, { id: nextId(), name: trimmed }])
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
    if (list.length === 0) {
      resetSeq()
      return
    }
    const max = list.reduce((m, c) => {
      const n = parseInt(c.id?.replace('cate_', '') ?? '0', 10)
      return isNaN(n) ? m : Math.max(m, n)
    }, 0)
    seqRef.current = max
    localStorage.setItem(SEQ_KEY, String(max))
  }

  return { categories, addCategory, deleteCategory, setAll }
}
