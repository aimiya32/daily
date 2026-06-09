// 로그인한 구글 계정별로 localStorage 키를 분리한다.
// 공용 브라우저에서 계정이 달라지면 데이터가 섞이지 않도록.

const LEGACY_BASES = [
  'records',
  'record_categories', 'record_categories_seq',
  'schedule_records',
  'schedule_categories', 'schedule_categories_seq',
  'routine_list', 'routine_list_seq',
  'routine_checks',
  'tracker_logs',
  'tracker_categories', 'tracker_categories_seq',
]

let prefix = ''

// 현재 계정 네임스페이스가 적용된 키
export function nk(base) {
  return prefix ? `acct:${prefix}::${base}` : base
}

// 이 계정의 로컬 데이터가 한 번이라도 초기화(이관/풀)됐는지
export function isInitialized() {
  return !!localStorage.getItem(nk('__initialized'))
}

export function markInitialized() {
  localStorage.setItem(nk('__initialized'), '1')
}

// 계정 프리픽스 설정 + (단일 사용자였던) 레거시 데이터 1회 이관
export function setAccountPrefix(p) {
  prefix = p || ''
  if (!prefix) return

  const migratedFlag = nk('__migrated')
  if (localStorage.getItem(migratedFlag)) return

  let moved = false
  for (const base of LEGACY_BASES) {
    const legacy = localStorage.getItem(base)
    if (legacy != null && localStorage.getItem(nk(base)) == null) {
      localStorage.setItem(nk(base), legacy)
      moved = true
    }
  }
  // 다른 계정이 가져가지 않도록 레거시 키 제거
  for (const base of LEGACY_BASES) localStorage.removeItem(base)
  localStorage.setItem(migratedFlag, '1')
  // 이관된 계정은 이미 데이터가 있으니 자동 풀(덮어쓰기) 생략
  if (moved) markInitialized()
}
