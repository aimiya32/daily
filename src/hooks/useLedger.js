import { useCollection } from './useCollection'

// 가계부 항목: { id, date 'YYYY-MM-DD', type 'income'|'expense', amount, memo, updatedAt }
export function useLedger() {
  return useCollection('ledger', (a, b) => (a.date < b.date ? 1 : -1))
}
