import { useCollection } from './useCollection'

// 주간 일정: { id, date, text, updatedAt } — 그날의 업무 단위 일정(시각 없음)
export function useWorkWeekly() {
  const { items, addItem, updateItem, deleteItem, mergeItems } = useCollection('work_weekly')
  return { items, addItem, updateItem, deleteItem, mergeItems }
}
