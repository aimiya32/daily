import { useMemo } from 'react'
import { nk } from '../lib/accountStorage'
import { mergeById } from '../lib/mergeById'
import { useLocalStorageState } from './useLocalStorageState'
import { tombstone, visible, pruneTombstones } from '../lib/tombstone'

export function useRecords() {
  const [allRecords, setRecords] = useLocalStorageState(nk('records'), [], items => pruneTombstones(items))

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
    setRecords(prev => prev.map(e => (e.id === id ? tombstone(e) : e)))
  }

  function mergeRecords(remote) {
    setRecords(prev => mergeById(prev, remote, (a, b) => (a.date < b.date ? 1 : -1)))
  }

  const records = useMemo(() => visible(allRecords), [allRecords])

  return { records, allRecords, saveRecord, deleteRecord, mergeRecords }
}
