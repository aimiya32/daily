// 삭제된 항목은 제거하지 않고 tombstone으로 남긴다. 그래야 Drive 병합(LWW) 때
// "아직 못 받은 항목"과 "지운 항목"을 구분할 수 있다.
export function tombstone(item) {
  return { ...item, deleted: true, updatedAt: new Date().toISOString() }
}

export function visible(items) {
  return items.filter(i => !i.deleted)
}

// 동기화될 만큼 시간이 지난 tombstone은 정리한다(무한 증식 방지).
export function pruneTombstones(items, days = 90) {
  if (!Array.isArray(items)) return items
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return items.filter(i => {
    if (!i.deleted) return true
    const t = Date.parse(i.updatedAt ?? '')
    if (Number.isNaN(t)) return true
    return t >= cutoff
  })
}
