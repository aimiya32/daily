import { useCollection } from './useCollection'

// 업무 투두: { id, date, text, done, updatedAt }
// 투두는 적은 날짜에만 표시(이월 없음).
export function useWorkTodos() {
  const { items, addItem, updateItem, deleteItem, mergeItems } = useCollection('work_todos')
  return { items, addItem, updateItem, deleteItem, mergeItems }
}
