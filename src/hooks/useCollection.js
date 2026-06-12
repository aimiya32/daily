import { nk } from '../lib/accountStorage'
import { mergeById } from '../lib/mergeById'
import { useLocalStorageState } from './useLocalStorageState'

// id 기반 항목 목록(추가/수정/삭제/원격 병합)을 관리하는 공통 훅.
export function useCollection(storageBase, sortFn) {
  const [items, setItems] = useLocalStorageState(nk(storageBase))

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
    setItems(prev => mergeById(prev, remote, sortFn))
  }

  return { items, addItem, updateItem, deleteItem, mergeItems }
}
