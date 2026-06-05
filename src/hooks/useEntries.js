import { useState, useEffect } from 'react'
import { nk } from '../lib/accountStorage'

export function useEntries() {
  const STORAGE_KEY = nk('diary_entries')
  const [entries, setEntries] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  function saveEntry(entry) {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.id === entry.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = entry
        return updated
      }
      return [entry, ...prev]
    })
  }

  function deleteEntry(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  function mergeEntries(remote) {
    setEntries(prev => {
      const map = new Map(prev.map(e => [e.id, e]))
      for (const e of remote) {
        const existing = map.get(e.id)
        if (!existing || e.updatedAt > existing.updatedAt) map.set(e.id, e)
      }
      return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1))
    })
  }

  return { entries, saveEntry, deleteEntry, mergeEntries }
}
