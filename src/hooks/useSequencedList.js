import { useRef } from 'react'
import { nk } from '../lib/accountStorage'
import { useLocalStorageState } from './useLocalStorageState'

// localStorage 목록 + `${idPrefix}_${순번}` 형태의 id 시퀀스를 함께 관리하는 공통 훅.
// 카테고리/루틴처럼 짧은 순번 id를 쓰는 목록에 사용한다.
export function useSequencedList(storageBase, idPrefix) {
  const SEQ_KEY = nk(`${storageBase}_seq`)
  const [items, setItems] = useLocalStorageState(nk(storageBase))

  const seqRef = useRef(null)
  if (seqRef.current === null) {
    seqRef.current = items.length === 0 ? 0 : parseInt(localStorage.getItem(SEQ_KEY) ?? '0', 10)
    localStorage.setItem(SEQ_KEY, String(seqRef.current))
  }

  function setSeq(n) {
    seqRef.current = n
    localStorage.setItem(SEQ_KEY, String(n))
  }

  function nextId() {
    setSeq(seqRef.current + 1)
    return `${idPrefix}_${seqRef.current}`
  }

  function addItem(fields) {
    setItems(prev => [...prev, { id: nextId(), ...fields }])
  }

  function updateItem(id, patch) {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, ...patch } : it)))
  }

  function deleteItem(id) {
    setItems(prev => {
      const next = prev.filter(it => it.id !== id)
      if (next.length === 0) setSeq(0)
      return next
    })
  }

  // 원격 목록으로 통째로 교체 + 시퀀스를 목록의 최대 순번으로 복원
  function setAll(list) {
    if (!Array.isArray(list)) return
    setItems(list)
    if (list.length === 0) {
      setSeq(0)
      return
    }
    const max = list.reduce((m, it) => {
      const n = parseInt(it.id?.replace(`${idPrefix}_`, '') ?? '0', 10)
      return isNaN(n) ? m : Math.max(m, n)
    }, 0)
    setSeq(max)
  }

  return { items, setItems, addItem, updateItem, deleteItem, setAll }
}
