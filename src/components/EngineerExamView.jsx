import { useState, useEffect, useRef, useCallback, useId } from 'react'
import { Box, Text, Stack, Group, Badge, ActionIcon, Loader, Center } from '@mantine/core'
import { IconChevronLeft, IconChevronRight, IconFlag, IconList, IconCheck, IconX, IconTrash } from '@tabler/icons-react'
import { useExamProgress } from '../hooks/useExamProgress'
import { useIsNarrow } from '../hooks/useBreakpoint'
import styles from './EngineerExamView.module.scss'

const SUBJECTS = [
  '소프트웨어 설계',
  '소프트웨어 개발',
  '데이터베이스 구축',
  '프로그래밍 언어 활용',
  '정보시스템 구축 관리',
]
const SUBJECT_SHORT = {
  '소프트웨어 설계': 'SW 설계',
  '소프트웨어 개발': 'SW 개발',
  '데이터베이스 구축': 'DB 구축',
  '프로그래밍 언어 활용': '프로그래밍',
  '정보시스템 구축 관리': '정보시스템',
}

// ── 테이블 감지 파서 ─────────────────────────────────────────
function detectTable(text) {
  if (!text) return null

  // 접두 텍스트 제거: "[R1] 테이블", "<사원> 테이블", "... 테이블 ..." 등
  let prefix = ''
  let tableText = text
  const kwMatch = text.match(/^([\s\S]*?테이블\s+)/)
  const brMatch = !kwMatch && text.match(/^(\[.*?\]\s+)/)
  if (kwMatch) { prefix = kwMatch[1].trimEnd(); tableText = text.slice(kwMatch[1].length) }
  else if (brMatch) { prefix = brMatch[1].trimEnd(); tableText = text.slice(brMatch[1].length) }

  const tokens = tableText.trim().split(/\s+/)
  if (tokens.length < 4) return null

  // 첫 번째 숫자 포함 토큰 위치 = 헤더 컬럼 수
  const headerEnd = tokens.findIndex(t => /\d/.test(t))
  if (headerEnd < 2 || headerEnd > 8) return null

  const cols = headerEnd
  const remaining = tokens.slice(cols)
  if (!remaining.length || remaining.length % cols !== 0) return null
  const rowCount = remaining.length / cols
  if (rowCount < 1 || rowCount > 20) return null

  const headers = tokens.slice(0, cols)
  // 헤더는 짧은 단어여야 함 (문장 아님)
  if (headers.some(h => h.length > 7 || /[(),;.]/.test(h))) return null

  const rows = []
  for (let i = 0; i < remaining.length; i += cols) rows.push(remaining.slice(i, i + cols))

  return { prefix, headers, rows }
}

// ── 보기(선택지) 소형 테이블 ─────────────────────────────────
function ChoiceTable({ table }) {
  const { headers, rows } = table
  const hasHeader = headers && headers.length > 0
  return (
    <Box style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
        {hasHeader && (
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={{ background: '#e2e8f0', border: '1px solid #cbd5e1', padding: '3px 10px', fontWeight: 700, color: '#374151', textAlign: 'center', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ border: '1px solid #e2e8f0', padding: '3px 10px', textAlign: 'center', color: '#374151', whiteSpace: 'nowrap' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  )
}

// ── 트리 렌더러 ──────────────────────────────────────────────
function TreeRenderer({ tree }) {
  const NODE_R = 15
  const LEVEL_H = 58
  const MIN_SEP = 46

  // 1단계(bottom-up): 각 subtree의 폭(_width)과 subtree 내 상대 x(_relX) 계산
  // isFirstChild/isLastChild: 형제 중 첫째/막내 여부
  // — 왼쪽 가지 단일자식 → 부모 오른쪽 이동(자식이 왼쪽으로 뻗음)
  // — 오른쪽 가지 단일자식 → 부모 왼쪽 이동(자식이 오른쪽으로 뻗음)
  function computeLayout(node, isFirstChild = true, isLastChild = true) {
    if (!node.children || node.children.length === 0) {
      node._width = MIN_SEP
      node._relX = MIN_SEP / 2
      return
    }
    let totalWidth = 0
    node.children.forEach((child, i, arr) => {
      computeLayout(child, i === 0, i === arr.length - 1)
      child._offset = totalWidth
      totalWidth += child._width
    })
    if (node.children.length === 1 && isFirstChild && !isLastChild) {
      // 왼쪽 가지 단일자식: 자식은 왼쪽, 부모는 오른쪽 절반
      node._width = totalWidth * 2
      node._relX = totalWidth
    } else if (node.children.length === 1 && isLastChild && !isFirstChild) {
      // 오른쪽 가지 단일자식: 자식을 오른쪽으로 이동, 부모는 왼쪽 절반
      node.children[0]._offset = totalWidth
      node._width = totalWidth * 2
      node._relX = totalWidth / 2
    } else {
      node._width = totalWidth
      const fc = node.children[0]
      const lc = node.children[node.children.length - 1]
      node._relX = (fc._offset + fc._relX + lc._offset + lc._relX) / 2
    }
  }

  // 2단계(top-down): 절대 x/y 좌표 부여
  function assignPositions(node, xBase, depth) {
    node._x = xBase + node._relX
    node._y = depth * LEVEL_H + NODE_R + 6
    if (node.children) {
      node.children.forEach(child => assignPositions(child, xBase + child._offset, depth + 1))
    }
  }

  function collectNodes(node, arr = []) {
    arr.push(node)
    if (node.children) node.children.forEach(c => collectNodes(c, arr))
    return arr
  }

  function collectEdges(node, arr = []) {
    if (node.children) {
      node.children.forEach(c => {
        arr.push({ x1: node._x, y1: node._y, x2: c._x, y2: c._y })
        collectEdges(c, arr)
      })
    }
    return arr
  }

  const t = JSON.parse(JSON.stringify(tree))
  computeLayout(t, true, true)
  assignPositions(t, 0, 0)
  const nodes = collectNodes(t)
  const edges = collectEdges(t)
  const svgW = t._width
  const svgH = Math.max(...nodes.map(n => n._y)) + NODE_R + 8

  return (
    <Box style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 8px', overflowX: 'auto', marginBottom: 12 }}>
      <svg width={svgW} height={svgH} style={{ display: 'block', margin: '0 auto', minWidth: svgW }}>
        {edges.map((e, i) => (
          <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke="#94a3b8" strokeWidth={1.5} />
        ))}
        {nodes.map((n, i) => (
          <g key={i}>
            <circle cx={n._x} cy={n._y} r={NODE_R} fill="white" stroke="#475569" strokeWidth={1.5} />
            <text x={n._x} y={n._y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight={600} fill="#1e293b" style={{ fontFamily: 'inherit' }}>
              {n.value}
            </text>
          </g>
        ))}
      </svg>
    </Box>
  )
}

// ── 그래프(노드-간선) 렌더러 ───────────────────────────────────
function GraphRenderer({ graph }) {
  const NODE_R = 15
  const PAD = 18
  const directed = !!graph.directed
  const nodes = graph.nodes || []
  const edges = graph.edges || []
  const nodeMap = {}
  nodes.forEach(n => { nodeMap[n.id] = n })

  const rawId = useId()
  const markerId = 'graph-arrow-' + rawId.replace(/[^a-zA-Z0-9]/g, '')

  function nodeGeom(node) {
    if (node.shape === 'rect') {
      const label = String(node.label ?? node.id)
      const w = Math.max(34, label.length * 9 + 16)
      const h = 24
      return { shape: 'rect', w, h, hw: w / 2, hh: h / 2 }
    }
    return { shape: 'circle', r: NODE_R }
  }

  // 중심 (cx,cy)에서 방향(ux,uy, 단위벡터) 쪽 도형 경계 위 점
  function boundaryPoint(cx, cy, geom, ux, uy) {
    if (geom.shape === 'circle') {
      return { x: cx + ux * geom.r, y: cy + uy * geom.r }
    }
    const tx = ux !== 0 ? geom.hw / Math.abs(ux) : Infinity
    const ty = uy !== 0 ? geom.hh / Math.abs(uy) : Infinity
    const t = Math.min(tx, ty)
    return { x: cx + ux * t, y: cy + uy * t }
  }

  function computeEdge(edge) {
    const n1 = nodeMap[edge.from]
    const n2 = nodeMap[edge.to]
    const g1 = nodeGeom(n1)
    const g2 = nodeGeom(n2)
    const curve = edge.curve || 0
    const isCurve = curve !== 0
    const dx = n2.x - n1.x, dy = n2.y - n1.y
    const L = Math.hypot(dx, dy) || 1
    let dir0 = { x: dx / L, y: dy / L }
    let dir1 = { x: -dx / L, y: -dy / L }
    let cx, cy
    if (isCurve) {
      const nx = dy / L, ny = -dx / L
      const mx = (n1.x + n2.x) / 2, my = (n1.y + n2.y) / 2
      cx = mx + curve * L * nx
      cy = my + curve * L * ny
      const d0L = Math.hypot(cx - n1.x, cy - n1.y) || 1
      dir0 = { x: (cx - n1.x) / d0L, y: (cy - n1.y) / d0L }
      const d1L = Math.hypot(cx - n2.x, cy - n2.y) || 1
      dir1 = { x: (cx - n2.x) / d1L, y: (cy - n2.y) / d1L }
    }
    const p1 = boundaryPoint(n1.x, n1.y, g1, dir0.x, dir0.y)
    let p2 = boundaryPoint(n2.x, n2.y, g2, dir1.x, dir1.y)
    if (directed) {
      // 화살표 머리만큼 여유를 두고 노드 경계 앞에서 멈춘다
      p2 = { x: p2.x - dir1.x * 3, y: p2.y - dir1.y * 3 }
    }
    let labelX, labelY
    if (isCurve) {
      labelX = 0.25 * p1.x + 0.5 * cx + 0.25 * p2.x
      labelY = 0.25 * p1.y + 0.5 * cy + 0.25 * p2.y
    } else {
      labelX = (p1.x + p2.x) / 2
      labelY = (p1.y + p2.y) / 2
    }
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, cx, cy, isCurve, labelX, labelY }
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  nodes.forEach(n => {
    const g = nodeGeom(n)
    const rx = g.shape === 'circle' ? g.r : g.hw
    const ry = g.shape === 'circle' ? g.r : g.hh
    minX = Math.min(minX, n.x - rx); maxX = Math.max(maxX, n.x + rx)
    minY = Math.min(minY, n.y - ry); maxY = Math.max(maxY, n.y + ry)
  })
  edges.forEach(e => {
    const curve = e.curve || 0
    if (curve === 0) return
    const n1 = nodeMap[e.from], n2 = nodeMap[e.to]
    const dx = n2.x - n1.x, dy = n2.y - n1.y
    const L = Math.hypot(dx, dy) || 1
    const nx = dy / L, ny = -dx / L
    const mx = (n1.x + n2.x) / 2, my = (n1.y + n2.y) / 2
    const cx = mx + curve * L * nx, cy = my + curve * L * ny
    minX = Math.min(minX, cx - 10); maxX = Math.max(maxX, cx + 10)
    minY = Math.min(minY, cy - 10); maxY = Math.max(maxY, cy + 10)
  })
  if (!nodes.length) return null

  const svgW = (maxX - minX) + PAD * 2
  const svgH = (maxY - minY) + PAD * 2
  const ox = PAD - minX
  const oy = PAD - minY

  return (
    <Box style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '14px 8px', overflowX: 'auto', marginBottom: 12 }}>
      <svg width={svgW} height={svgH} style={{ display: 'block', margin: '0 auto', minWidth: svgW }}>
        {directed && (
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" markerUnits="userSpaceOnUse" orient="auto">
              <path d="M0,0 L10,5 L0,10 Z" fill="#94a3b8" />
            </marker>
          </defs>
        )}
        <g transform={`translate(${ox},${oy})`}>
          {edges.map((e, i) => {
            const geo = computeEdge(e)
            const labelW = e.label ? String(e.label).length * 7 + 6 : 0
            return (
              <g key={i}>
                {geo.isCurve ? (
                  <path
                    d={`M ${geo.x1} ${geo.y1} Q ${geo.cx} ${geo.cy} ${geo.x2} ${geo.y2}`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    markerEnd={directed ? `url(#${markerId})` : undefined}
                  />
                ) : (
                  <line
                    x1={geo.x1} y1={geo.y1} x2={geo.x2} y2={geo.y2}
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    markerEnd={directed ? `url(#${markerId})` : undefined}
                  />
                )}
                {e.label && (
                  <g>
                    <rect x={geo.labelX - labelW / 2} y={geo.labelY - 7} width={labelW} height={14} fill="white" />
                    <text x={geo.labelX} y={geo.labelY} textAnchor="middle" dominantBaseline="middle" fontSize={11} fill="#475569">
                      {e.label}
                    </text>
                  </g>
                )}
              </g>
            )
          })}
          {nodes.map((n, i) => {
            const g = nodeGeom(n)
            const label = n.label ?? n.id
            return (
              <g key={i}>
                {g.shape === 'rect' ? (
                  <rect x={n.x - g.hw} y={n.y - g.hh} width={g.w} height={g.h} rx={3} fill="white" stroke="#475569" strokeWidth={1.5} />
                ) : (
                  <circle cx={n.x} cy={n.y} r={g.r} fill="white" stroke="#475569" strokeWidth={1.5} />
                )}
                <text x={n.x} y={n.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight={600} fill="#1e293b" style={{ fontFamily: 'inherit' }}>
                  {label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </Box>
  )
}

// ── 답안 기록 키 정규화 (JSON 라운드트립 후 문자열 키 → 숫자 키) ──
function normalizeAnswers(answers) {
  const result = {}
  Object.keys(answers || {}).forEach(k => { result[Number(k)] = answers[k] })
  return result
}

// ── 타이머/저장시각 포맷 (ExamScreen 타이머, StartScreen 이어풀기 배너 공용) ──
function formatTimer(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatSavedAt(iso) {
  const d = new Date(iso)
  const dateStr = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${dateStr} ${timeStr}`
}

// ── 시작 화면 ───────────────────────────────────────────────
function StartScreen({ exams, onStart, examResults, tab, onTabChange, onReviewRecord, progress, onResume, onDiscardProgress, onDeleteResult }) {
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const [confirmNewStart, setConfirmNewStart] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null) // 삭제 확인 대상 응시 기록
  const isNarrow = useIsNarrow()

  const examList = exams.filter(e => e.type !== 'collection')
  const collections = exams.filter(e => e.type === 'collection')
  const selected = selectedIdx >= 0 ? exams[selectedIdx] : null
  const isCol = selected?.type === 'collection'

  if (tab === 'history') {
    return (
      <Box className={styles.pageWrap}>
        <Box className={styles.inner800}>
          <Box className={styles.pageHeaderRow} style={{ marginBottom: 20 }}>
            <Box>
              <Text fw={800} size="xl" c="#111827" mb={2}>성적 기록</Text>
              <Text size="sm" c="#6b7280">{examResults?.length ?? 0}회 응시</Text>
            </Box>
            <button
              onClick={() => onTabChange('exam')}
              className={styles.tabBtn}
              style={{ border: '1.5px solid #2563eb', color: '#2563eb' }}
            >
              시험 목록
            </button>
          </Box>
          {(!examResults || examResults.length === 0) ? (
            <Box className={styles.emptyCard}>
              <Text c="#9ca3af" size="sm">아직 기록이 없습니다</Text>
            </Box>
          ) : (
            <Stack gap={10}>
              {examResults.map(r => {
                // 정답 키가 바뀌었을 수 있으므로 저장된 점수 대신 현재 정답 키로 다시 채점한다
                let correct = r.correct
                const matchedExam = r.answers && exams.find(e => e.name === r.examName)
                if (matchedExam && matchedExam.questions.length === r.total) {
                  const userAnswers = normalizeAnswers(r.answers)
                  correct = matchedExam.questions.filter((q, i) => userAnswers[i] === q.answer).length
                }
                const rescored = correct !== r.correct
                const pct = Math.round((correct / r.total) * 100)
                const passed = pct >= 60
                const date = new Date(r.date)
                const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
                const reviewable = !!(r.answers && exams.some(e => e.name === r.examName))
                return (
                  <Box
                    key={r.id}
                    className={reviewable ? `${styles.historyItem} ${styles.historyItemClickable}` : styles.historyItem}
                    onClick={reviewable ? () => onReviewRecord(r) : undefined}
                  >
                    <Box className={styles.historyScore} style={{ background: passed ? '#eff6ff' : '#fef2f2' }}>
                      <Text fw={800} size="lg" c={passed ? '#2563eb' : '#dc2626'}>{pct}</Text>
                    </Box>
                    <Box className={styles.historyMeta}>
                      <Text fw={700} size="sm" c="#111827" className={styles.historyNameText}>
                        {r.examName}
                      </Text>
                      <Text size="xs" c="#6b7280" mt={2}>
                        {correct}/{r.total}문제 정답 · {dateStr}
                        {rescored && <Text component="span" size="xs" c="#9ca3af"> · 정답 키 수정 반영 (기존 {r.correct}점)</Text>}
                      </Text>
                    </Box>
                    <Box className={styles.passBadge} style={{ background: passed ? '#dcfce7' : '#fee2e2' }}>
                      <Text size="xs" fw={700} c={passed ? '#16a34a' : '#dc2626'}>{passed ? '합격' : '불합격'}</Text>
                    </Box>
                    {!reviewable && (
                      <Text size="xs" c="#9ca3af" style={{ flexShrink: 0 }}>답안 기록 없음</Text>
                    )}
                    <button
                      // historyItem 전체에 클릭(검토 화면 이동) 핸들러가 걸려 있어 전파를 막아야 한다
                      onClick={e => { e.stopPropagation(); setDeleteTarget(r) }}
                      className={styles.historyDeleteBtn}
                      aria-label="응시 기록 삭제"
                    >
                      <IconTrash size={16} />
                    </button>
                  </Box>
                )
              })}
            </Stack>
          )}
        </Box>

        {/* 응시 기록 삭제 확인 모달 */}
        {deleteTarget && (
          <Box className={styles.modalOverlay}>
            <Box className={styles.modalBox}>
              <Text fw={700} size="lg" mb={8}>이 응시 기록을 삭제할까요?</Text>
              <Text size="sm" c="#6b7280" mb={24} style={{ lineHeight: 1.6 }}>
                「{deleteTarget?.examName}」 기록이 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
              </Text>
              <Group gap={10}>
                <button
                  onClick={() => setDeleteTarget(null)}
                  style={{ flex: 1, padding: '12px', borderRadius: 8, border: '2px solid #e5e7eb', background: 'white', color: '#4b5563', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  onClick={() => { onDeleteResult(deleteTarget.id); setDeleteTarget(null) }}
                  style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                >
                  삭제
                </button>
              </Group>
            </Box>
          </Box>
        )}
      </Box>
    )
  }

  return (
    <Box className={styles.pageWrap}>
      <Box className={styles.inner800}>
        <Box className={styles.pageHeaderRow} style={{ marginBottom: 4 }}>
          <Text fw={800} size={isNarrow ? 'lg' : 'xl'} c="#111827" style={{ flexShrink: 1, minWidth: 0 }}>정보처리기사 필기</Text>
          <button
            onClick={() => onTabChange('history')}
            className={styles.tabBtn}
            style={{ padding: isNarrow ? '6px 12px' : '8px 18px', border: '1.5px solid #e5e7eb', color: '#374151', fontSize: isNarrow ? 13 : 14, position: 'relative', flexShrink: 0 }}
          >
            성적 기록
            {examResults?.length > 0 && (
              <span style={{ position: 'absolute', top: -6, right: -6, background: '#2563eb', color: 'white', borderRadius: 99, fontSize: 10, fontWeight: 700, padding: '1px 6px', minWidth: 18, textAlign: 'center' }}>
                {examResults.length}
              </span>
            )}
          </button>
        </Box>
        <Text size="sm" c="#6b7280" mb={20}>기출문제 CBT 모의시험</Text>

        {/* 이어서 풀기 배너 */}
        {progress && (
          <Box
            className={styles.card}
            style={{
              padding: '16px 20px',
              marginBottom: 16,
              background: '#eff6ff',
              border: '1.5px solid #2563eb',
              display: 'flex',
              flexDirection: isNarrow ? 'column' : 'row',
              alignItems: isNarrow ? 'stretch' : 'center',
              justifyContent: 'space-between',
              gap: isNarrow ? 10 : 16,
            }}
          >
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="xs" fw={700} c="#2563eb" mb={4}>이어서 풀 수 있는 시험이 있습니다</Text>
              <Text fw={700} size="sm" c="#1e3a8a" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {progress.examName}
              </Text>
              <Text size="xs" c="#3b82f6" mt={2}>
                {Object.keys(progress.answers || {}).length}/{progress.total}문제
                {typeof progress.timeLeft === 'number' && progress.timeLeft > 0 ? ` · 남은 시간 ${formatTimer(progress.timeLeft)}` : ''}
                {progress.updatedAt ? ` · ${formatSavedAt(progress.updatedAt)} 저장` : ''}
              </Text>
            </Box>
            <Group gap={8} style={{ flexShrink: 0 }}>
              <button
                onClick={onResume}
                style={{ padding: '10px 18px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                이어서 풀기
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                style={{ padding: '10px 18px', background: 'white', color: '#dc2626', border: '1.5px solid #dc2626', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                삭제
              </button>
            </Group>
          </Box>
        )}

        {/* 시험 정보 + 시작 버튼 */}
        <Box
          className={styles.card}
          style={{
            padding: '18px 20px',
            marginBottom: 16,
            display: 'flex',
            flexDirection: isNarrow ? 'column' : 'row',
            alignItems: isNarrow ? 'stretch' : 'flex-start',
            justifyContent: 'space-between',
            gap: isNarrow ? 12 : 16,
          }}
        >
          <Box style={{ flex: 1 }}>
            {isCol ? (
              <>
                <Text size="sm" fw={700} c="#374151" mb={4}>학습 모드</Text>
                <Text size="xs" c="#6b7280" style={{ lineHeight: 1.8 }}>
                  • 타이머 없음<br />
                  • 답 선택 즉시 해설 확인<br />
                  • 자유롭게 풀고 복습 가능
                </Text>
              </>
            ) : (
              <>
                <Text size="sm" fw={700} c="#374151" mb={4}>시험 정보</Text>
                <Text size="xs" c="#6b7280" style={{ lineHeight: 1.8 }}>
                  • 시험 시간: 150분<br />
                  • 합격 기준: 각 과목 40점 이상, 평균 60점 이상<br />
                  • 문제 유형: 4지선다형
                </Text>
              </>
            )}
          </Box>
          <button
            onClick={() => {
              if (!selected) return
              if (progress) setConfirmNewStart(true)
              else onStart(selectedIdx)
            }}
            disabled={selectedIdx < 0}
            style={{
              padding: '12px 28px',
              background: selectedIdx < 0 ? '#d1d5db' : '#2563eb',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700,
              cursor: selectedIdx < 0 ? 'not-allowed' : 'pointer',
              alignSelf: isNarrow ? 'stretch' : 'center',
              textAlign: 'center',
            }}
          >
            {isCol ? '학습 시작' : '시험 시작'}
          </button>
        </Box>

        {/* 목록 */}
        <Box className={styles.cardPad}>
          <Box style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {/* 기출문제 */}
            <Box style={{ flex: 1, minWidth: 200 }}>
              <Text size="xs" fw={700} c="#9ca3af" className={styles.sectionLabel}>기출문제</Text>
              <Stack gap={8}>
                {examList.map(e => {
                  const idx = exams.indexOf(e)
                  const sel = selectedIdx === idx
                  return (
                    <button key={idx} onClick={() => setSelectedIdx(idx)} className={sel ? styles.listBtnSelected : styles.listBtn}>
                      <span>{e.name} 기출문제</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: sel ? '#93c5fd' : '#9ca3af' }}>
                        {e.questions.length}문제
                      </span>
                    </button>
                  )
                })}
              </Stack>
            </Box>

            {/* 문제 모음 */}
            {collections.length > 0 && (
              <Box style={{ flex: 1, minWidth: 200 }}>
                <Text size="xs" fw={700} c="#9ca3af" className={styles.sectionLabel}>문제 모음 (학습용)</Text>
                <Stack gap={8}>
                  {collections.map(e => {
                    const idx = exams.indexOf(e)
                    const sel = selectedIdx === idx
                    return (
                      <button key={idx} onClick={() => setSelectedIdx(idx)} className={sel ? styles.listBtnSelected : styles.listBtn}>
                        <span>{e.name}</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: sel ? '#93c5fd' : '#9ca3af' }}>
                          {e.questions.length}문제
                        </span>
                      </button>
                    )
                  })}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* 새 시험 시작 시 진행 상태 폐기 확인 모달 */}
      {confirmNewStart && (
        <Box className={styles.modalOverlay}>
          <Box className={styles.modalBox}>
            <Text fw={700} size="lg" mb={8}>진행 중인 기록이 사라집니다</Text>
            <Text size="sm" c="#6b7280" mb={24} style={{ lineHeight: 1.6 }}>
              진행 중인 「{progress?.examName}」 기록이 사라집니다. 계속할까요?
            </Text>
            <Group gap={10}>
              <button
                onClick={() => setConfirmNewStart(false)}
                style={{ flex: 1, padding: '12px', borderRadius: 8, border: '2px solid #e5e7eb', background: 'white', color: '#4b5563', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                취소
              </button>
              <button
                onClick={() => { setConfirmNewStart(false); onDiscardProgress(); onStart(selectedIdx) }}
                style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: '#2563eb', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                계속
              </button>
            </Group>
          </Box>
        </Box>
      )}

      {/* 진행 상태 삭제 확인 모달 */}
      {confirmDelete && (
        <Box className={styles.modalOverlay}>
          <Box className={styles.modalBox}>
            <Text fw={700} size="lg" mb={8}>진행 중인 기록을 삭제할까요?</Text>
            <Text size="sm" c="#6b7280" mb={24} style={{ lineHeight: 1.6 }}>
              「{progress?.examName}」의 저장된 진행 상태가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.
            </Text>
            <Group gap={10}>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ flex: 1, padding: '12px', borderRadius: 8, border: '2px solid #e5e7eb', background: 'white', color: '#4b5563', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                취소
              </button>
              <button
                onClick={() => { setConfirmDelete(false); onDiscardProgress() }}
                style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                삭제
              </button>
            </Group>
          </Box>
        </Box>
      )}
    </Box>
  )
}

// ── 문제 화면 ────────────────────────────────────────────────
function ExamScreen({ exam, onFinish, onBack, initialAnswers = {}, initialIdx = 0, initialFlags = [], initialTimeLeft = null, reviewMode = false, onProgress }) {
  const isCollection = exam.type === 'collection'
  const questions = exam.questions

  const [currentIdx, setCurrentIdx] = useState(initialIdx)
  const [userAnswers, setUserAnswers] = useState(initialAnswers)
  const [flags, setFlags] = useState(new Set(initialFlags))
  const [timeLeft, setTimeLeft] = useState(isCollection || reviewMode ? 0 : (typeof initialTimeLeft === 'number' ? initialTimeLeft : 150 * 60))
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  // 매 렌더마다 최신 상태를 스냅샷으로 유지한다 — onProgress를 부르는 모든 경로(즉시저장/주기저장/이탈저장)가
  // 이 ref를 통해 최신 값을 읽으므로 stale closure 없이 항상 최신 userAnswers/timeLeft가 저장된다.
  const snapRef = useRef(null)
  snapRef.current = {
    examName: exam.name,
    answers: userAnswers,
    flags: [...flags],
    currentIdx,
    timeLeft,
    total: questions.length,
    updatedAt: new Date().toISOString(),
  }

  const canSaveProgress = !reviewMode && !!onProgress

  // 저장 트리거 A: 답안/현재 문제/검토표시가 바뀌면 즉시 저장
  useEffect(() => {
    if (!canSaveProgress) return
    onProgress(snapRef.current)
  }, [userAnswers, currentIdx, flags, canSaveProgress])

  // 저장 트리거 B: 10초 간격으로 저장 (타이머 값 반영용 — 매초 쓰기는 과함)
  useEffect(() => {
    if (!canSaveProgress) return
    const id = setInterval(() => onProgress(snapRef.current), 10000)
    return () => clearInterval(id)
  }, [canSaveProgress])

  // 제출 완료 여부. 제출 시 부모가 onFinish 안에서 setProgress(null)로 진행 상태를 지우는데,
  // 그 직후 이 컴포넌트가 언마운트되면서 트리거 C의 "언마운트 시 마지막 저장"이 무조건 실행되면
  // 방금 지운 진행 상태가 되살아난다. 이를 막기 위해 제출 여부를 기록해둔다.
  const submittedRef = useRef(false)

  // 저장 트리거 C: 앱 이탈/백그라운드 전환 시 저장 (모바일 PWA는 beforeunload가 안 불리는 경우가 많아 visibilitychange가 실질적 안전망)
  useEffect(() => {
    if (!canSaveProgress) return
    const save = () => onProgress(snapRef.current)
    const onVisibility = () => { if (document.visibilityState === 'hidden') save() }
    window.addEventListener('beforeunload', save)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('beforeunload', save)
      document.removeEventListener('visibilitychange', onVisibility)
      // 언마운트(다른 화면으로 이동) 시 마지막 상태를 한 번 더 저장. 단, 방금 제출된 경우는 예외 —
      // 부모가 이미 진행 상태를 지웠으므로 여기서 다시 저장하면 안 된다.
      if (!submittedRef.current) save()
    }
  }, [canSaveProgress])

  const timerRef = useRef(null)

  // 인터벌 콜백이 첫 렌더의 handleSubmit을 그대로 캡처하면, 시간 만료로 자동 제출될 때
  // userAnswers가 항상 빈 값(첫 렌더 값)으로 제출되는 버그가 있었다. ref로 최신 함수를 항상 참조하도록 고친다.
  const submitRef = useRef(null)
  useEffect(() => {
    submitRef.current = handleSubmit
  })

  useEffect(() => {
    if (isCollection || reviewMode || timeLeft === 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          // setState 업데이터 안에서 곧바로 handleSubmit(부모 setState 포함)을 부르면 렌더 중 업데이트가 되므로 다음 tick으로 미룬다
          setTimeout(() => submitRef.current(), 0)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [isCollection, reviewMode])

  function handleSubmit() {
    submittedRef.current = true
    clearInterval(timerRef.current)
    onFinish({ questions, userAnswers, exam })
  }

  function selectAnswer(num) {
    if (reviewMode) return
    setUserAnswers(prev => {
      const next = { ...prev }
      if (next[currentIdx] === num && !isCollection) delete next[currentIdx]
      else next[currentIdx] = num
      return next
    })
  }

  function navigate(dir) {
    setCurrentIdx(i => Math.max(0, Math.min(questions.length - 1, i + dir)))
  }

  function toggleFlag() {
    setFlags(prev => {
      const next = new Set(prev)
      if (next.has(currentIdx)) next.delete(currentIdx)
      else next.add(currentIdx)
      return next
    })
  }

  // 키보드
  useEffect(() => {
    function onKey(e) {
      if (reviewMode) return
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') navigate(-1)
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') navigate(1)
      else if (['1', '2', '3', '4'].includes(e.key)) selectAnswer(parseInt(e.key))
      else if (e.key === 'f' || e.key === 'F') toggleFlag()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentIdx, reviewMode, userAnswers, flags])

  const q = questions[currentIdx]
  const answered = userAnswers[currentIdx] !== undefined
  const showAnswer = reviewMode || (isCollection && answered)

  // 타이머 포맷
  const timerStr = formatTimer(timeLeft)
  const timerColor = timeLeft <= 60 ? '#dc2626' : timeLeft <= 300 ? '#d97706' : '#1f2937'

  const unanswered = questions.length - Object.keys(userAnswers).length

  return (
    <Box className={styles.examWrap}>
      {/* 헤더 위 버튼 행 */}
      <Box style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '5px 10px', flexShrink: 0 }}>
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{ background: 'white', border: '1.5px solid #d1d5db', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
        >
          <IconList size={13} /> 목록
        </button>
        {!isCollection && !reviewMode && (
          <button
            onClick={() => setShowSubmitModal(true)}
            style={{ background: '#2563eb', border: 'none', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'white', boxShadow: '0 1px 3px rgba(37,99,235,0.25)' }}
          >
            제출
          </button>
        )}
      </Box>

      {/* 헤더 */}
      <Box
        style={{
          background: reviewMode ? '#1f2937' : 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 12px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          position: 'sticky',
          top: 60,
          zIndex: 10,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          flexShrink: 0,
        }}
      >
        <Box style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', width: '100%' }}>
          <Box style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <IconChevronLeft size={20} color={reviewMode ? 'white' : '#374151'} />
            </button>
            <Text fw={700} size="sm" c={reviewMode ? 'white' : '#1f2937'} style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {exam.name}
            </Text>
          </Box>
          <Text size="xs" c={reviewMode ? 'rgba(255,255,255,0.7)' : '#6b7280'} ta="center">
            <Text span fw={700} c={reviewMode ? 'white' : '#1f2937'}>{currentIdx + 1}</Text>
            {' '}/ {questions.length}
          </Text>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {!isCollection && (
              <Text fw={700} size="xs" style={{ color: timerColor, fontVariantNumeric: 'tabular-nums', background: reviewMode ? 'rgba(255,255,255,0.1)' : '#f3f4f6', padding: '2px 6px', borderRadius: 6 }}>
                {timerStr}
              </Text>
            )}
          </Box>
        </Box>
      </Box>

      {/* 검토 모드 배너 */}
      {reviewMode && (
        <Box style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <Text size="xs" fw={600} c="#92400e">📋 검토 모드 — 정답이 표시됩니다</Text>
        </Box>
      )}

      {/* 본문 */}
      <Box style={{ flex: 1, position: 'relative' }}>
        {/* 문제 영역 */}
        <Box className={styles.examContent}>
          <Box className={styles.inner800}>
            {/* 이전/다음 */}
            <Group justify="space-between" mb={12} wrap="nowrap">
              <button
                onClick={() => navigate(-1)}
                disabled={currentIdx === 0}
                className={styles.navBtn} style={{ cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', opacity: currentIdx === 0 ? 0.4 : 1 }}
              >
                <IconChevronLeft size={16} /> 이전
              </button>

              <button
                onClick={toggleFlag}
                style={{
                  padding: '10px 16px', borderRadius: 8,
                  border: `2px solid ${flags.has(currentIdx) ? '#d97706' : '#d97706'}`,
                  background: flags.has(currentIdx) ? '#d97706' : 'white',
                  cursor: 'pointer', fontSize: 13, fontWeight: 700,
                  color: flags.has(currentIdx) ? 'white' : '#d97706',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <IconFlag size={14} /> 표시
              </button>

              <button
                onClick={() => navigate(1)}
                disabled={currentIdx === questions.length - 1}
                className={styles.navBtn} style={{ cursor: currentIdx === questions.length - 1 ? 'not-allowed' : 'pointer', opacity: currentIdx === questions.length - 1 ? 0.4 : 1 }}
              >
                다음 <IconChevronRight size={16} />
              </button>
            </Group>

            {/* 문제 카드 */}
            <Box className={styles.questionCard}>
              <Group align="flex-start" gap={12} mb={12} wrap="nowrap">
                <Box className={styles.questionNumCircle}>
                  {q.number}
                </Box>
                <Text fw={600} size="sm" c="#1f2937" style={{ flex: 1, lineHeight: 1.7, whiteSpace: 'pre-line', marginTop: 4 }}>
                  {q.question}
                </Text>
              </Group>
              {q.sql && (
                <Box style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', overflowX: 'auto', marginBottom: 12 }}>
                  <Text size="xs" c="#374151" style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap', fontFamily: '"Consolas", "Menlo", monospace' }}>{q.sql}</Text>
                </Box>
              )}
              {(q.table || q.tables || q.description) && (() => {
                const boxStyle = { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 14px', overflowX: 'auto', marginBottom: 12 }
                const renderTable = (headers, rows, prefix) => (
                  <Box style={boxStyle}>
                    {prefix && <Text size="xs" c="#374151" mb={8} style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{prefix}</Text>}
                    <table style={{ borderCollapse: 'collapse', fontSize: 12, width: '100%' }}>
                      <thead>
                        <tr>
                          {headers.map((h, i) => (
                            <th key={i} style={{ background: '#e2e8f0', border: '1px solid #cbd5e1', padding: '5px 10px', fontWeight: 700, color: '#374151', textAlign: 'center', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => (
                          <tr key={i} style={{ background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                            {row.map((cell, j) => (
                              <td key={j} style={{ border: '1px solid #e2e8f0', padding: '4px 10px', textAlign: 'center', color: '#374151', whiteSpace: 'nowrap' }}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                )
                if (q.tables) {
                  return (
                    <Stack gap={6} mb={12}>
                      {q.tables.map((t, i) => (
                        <Box key={i}>
                          {t.label && <Text size="xs" fw={600} c="#6b7280" mb={4}>{t.label}</Text>}
                          {renderTable(t.headers, t.rows, '')}
                        </Box>
                      ))}
                    </Stack>
                  )
                }
                if (q.table) return renderTable(q.table.headers, q.table.rows, '')
                const detected = !q.code && detectTable(q.description)
                if (detected) return renderTable(detected.headers, detected.rows, detected.prefix)
                const isCode = q.code || q.description.includes('\n    ')
                return (
                  <Box style={boxStyle}>
                    <Text size="xs" c="#374151" style={{ lineHeight: isCode ? 1.6 : 1.8, whiteSpace: 'pre-wrap', fontFamily: isCode ? '"Consolas", "Menlo", monospace' : 'inherit' }}>
                      {q.description}
                    </Text>
                  </Box>
                )
              })()}
              {q.tree && <TreeRenderer tree={q.tree} />}
              {q.graph && <GraphRenderer graph={q.graph} />}

              <Stack gap={8}>
                {q.choices.map((c, i) => {
                  const num = i + 1
                  const selected = userAnswers[currentIdx] === num
                  let bg = 'white', border = '#e5e7eb', color = '#374151', numBg = 'transparent', numBorder = '#d1d5db', numColor = '#6b7280'

                  if (showAnswer && q.answer > 0) {
                    if (num === q.answer) {
                      bg = '#f0fdf4'; border = '#16a34a'; color = '#16a34a'
                      numBg = '#16a34a'; numBorder = '#16a34a'; numColor = 'white'
                    } else if (selected) {
                      bg = '#fef2f2'; border = '#dc2626'; color = '#dc2626'
                      numBg = '#dc2626'; numBorder = '#dc2626'; numColor = 'white'
                    }
                  } else if (selected) {
                    bg = '#eff6ff'; border = '#2563eb'; color = '#2563eb'
                    numBg = '#2563eb'; numBorder = '#2563eb'; numColor = 'white'
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => selectAnswer(num)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '12px 14px',
                        border: `2px solid ${border}`,
                        borderRadius: 10, background: bg,
                        cursor: reviewMode ? 'default' : 'pointer',
                        textAlign: 'left', transition: 'all 0.12s',
                        fontSize: 14, color, lineHeight: 1.6, width: '100%',
                      }}
                    >
                      <Box
                        style={{
                          width: 26, height: 26, borderRadius: '50%',
                          border: `2px solid ${numBorder}`, background: numBg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, color: numColor, flexShrink: 0, marginTop: 1,
                        }}
                      >
                        {num}
                      </Box>
                      {c && typeof c === 'object' && c.table
                        ? <Box style={{ marginTop: 1 }}><ChoiceTable table={c.table} /></Box>
                        : <span style={{ display: 'inline-block', marginTop: 3, whiteSpace: 'pre-line' }}>{c}</span>}
                    </button>
                  )
                })}
              </Stack>
            </Box>

            {showAnswer && (
              <>
                {/* 정답 결과 */}
                {(!isCollection || q.answer > 0) && (
                  <Box
                    style={{
                      borderRadius: 8, padding: '12px 16px', fontSize: 13, fontWeight: 600,
                      ...(isCollection
                        ? { background: '#fefce8', border: '1px solid #fde68a', color: '#92400e' }
                        : userAnswers[currentIdx] === q.answer
                          ? { background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }
                          : { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }
                      ),
                    }}
                  >
                    {isCollection
                      ? `정답: ${q.answer}번`
                      : userAnswers[currentIdx] === q.answer
                        ? `✓ 정답! (${q.answer}번)`
                        : `✗ 오답 — 정답: ${q.answer}번 / 내 답: ${userAnswers[currentIdx] ? userAnswers[currentIdx] + '번' : '미응답'}`
                    }
                  </Box>
                )}

                {/* 해설 */}
                {q.explanation && (
                  <Box
                    style={{
                      marginTop: 10, borderRadius: 8, padding: '12px 16px',
                      background: '#f9fafb', border: '1px solid #e5e7eb', color: '#374151',
                    }}
                  >
                    <Text size="xs" fw={700} c="#6b7280" mb={6}>해설</Text>
                    <Text style={{ fontSize: 13, fontWeight: 400, lineHeight: 1.7, whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                      {q.explanation}
                    </Text>
                  </Box>
                )}
              </>
            )}

          </Box>
        </Box>

        {/* 사이드바 */}
        {sidebarOpen && (
          <>
            <Box onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 99 }} />
            <Box
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 240, background: 'white', borderLeft: '1px solid #e5e7eb',
                display: 'flex', flexDirection: 'column', zIndex: 100,
                boxShadow: '-4px 0 16px rgba(0,0,0,0.1)',
              }}
            >
              <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 12px', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
                <Text size="xs" fw={700} c="#9ca3af" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>문제 현황</Text>
                <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: '#6b7280' }}>
                  <IconX size={16} />
                </button>
              </Box>
              <Box style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>

              {!isCollection ? (
                SUBJECTS.map(subj => {
                  const subQs = questions.filter(q => q.subject === subj)
                  if (!subQs.length) return null
                  return (
                    <Box key={subj} mb={12}>
                      <Text size="xs" fw={600} c="#6b7280" mb={4}>{SUBJECT_SHORT[subj] || subj}</Text>
                      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3 }}>
                        {subQs.map(sq => {
                          const i = questions.indexOf(sq)
                          return <QDot key={i} i={i} q={sq} currentIdx={currentIdx} userAnswers={userAnswers} flags={flags} isCollection={isCollection} onClick={() => { setCurrentIdx(i); setSidebarOpen(false) }} />
                        })}
                      </Box>
                    </Box>
                  )
                })
              ) : (
                <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3 }}>
                  {questions.map((sq, i) => (
                    <QDot key={i} i={i} q={sq} currentIdx={currentIdx} userAnswers={userAnswers} flags={flags} isCollection={isCollection} onClick={() => { setCurrentIdx(i); setSidebarOpen(false) }} />
                  ))}
                </Box>
              )}

              <Box mt={12} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[
                  { color: '#2563eb', label: '답안 선택' },
                  { color: '#d97706', label: '검토 표시', bg: '#fffbeb' },
                  { color: '#e5e7eb', label: '미응답' },
                ].map(({ color, label, bg }) => (
                  <Box key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Box style={{ width: 12, height: 12, borderRadius: 3, background: bg || color, border: `1.5px solid ${color}`, flexShrink: 0 }} />
                    <Text size="xs" c="#6b7280">{label}</Text>
                  </Box>
                ))}
              </Box>
              </Box>
            </Box>
          </>
        )}
      </Box>

      {/* 제출 모달 */}
      {showSubmitModal && (
        <Box className={styles.modalOverlay}>
          <Box className={styles.modalBox}>
            <Text fw={700} size="lg" mb={8}>시험을 제출하시겠습니까?</Text>
            <Text size="sm" c="#6b7280" mb={24} style={{ lineHeight: 1.6 }}>
              {unanswered > 0 ? `미응답 문제 ${unanswered}개가 있습니다. ` : ''}
              {flags.size > 0 ? `검토 표시 ${flags.size}개가 있습니다. ` : ''}
              제출 후에는 수정할 수 없습니다.
            </Text>
            <Group gap={10}>
              <button
                onClick={() => setShowSubmitModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: 8, border: '2px solid #e5e7eb', background: 'white', color: '#4b5563', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                취소
              </button>
              <button
                onClick={handleSubmit}
                style={{ flex: 1, padding: '12px', borderRadius: 8, border: 'none', background: '#2563eb', color: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                제출
              </button>
            </Group>
          </Box>
        </Box>
      )}
    </Box>
  )
}

function QDot({ i, q, currentIdx, userAnswers, flags, isCollection, onClick }) {
  const isCurrent = i === currentIdx
  const isFlagged = flags.has(i)
  const isAnswered = userAnswers[i] !== undefined
  const label = isCollection ? i + 1 : q.number

  let bg = 'white', border = '#e5e7eb', color = '#9ca3af'
  if (isCurrent) { border = '#2563eb'; color = isFlagged ? '#d97706' : isAnswered ? 'white' : '#2563eb' }
  if (isFlagged) { bg = '#fffbeb'; border = isCurrent ? '#2563eb' : '#d97706'; color = '#d97706' }
  else if (isAnswered) { bg = '#2563eb'; border = isCurrent ? '#1d4ed8' : '#2563eb'; color = 'white' }

  return (
    <button
      onClick={onClick}
      style={{
        aspectRatio: '1', borderRadius: 5, border: `${isCurrent ? '2.5px' : '1.5px'} solid ${border}`,
        background: bg, cursor: 'pointer', fontSize: 10, fontWeight: 600, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {label}
    </button>
  )
}

// ── 결과 화면 ────────────────────────────────────────────────
function ResultScreen({ result, onReview, onRetry }) {
  const isNarrow = useIsNarrow()
  const { questions, userAnswers, exam } = result
  let correct = 0, wrong = 0, unanswered = 0
  const subjectStats = {}
  SUBJECTS.forEach(s => { subjectStats[s] = { correct: 0, total: 0 } })

  questions.forEach((q, i) => {
    const subj = q.subject
    if (!subjectStats[subj]) subjectStats[subj] = { correct: 0, total: 0 }
    subjectStats[subj].total++
    if (userAnswers[i] === undefined) unanswered++
    else if (userAnswers[i] === q.answer) { correct++; subjectStats[subj].correct++ }
    else wrong++
  })

  const scorePercent = Math.round((correct / questions.length) * 100)
  const subjectPass = SUBJECTS.every(s => {
    const st = subjectStats[s]
    return !st || st.total === 0 || (st.correct / st.total) >= 0.4
  })
  const passed = subjectPass && scorePercent >= 60
  const activeSubs = SUBJECTS.filter(s => subjectStats[s]?.total > 0)

  return (
    <Box className={styles.resultWrap}>
      <Box className={styles.resultCard}>
        {/* 헤더 */}
        <Box className={styles.resultHero}>
          <Text size="sm" style={{ opacity: 0.85 }} mb={4}>{exam.name}</Text>
          <Text fw={700} size="xl">시험 결과</Text>
          <Text style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, marginTop: 16 }}>
            {scorePercent}<Text span style={{ fontSize: 20, fontWeight: 600, opacity: 0.8 }}>점</Text>
          </Text>
          <Box
            style={{
              display: 'inline-block', marginTop: 12, padding: '4px 16px',
              borderRadius: 99, fontWeight: 700, fontSize: 14,
              background: passed ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
            }}
          >
            {passed ? '합격' : '불합격'}
          </Box>
        </Box>

        {/* 통계 */}
        <Box style={{ padding: '24px' }}>
          <Box className={styles.statGrid}>
            {[
              { val: correct, label: '정답', color: '#16a34a' },
              { val: wrong, label: '오답', color: '#dc2626' },
              { val: unanswered, label: '미응답', color: '#1f2937' },
            ].map(({ val, label, color }) => (
              <Box key={label} className={styles.statBox}>
                <Text fw={800} size="xl" c={color}>{val}</Text>
                <Text size="xs" c="#9ca3af" mt={2}>{label}</Text>
              </Box>
            ))}
          </Box>

          {/* 과목별 성적 */}
          {activeSubs.length > 1 && (
            <Box mb={24}>
              <Text fw={700} size="sm" c="#4b5563" mb={12}>과목별 성적</Text>
              <Stack gap={8}>
                {activeSubs.map(s => {
                  const st = subjectStats[s]
                  const pct = Math.round((st.correct / st.total) * 100)
                  const isFail = pct < 40
                  return (
                    <Box key={s} style={{ display: 'flex', alignItems: 'center', gap: isNarrow ? 6 : 10 }}>
                      <Text size="xs" c="#4b5563" style={{ width: isNarrow ? 68 : 90, flexShrink: 0 }}>{SUBJECT_SHORT[s] || s}</Text>
                      <Box className={styles.progressTrack}>
                        <Box style={{ width: `${pct}%`, height: '100%', background: isFail ? '#dc2626' : '#2563eb', borderRadius: 99, transition: 'width 0.8s ease' }} />
                      </Box>
                      <Text size="xs" fw={700} c={isFail ? '#dc2626' : '#374151'} style={{ width: isNarrow ? 58 : 70, textAlign: 'right', flexShrink: 0 }}>
                        {st.correct}/{st.total} ({pct}점)
                      </Text>
                    </Box>
                  )
                })}
              </Stack>
            </Box>
          )}

          <Group gap={10}>
            <button onClick={onReview} className={styles.outlineBtn} style={{ flex: 1 }}>
              오답 검토
            </button>
            <button onClick={onRetry} className={styles.primaryBtn} style={{ flex: 1 }}>
              다시 시작
            </button>
          </Group>
        </Box>
      </Box>
    </Box>
  )
}

// ── 메인 ─────────────────────────────────────────────────────
export default function EngineerExamView({ onSaveResult, onDeleteResult, examResults }) {
  const [exams, setExams] = useState(null)
  const [screen, setScreen] = useState('start') // 'start' | 'exam' | 'result' | 'review'
  const [tab, setTab] = useState('exam') // 'exam' | 'history'
  const [selectedExamIdx, setSelectedExamIdx] = useState(-1)
  const [examResult, setExamResult] = useState(null)
  const [reviewOrigin, setReviewOrigin] = useState('result') // 검토 화면에서 뒤로 갈 곳: 'result' | 'history'
  const [progress, setProgress] = useExamProgress()
  const [resuming, setResuming] = useState(false) // 'exam' 화면 진입이 이어서풀기인지(진행 상태를 초기값으로 쓸지)

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'exam-questions.json')
      .then(r => r.json())
      .then(data => setExams(data.exams))
      .catch(() => setExams([]))
  }, [])

  // exam-questions.json은 계속 바뀌는 파일이라, 저장된 진행 상태가 가리키는 시험이 없어졌거나
  // 문제 수가 달라졌으면(인덱스가 엉뚱한 문제를 가리킴) 복원하지 않고 폐기한다.
  useEffect(() => {
    if (!exams || !progress) return
    const target = exams.find(e => e.name === progress.examName)
    if (!target || target.questions.length !== progress.total) {
      setProgress(null)
    }
  }, [exams, progress])

  if (!exams) {
    return <Center style={{ minHeight: 300 }}><Loader size="sm" /></Center>
  }

  if (exams.length === 0) {
    return <Center style={{ minHeight: 300 }}><Text c="dimmed">데이터를 불러올 수 없습니다.</Text></Center>
  }

  if (screen === 'exam') {
    const useResumedInit = resuming && progress
    return (
      <ExamScreen
        key="exam"
        exam={exams[selectedExamIdx]}
        initialAnswers={useResumedInit ? normalizeAnswers(progress.answers) : {}}
        initialIdx={useResumedInit ? progress.currentIdx : 0}
        initialFlags={useResumedInit ? progress.flags : []}
        initialTimeLeft={useResumedInit ? progress.timeLeft : null}
        onProgress={setProgress}
        onFinish={result => {
          setExamResult(result)
          setScreen('result')
          const correct = result.questions.filter((q, i) => result.userAnswers[i] === q.answer).length
          onSaveResult?.({
            id: crypto.randomUUID(),
            examName: result.exam.name,
            correct,
            total: result.questions.length,
            date: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            answers: result.userAnswers,
          })
          setProgress(null) // 제출 완료 — 더 이상 이어서 풀 대상이 아니므로 진행 상태를 지운다
        }}
        onBack={() => setScreen('start')}
      />
    )
  }

  if (screen === 'review' && examResult) {
    const wrongIdxs = examResult.questions.reduce((acc, q, i) => {
      if (examResult.userAnswers[i] !== q.answer) acc.push(i)
      return acc
    }, [])
    const backFromReview = () => {
      if (reviewOrigin === 'history') { setTab('history'); setScreen('start') }
      else setScreen('result')
    }
    return (
      <ExamScreen
        key="review"
        exam={examResult.exam}
        reviewMode
        initialAnswers={examResult.userAnswers}
        initialIdx={wrongIdxs[0] ?? 0}
        onFinish={backFromReview}
        onBack={backFromReview}
      />
    )
  }

  if (screen === 'result' && examResult) {
    const wrongIdxs = examResult.questions.reduce((acc, q, i) => {
      if (examResult.userAnswers[i] !== q.answer) acc.push(i)
      return acc
    }, [])

    return (
      <ResultScreen
        result={examResult}
        onReview={() => {
          if (wrongIdxs.length === 0) { alert('모든 문제를 정답으로 맞혔습니다!'); return }
          setReviewOrigin('result')
          setScreen('review')
        }}
        onRetry={() => setScreen('start')}
      />
    )
  }

  return (
    <StartScreen
      exams={exams}
      onStart={idx => { setResuming(false); setSelectedExamIdx(idx); setScreen('exam') }}
      examResults={examResults}
      tab={tab}
      onTabChange={setTab}
      onReviewRecord={record => {
        const exam = exams.find(e => e.name === record.examName)
        if (!exam || !record.answers) return
        setExamResult({ questions: exam.questions, userAnswers: normalizeAnswers(record.answers), exam })
        setReviewOrigin('history')
        setScreen('review')
      }}
      progress={progress}
      onResume={() => {
        if (!progress) return
        const idx = exams.findIndex(e => e.name === progress.examName)
        if (idx < 0) { setProgress(null); return }
        setResuming(true)
        setSelectedExamIdx(idx)
        setScreen('exam')
      }}
      onDiscardProgress={() => setProgress(null)}
      onDeleteResult={onDeleteResult}
    />
  )
}
