// 쉼표로 구분된 태그 입력 문자열 → 중복 제거된 태그 배열
export function parseTags(str) {
  const seen = new Set()
  const out = []
  for (const t of str.split(',')) {
    const tag = t.trim()
    if (tag && !seen.has(tag)) { seen.add(tag); out.push(tag) }
  }
  return out
}

// 항목들에서 사용된 모든 태그 (가나다순)
export function collectTags(items) {
  return [...new Set(items.flatMap(i => i.tags ?? []))].sort((a, b) => a.localeCompare(b))
}
