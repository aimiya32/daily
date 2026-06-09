import { useState, useEffect } from 'react'
import { nk } from '../lib/accountStorage'

// 가계부 항목: { id, date 'YYYY-MM-DD', type 'income'|'expense', amount, memo, updatedAt }
export function useLedger() {
  const STORAGE_KEY = nk('ledger')
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addItem(item) {
    setItems(prev => [item, ...prev])
  }

  function updateItem(item) {
    setItems(prev => prev.map(i => (i.id === item.id ? item : i)))
  }

  function deleteItem(id) {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function mergeItems(remote) {
    setItems(prev => {
      const map = new Map(prev.map(i => [i.id, i]))
      for (const i of remote) {
        const existing = map.get(i.id)
        if (!existing || (i.updatedAt ?? '') > (existing.updatedAt ?? '')) map.set(i.id, i)
      }
      return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1))
    })
  }

  return { items, addItem, updateItem, deleteItem, mergeItems }
}
