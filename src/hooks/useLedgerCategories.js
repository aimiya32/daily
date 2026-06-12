import { useSequencedList } from './useSequencedList'

// 가계부 카테고리: { id, name, type 'expense'|'income' }
export function useLedgerCategories() {
  const { items: categories, addItem, deleteItem: deleteCategory, setAll } =
    useSequencedList('ledger_categories', 'lcat')

  function addCategory(name, type = 'expense') {
    const trimmed = name.trim()
    if (!trimmed) return
    if (categories.some(c => c.name === trimmed && c.type === type)) return
    addItem({ name: trimmed, type })
  }

  return { categories, addCategory, deleteCategory, setAll }
}
