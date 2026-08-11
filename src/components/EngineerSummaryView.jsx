import { useState, useMemo, useEffect, useId } from 'react'
import { Box, Text, Stack, Group, Badge, TextInput, ActionIcon, Collapse, UnstyledButton } from '@mantine/core'
import { IconSearch, IconX, IconChevronDown, IconChevronUp, IconBulb } from '@tabler/icons-react'
import { useIsMobile } from '../hooks/useBreakpoint'
import { SUMMARY_SUBJECTS } from '../data/engineerSummary'
import styles from './EngineerSummaryView.module.scss'

const TAG_COLOR = { '빈출': 'orange', '계산': 'blue', '암기': 'green' }

// 좁은 화면에서는 탭 6개가 가로를 균등 분할해 칸이 매우 좁으므로 축약형을 쓴다
const SUBJECT_SHORT = {
  '소프트웨어 설계': 'SW설계',
  '소프트웨어 개발': 'SW개발',
  '데이터베이스 구축': 'DB구축',
  '프로그래밍 언어 활용': '언어활용',
  '정보시스템 구축관리': '시스템',
  '두문자 모음': '두문자',
  '취약 주제 정리': '취약주제',
}

// ── 인라인 강조 (**굵게**) ─────────────────────────────────
function renderRich(str) {
  if (str == null) return str
  const parts = String(str).split(/(\*\*[^*]+\*\*)/)
  return parts.map((part, i) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) return <b key={i}>{part.slice(2, -2)}</b>
    return part
  })
}

// ── 이진트리 배치 계산 ───────────────────────────────────────
// 세로는 깊이, 가로는 중위 순회 순서로 배치하면 서브트리가 겹치지 않는다.
const NODE_R = 16
const COL_W = 52
const ROW_H = 56

function layoutTree(root) {
  const nodes = []
  const edges = []
  let col = 0
  function walk(node, depth) {
    if (!node) return null
    const id = nodes.length
    nodes.push({ id, value: node.v, depth, col: 0 })
    const leftId = walk(node.l, depth + 1)
    nodes[id].col = col++
    const rightId = walk(node.r, depth + 1)
    if (leftId != null) edges.push([id, leftId])
    if (rightId != null) edges.push([id, rightId])
    return id
  }
  walk(root, 0)
  const laid = nodes.map(n => ({
    ...n,
    x: NODE_R + 6 + n.col * COL_W,
    y: NODE_R + 6 + n.depth * ROW_H,
  }))
  const pad = (NODE_R + 6) * 2
  const width = Math.max(...laid.map(n => n.col), 0) * COL_W + pad
  const height = Math.max(...laid.map(n => n.depth), 0) * ROW_H + pad
  return { nodes: laid, edges, width, height }
}

function treeValues(node) {
  if (!node) return []
  return [node.v, ...treeValues(node.l), ...treeValues(node.r)]
}

// ── 블록 → 검색용 평문 텍스트 ────────────────────────────────
function blockText(block) {
  switch (block?.type) {
    case 'text': return block.value || ''
    case 'list': return (block.items || []).join(' ')
    case 'table': return [...(block.headers || []), ...(block.rows || []).flat()].join(' ')
    case 'order': return [block.label || '', ...(block.items || [])].join(' ')
    case 'tip': return block.value || ''
    case 'code': return block.value || ''
    case 'tree': return [block.caption || '', ...treeValues(block.root)].join(' ')
    case 'cells': {
      const values = (block.rows || []).flatMap(r => r.values || [])
      const pointerLabels = (block.pointers || []).map(p => p.label || '')
      return [block.caption || '', ...values, ...pointerLabels].join(' ')
    }
    case 'graph': return [block.caption || '', ...(block.nodes || []).map(n => n.id)].join(' ')
    default: return ''
  }
}

function topicText(topic) {
  return [topic.title, ...(topic.blocks || []).map(blockText)].join(' ')
}

// ── 블록 렌더러 ──────────────────────────────────────────────
function BlockRenderer({ block }) {
  // graph 블록의 화살표 marker id 는 같은 페이지에 여러 개 있어도 충돌하면 안 되므로
  // 훅 규칙을 지키기 위해 case 분기와 무관하게 항상 호출해 둔다.
  const reactId = useId()
  switch (block?.type) {
    case 'text':
      return <Text component="p" m={0} className={styles.textBlock}>{renderRich(block.value)}</Text>

    case 'list':
      return (
        <ul className={styles.listBlock}>
          {(block.items || []).map((item, i) => (
            <li key={i}>{renderRich(item)}</li>
          ))}
        </ul>
      )

    case 'table':
      return (
        <Box className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {(block.headers || []).map((h, i) => <th key={i}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {(block.rows || []).map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => <td key={j}>{renderRich(cell)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )

    case 'order':
      return (
        <Box className={styles.orderBlock}>
          {block.label && <Text component="p" m={0} className={styles.orderLabel}>{block.label}</Text>}
          <Box className={styles.orderChips}>
            {(block.items || []).map((item, i) => (
              <span key={i} className={styles.orderChipGroup}>
                {i > 0 && <span className={styles.orderSep}>›</span>}
                <span className={styles.orderChip}>{item}</span>
              </span>
            ))}
          </Box>
        </Box>
      )

    case 'tip':
      return (
        <Box className={styles.tipBlock}>
          <IconBulb size={16} className={styles.tipIcon} />
          <Text component="p" m={0} className={styles.tipText}>{renderRich(block.value)}</Text>
        </Box>
      )

    case 'code':
      return (
        <Box className={styles.codeBlock}>
          {block.lang && <span className={styles.codeLang}>{block.lang}</span>}
          <pre className={styles.pre}>{block.value}</pre>
          {block.note && <Text component="p" m={0} className={styles.codeNote}>→ {block.note}</Text>}
        </Box>
      )

    case 'tree': {
      if (!block.root) return null
      const { nodes, edges, width, height } = layoutTree(block.root)
      return (
        <Box className={styles.treeBlock}>
          <svg
            className={styles.treeSvg}
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            role="img"
            aria-label={block.caption || '트리 구조'}
          >
            {edges.map(([from, to]) => (
              <line
                key={`${from}-${to}`}
                x1={nodes[from].x} y1={nodes[from].y}
                x2={nodes[to].x} y2={nodes[to].y}
                stroke="#C7D2FE" strokeWidth="2"
              />
            ))}
            {nodes.map(n => (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={NODE_R} fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
                <text
                  x={n.x} y={n.y}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize="13" fontWeight="700" fill="#4338CA"
                >
                  {n.value}
                </text>
              </g>
            ))}
          </svg>
          {block.caption && <Text component="p" m={0} className={styles.treeCaption}>{block.caption}</Text>}
        </Box>
      )
    }

    case 'cells': {
      const rows = (block.rows || []).filter(r => (r.values || []).length > 0)
      if (rows.length === 0) return null
      const vertical = !!block.vertical
      const pointers = block.pointers || []
      const lastRowIdx = rows.length - 1

      return (
        <Box className={styles.treeBlock}>
          <Box className={styles.cellsScroll}>
            {vertical ? (
              <Box className={styles.cellsVerticalWrap}>
                {rows.map((row, ri) => {
                  const values = row.values || []
                  const mark = new Set(row.mark || [])
                  const order = values.map((_, idx) => idx).reverse() // 마지막 원소(top)가 맨 위
                  return (
                    <Box key={ri} className={styles.cellsVerticalRow}>
                      {row.label && <Text component="span" className={styles.cellsRowLabel}>{row.label}</Text>}
                      <Box className={styles.cellsVerticalStack}>
                        {order.map(idx => {
                          const pointer = ri === lastRowIdx ? pointers.find(p => p.index === idx) : null
                          return (
                            <Box key={idx} className={styles.cellsVerticalItem}>
                              <Box className={mark.has(idx) ? `${styles.cellBox} ${styles.cellBoxMarked}` : styles.cellBox}>
                                {values[idx]}
                              </Box>
                              {pointer && (
                                <Text component="span" className={styles.cellsPointerInline}>◀ {pointer.label}</Text>
                              )}
                            </Box>
                          )
                        })}
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            ) : (
              <Box className={styles.cellsRows}>
                {rows.map((row, ri) => {
                  const values = row.values || []
                  const mark = new Set(row.mark || [])
                  return (
                    <Box key={ri} className={styles.cellsRow}>
                      <Text component="span" className={styles.cellsRowLabel}>{row.label || ''}</Text>
                      <Box className={styles.cellsBoxesRow}>
                        {values.map((v, idx) => (
                          <Box key={idx} className={mark.has(idx) ? `${styles.cellBox} ${styles.cellBoxMarked}` : styles.cellBox}>
                            {v}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )
                })}
                {pointers.length > 0 && (
                  <Box className={styles.cellsRow}>
                    <Text component="span" className={styles.cellsRowLabel} />
                    <Box className={styles.cellsBoxesRow}>
                      {(rows[lastRowIdx].values || []).map((_, idx) => {
                        const p = pointers.find(p => p.index === idx)
                        return (
                          <Box key={idx} className={styles.cellsPointerCell}>
                            {p && (
                              <>
                                <Text component="span" className={styles.cellsPointerArrow}>▲</Text>
                                <Text component="span" className={styles.cellsPointerLabel}>{p.label}</Text>
                              </>
                            )}
                          </Box>
                        )
                      })}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
          {block.caption && <Text component="p" m={0} className={styles.treeCaption}>{block.caption}</Text>}
        </Box>
      )
    }

    case 'graph': {
      if (!block.nodes || block.nodes.length === 0) return null
      const nodeMap = new Map(block.nodes.map(n => [n.id, n]))
      const validEdges = (block.edges || []).filter(([a, b]) => nodeMap.has(a) && nodeMap.has(b))
      const laidNodes = block.nodes.map(n => ({
        ...n,
        x: NODE_R + 6 + n.x * 72,
        y: NODE_R + 6 + n.y * 72,
      }))
      const laidMap = new Map(laidNodes.map(n => [n.id, n]))
      const pad = (NODE_R + 6) * 2
      const width = Math.max(...laidNodes.map(n => n.x - NODE_R - 6), 0) + pad
      const height = Math.max(...laidNodes.map(n => n.y - NODE_R - 6), 0) + pad
      const markerId = `graph-arrow-${reactId}`

      return (
        <Box className={styles.treeBlock}>
          <svg
            className={styles.treeSvg}
            viewBox={`0 0 ${width} ${height}`}
            width={width}
            height={height}
            role="img"
            aria-label={block.caption || '그래프 구조'}
          >
            {block.directed && (
              <defs>
                <marker id={markerId} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#C7D2FE" />
                </marker>
              </defs>
            )}
            {validEdges.map(([a, b], i) => {
              const na = laidMap.get(a)
              const nb = laidMap.get(b)
              const dx = nb.x - na.x
              const dy = nb.y - na.y
              const dist = Math.sqrt(dx * dx + dy * dy) || 1
              const ux = dx / dist
              const uy = dy / dist
              const x1 = na.x + ux * NODE_R
              const y1 = na.y + uy * NODE_R
              const x2 = nb.x - ux * NODE_R
              const y2 = nb.y - uy * NODE_R
              return (
                <line
                  key={`${a}-${b}-${i}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#C7D2FE" strokeWidth="2"
                  markerEnd={block.directed ? `url(#${markerId})` : undefined}
                />
              )
            })}
            {laidNodes.map(n => (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={NODE_R} fill="#EEF2FF" stroke="#6366F1" strokeWidth="1.5" />
                <text
                  x={n.x} y={n.y}
                  textAnchor="middle" dominantBaseline="central"
                  fontSize="13" fontWeight="700" fill="#4338CA"
                >
                  {n.id}
                </text>
              </g>
            ))}
          </svg>
          {block.caption && <Text component="p" m={0} className={styles.treeCaption}>{block.caption}</Text>}
        </Box>
      )
    }

    default:
      return null
  }
}

// ── 주제 카드 ────────────────────────────────────────────────
function TopicCard({ index, topic, isOpen, onToggle, subjectBadge }) {
  const tagColor = TAG_COLOR[topic.tag]
  return (
    <Box className={styles.card}>
      <UnstyledButton className={styles.cardHeader} onClick={onToggle}>
        <Group gap={8} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <Text component="span" className={styles.cardIndex}>{index}.</Text>
          <Text component="span" className={styles.cardTitle}>{topic.title}</Text>
          {topic.tag && (
            <Badge size="sm" variant="light" color={tagColor} className={styles.tagBadge}>{topic.tag}</Badge>
          )}
          {subjectBadge && (
            <Badge size="sm" variant="outline" color="gray" className={styles.subjectBadge}>
              {subjectBadge.tabTop ?? `${subjectBadge.no}과목`}
            </Badge>
          )}
        </Group>
        {isOpen
          ? <IconChevronUp size={18} className={styles.chevron} />
          : <IconChevronDown size={18} className={styles.chevron} />}
      </UnstyledButton>
      <Collapse in={isOpen}>
        <Box className={styles.cardBody}>
          <Stack gap={14}>
            {(topic.blocks || []).map((block, i) => (
              <BlockRenderer key={i} block={block} />
            ))}
          </Stack>
        </Box>
      </Collapse>
    </Box>
  )
}

// ── 메인 뷰 ──────────────────────────────────────────────────
export default function EngineerSummaryView() {
  // SCSS 의 모바일 분기(689px)와 동일한 기준이어야 라벨이 잘리지 않는다
  const isNarrow = useIsMobile()
  const [activeSubject, setActiveSubject] = useState(0)
  const [query, setQuery] = useState('')
  const [collapsedKeys, setCollapsedKeys] = useState(() => new Set())
  // 검색 결과는 매번 전부 펼친 상태로 시작하되, 접기 조작은 그대로 동작해야 하므로
  // 과목 보기와 접힘 상태를 분리해서 관리한다.
  const [searchCollapsed, setSearchCollapsed] = useState(() => new Set())

  const trimmedQuery = query.trim()
  const isSearching = trimmedQuery.length > 0

  useEffect(() => { setSearchCollapsed(new Set()) }, [trimmedQuery])

  const activeCollapsed = isSearching ? searchCollapsed : collapsedKeys
  const setActiveCollapsed = isSearching ? setSearchCollapsed : setCollapsedKeys

  const searchResults = useMemo(() => {
    if (!isSearching) return []
    const q = trimmedQuery.toLowerCase()
    const results = []
    SUMMARY_SUBJECTS.forEach((subject, sIdx) => {
      ;(subject.topics || []).forEach(topic => {
        if (topicText(topic).toLowerCase().includes(q)) {
          results.push({ subject, sIdx, topic })
        }
      })
    })
    return results
  }, [trimmedQuery, isSearching])

  const currentSubject = SUMMARY_SUBJECTS[activeSubject]
  const displayTopics = isSearching
    ? searchResults
    : (currentSubject?.topics || []).map(topic => ({ subject: currentSubject, sIdx: activeSubject, topic }))

  const allKeys = displayTopics.map(({ sIdx, topic }) => `${sIdx}-${topic.id}`)
  const allCollapsed = allKeys.length > 0 && allKeys.every(k => activeCollapsed.has(k))

  function toggleTopic(key) {
    setActiveCollapsed(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleAll() {
    setActiveCollapsed(prev => {
      const next = new Set(prev)
      if (allCollapsed) allKeys.forEach(k => next.delete(k))
      else allKeys.forEach(k => next.add(k))
      return next
    })
  }

  return (
    <Box className={styles.pageWrap}>
      <Box className={styles.inner800}>
        <Box className={styles.tabsRow}>
          {SUMMARY_SUBJECTS.map((subject, idx) => {
            const active = idx === activeSubject && !isSearching
            return (
              <button
                key={subject.no ?? idx}
                type="button"
                className={active ? styles.tabActive : styles.tab}
                onClick={() => {
                  setActiveSubject(idx)
                  setQuery('')
                  // 아래로 스크롤한 상태에서 과목을 바꾸면 중간부터 보이므로 맨 위로 되돌린다
                  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                <span className={styles.tabNo}>{subject.tabTop ?? `${subject.no}과목`}</span>
                <span className={styles.tabTitle}>
                  {isNarrow ? (SUBJECT_SHORT[subject.title] ?? subject.title) : subject.title}
                </span>
              </button>
            )
          })}
        </Box>

        <TextInput
          className={styles.searchInput}
          placeholder="주제, 키워드로 검색"
          leftSection={<IconSearch size={16} />}
          rightSection={query ? (
            <ActionIcon variant="subtle" color="gray" onClick={() => setQuery('')}>
              <IconX size={14} />
            </ActionIcon>
          ) : null}
          value={query}
          onChange={e => setQuery(e.currentTarget.value)}
        />

        <Group justify="flex-end" className={styles.toggleAllRow}>
          <button type="button" className={styles.toggleAllBtn} onClick={toggleAll}>
            {allCollapsed ? '모두 펼치기' : '모두 접기'}
          </button>
        </Group>

        <Stack gap={12}>
          {displayTopics.length === 0 && (
            <Box className={styles.emptyBox}>
              <Text c="dimmed" size="sm">검색 결과가 없습니다</Text>
            </Box>
          )}
          {displayTopics.map(({ subject, sIdx, topic }, i) => {
            const key = `${sIdx}-${topic.id}`
            const isOpen = !activeCollapsed.has(key)
            return (
              <TopicCard
                key={key}
                index={i + 1}
                topic={topic}
                isOpen={isOpen}
                onToggle={() => toggleTopic(key)}
                subjectBadge={isSearching ? subject : null}
              />
            )
          })}
        </Stack>
      </Box>
    </Box>
  )
}
