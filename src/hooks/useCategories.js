import { useSequencedList } from './useSequencedList'

// 기록 카테고리: { id, name, viewType 'list'|'image' }
export function useCategories() {
  const { items: categories, addItem, updateItem: updateCategory, deleteItem: deleteCategory, setAll } =
    useSequencedList('record_categories', 'cate')

  function addCategory(name, viewType = 'list') {
    const trimmed = name.trim()
    if (!trimmed) return
    if (categories.some(c => c.name === trimmed)) return
    addItem({ name: trimmed, viewType })
  }

  return { categories, addCategory, updateCategory, deleteCategory, setAll }
}
