// 원격 항목을 id 기준으로 병합한다. 같은 id면 updatedAt이 더 최신인 쪽을 남긴다(LWW).
export function mergeById(prev, remote, sortFn) {
  const map = new Map(prev.map(item => [item.id, item]))
  for (const item of remote) {
    const existing = map.get(item.id)
    if (!existing || (item.updatedAt ?? '') > (existing.updatedAt ?? '')) map.set(item.id, item)
  }
  const merged = Array.from(map.values())
  return sortFn ? merged.sort(sortFn) : merged
}
