import { useSequencedList } from './useSequencedList'

// 일정 카테고리: { id, name, color }
export function useScheduleCategories() {
  const { items: categories, addItem, deleteItem: deleteCategory, setAll } =
    useSequencedList('schedule_categories', 'scat')

  function addCategory(name, color = 'blue') {
    const trimmed = name.trim()
    if (!trimmed) return
    if (categories.some(c => c.name === trimmed)) return
    addItem({ name: trimmed, color })
  }

  return { categories, addCategory, deleteCategory, setAll }
}
