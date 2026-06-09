import { useState, useEffect } from 'react'
import { nk } from '../lib/accountStorage'

export function useRecords() {
  const STORAGE_KEY = nk('records')
  const [records, setRecords] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  }, [records])

  function saveRecord(record) {
    setRecords(prev => {
      const idx = prev.findIndex(e => e.id === record.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = record
        return updated
      }
      return [record, ...prev]
    })
  }

  function deleteRecord(id) {
    setRecords(prev => prev.filter(e => e.id !== id))
  }

  function mergeRecords(remote) {
    setRecords(prev => {
      const map = new Map(prev.map(e => [e.id, e]))
      for (const e of remote) {
        const existing = map.get(e.id)
        if (!existing || e.updatedAt > existing.updatedAt) map.set(e.id, e)
      }
      return Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1))
    })
  }

  return { records, saveRecord, deleteRecord, mergeRecords }
}
