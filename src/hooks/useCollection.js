import { useMemo } from 'react'
import { nk } from '../lib/accountStorage'
import { mergeById } from '../lib/mergeById'
import { useLocalStorageState } from './useLocalStorageState'
import { tombstone, visible, pruneTombstones } from '../lib/tombstone'

// id 기반 항목 목록(추가/수정/삭제/원격 병합)을 관리하는 공통 훅.
export function useCollection(storageBase, sortFn) {
  const [allItems, setItems] = useLocalStorageState(nk(storageBase), [], items => pruneTombstones(items))

  function addItem(item) {
    setItems(prev => [item, ...prev])
  }

  function updateItem(item) {
    setItems(prev => prev.map(i => (i.id === item.id ? item : i)))
  }

  function deleteItem(id) {
    setItems(prev => prev.map(i => (i.id === id ? tombstone(i) : i)))
  }

  function mergeItems(remote) {
    setItems(prev => mergeById(prev, remote, sortFn))
  }

  // 정렬은 mergeItems(mergeById)에서만 일어난다. 여기서는 filter만 하고 순서는 건드리지 않는다.
  const items = useMemo(() => visible(allItems), [allItems])

  return { items, allItems, addItem, updateItem, deleteItem, mergeItems }
}
