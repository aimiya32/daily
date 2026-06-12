import { nk } from '../lib/accountStorage'
import { mergeById } from '../lib/mergeById'
import { useLocalStorageState } from './useLocalStorageState'

export function useRecords() {
  const [records, setRecords] = useLocalStorageState(nk('records'))

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
    setRecords(prev => mergeById(prev, remote, (a, b) => (a.date < b.date ? 1 : -1)))
  }

  return { records, saveRecord, deleteRecord, mergeRecords }
}
