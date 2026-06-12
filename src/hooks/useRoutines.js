import { useSequencedList } from './useSequencedList'

// 루틴: { id, name, visible }
export function useRoutines() {
  const { items: routines, setItems, addItem, updateItem, setAll } =
    useSequencedList('routine_list', 'rout')

  function addRoutine(name) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (routines.some(r => r.name === trimmed)) return
    addItem({ name: trimmed, visible: true })
  }

  function updateRoutine(id, name) {
    const trimmed = name.trim()
    if (!trimmed) return
    updateItem(id, { name: trimmed })
  }

  function toggleVisible(id) {
    setItems(prev => prev.map(r => (r.id === id ? { ...r, visible: !r.visible } : r)))
  }

  return { routines, addRoutine, updateRoutine, toggleVisible, setAll }
}
