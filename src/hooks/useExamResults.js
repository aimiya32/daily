import { useCollection } from './useCollection'

// 시험 결과: { id, examName, correct, total, date 'ISO', updatedAt 'ISO', answers? { 문제인덱스: 선택번호 } }
export function useExamResults() {
  return useCollection('examResults', (a, b) => (a.date < b.date ? 1 : -1))
}
