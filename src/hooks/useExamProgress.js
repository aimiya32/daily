import { nk } from '../lib/accountStorage'
import { useLocalStorageState } from './useLocalStorageState'

// 진행 중인 시험 1건. 없으면 null. Drive 동기화 대상 아님(로컬 전용).
// { examName, answers: { 문제인덱스: 선택번호 }, flags: [문제인덱스...], currentIdx, timeLeft, total, updatedAt 'ISO' }
export function useExamProgress() {
  return useLocalStorageState(nk('examProgress'), null)
}
