import { useCollection } from './useCollection'

// 업무 시간별 일정: { id, date, time, text, updatedAt } (완료 개념 없음)
export function useWorkEvents() {
  const { items, allItems, addItem, updateItem, deleteItem, mergeItems } = useCollection('work_events')
  return { items, allItems, addItem, updateItem, deleteItem, mergeItems }
}
