import { useState, useEffect } from 'react'
import { nk } from '../lib/accountStorage'

// 연락처 항목: { id, name, phone, fax, email, blog, note, tags: [], images: [imageId], updatedAt }
export function useContacts() {
  const STORAGE_KEY = nk('contacts')
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
      return Array.from(map.values()).sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
    })
  }

  return { items, addItem, deleteItem, mergeItems }
}
