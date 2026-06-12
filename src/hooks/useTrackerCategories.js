import { useSequencedList } from './useSequencedList'

// 목표 카테고리: { id, name, unit, color }
export function useTrackerCategories() {
  const { items: categories, addItem, deleteItem: deleteCategory, setAll } =
    useSequencedList('tracker_categories', 'tcat')

  function addCategory(name, unit = '', color = 'indigo') {
    const trimmed = name.trim()
    if (!trimmed) return
    if (categories.some(c => c.name === trimmed)) return
    addItem({ name: trimmed, unit: unit.trim(), color })
  }

  return { categories, addCategory, deleteCategory, setAll }
}
