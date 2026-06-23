import { useState, useEffect, useRef, useCallback } from 'react'
import { Box, Text, Stack, Group, Badge, ActionIcon, Loader, Center } from '@mantine/core'
import { IconChevronLeft, IconChevronRight, IconFlag, IconList, IconCheck, IconX } from '@tabler/icons-react'

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

// ── 시작 화면 ───────────────────────────────────────────────
function StartScreen({ exams, onStart, examResults, tab, onTabChange }) {
  const [selectedIdx, setSelectedIdx] = useState(-1)

  const examList = exams.filter(e => e.type !== 'collection')
  const collections = exams.filter(e => e.type === 'collection')
  const selected = selectedIdx >= 0 ? exams[selectedIdx] : null
  const isCol = selected?.type === 'collection'

  if (tab === 'history') {
    return (
      <Box style={{ minHeight: '100%', background: '#F4F6FB', padding: '24px 16px' }}>
        <Box style={{ maxWidth: 800, margin: '0 auto' }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <Box>
              <Text fw={800} size="xl" c="#111827" mb={2}>성적 기록</Text>
              <Text size="sm" c="#6b7280">{examResults?.length ?? 0}회 응시</Text>
            </Box>
            <button
              onClick={() => onTabChange('exam')}
              style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #2563eb', background: 'white', color: '#2563eb', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              시험 목록
            </button>
          </Box>
          {(!examResults || examResults.length === 0) ? (
            <Box style={{ background: 'white', borderRadius: 12, padding: '40px 20px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <Text c="#9ca3af" size="sm">아직 기록이 없습니다</Text>
            </Box>
          ) : (
            <Stack gap={10}>
              {examResults.map(r => {
                const pct = Math.round((r.correct / r.total) * 100)
                const passed = pct >= 60
                const date = new Date(r.date)
                const dateStr = `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
                return (
                  <Box
                    key={r.id}
                    style={{ background: 'white', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 16 }}
                  >
                    <Box style={{ width: 52, height: 52, borderRadius: 12, background: passed ? '#eff6ff' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Text fw={800} size="lg" c={passed ? '#2563eb' : '#dc2626'}>{pct}</Text>
                    </Box>
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text fw={700} size="sm" c="#111827" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.examName}
                      </Text>
                      <Text size="xs" c="#6b7280" mt={2}>{r.correct}/{r.total}문제 정답 · {dateStr}</Text>
                    </Box>
                    <Box style={{ padding: '4px 12px', borderRadius: 99, background: passed ? '#dcfce7' : '#fee2e2', flexShrink: 0 }}>
                      <Text size="xs" fw={700} c={passed ? '#16a34a' : '#dc2626'}>{passed ? '합격' : '불합격'}</Text>
                    </Box>
                  </Box>
                )
              })}
            </Stack>
          )}
        </Box>
      </Box>
    )
  }

  return (
    <Box style={{ minHeight: '100%', background: '#F4F6FB', padding: '24px 16px' }}>
      <Box style={{ maxWidth: 800, margin: '0 auto' }}>
        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text fw={800} size="xl" c="#111827">정보처리기사 필기</Text>
          <button
            onClick={() => onTabChange('history')}
            style={{ padding: '8px 18px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 14, fontWeight: 600, cursor: 'pointer', position: 'relative' }}
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

        {/* 시험 정보 + 시작 버튼 */}
        <Box
          style={{
            background: 'white',
            borderRadius: 12,
            padding: '18px 20px',
            marginBottom: 16,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <Box style={{ flex: 1, minWidth: 200 }}>
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
            onClick={() => selected && onStart(selectedIdx)}
            disabled={selectedIdx < 0}
            style={{
              padding: '12px 28px',
              background: selectedIdx < 0 ? '#d1d5db' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: selectedIdx < 0 ? 'not-allowed' : 'pointer',
              flexShrink: 0,
              alignSelf: 'center',
            }}
          >
            {isCol ? '학습 시작' : '시험 시작'}
          </button>
        </Box>

        {/* 목록 */}
        <Box
          style={{
            background: 'white',
            borderRadius: 12,
            padding: '20px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <Box style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {/* 기출문제 */}
            <Box style={{ flex: 1, minWidth: 200 }}>
              <Text size="xs" fw={700} c="#9ca3af" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                기출문제
              </Text>
              <Stack gap={8}>
                {examList.map(e => {
                  const idx = exams.indexOf(e)
                  const sel = selectedIdx === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedIdx(idx)}
                      style={{
                        padding: '12px 16px',
                        border: `2px solid ${sel ? '#2563eb' : '#e5e7eb'}`,
                        borderRadius: 10,
                        background: sel ? '#eff6ff' : 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 14,
                        fontWeight: 600,
                        color: sel ? '#2563eb' : '#374151',
                        transition: 'all 0.12s',
                      }}
                    >
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
                <Text size="xs" fw={700} c="#9ca3af" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                  문제 모음 (학습용)
                </Text>
                <Stack gap={8}>
                  {collections.map(e => {
                    const idx = exams.indexOf(e)
                    const sel = selectedIdx === idx
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedIdx(idx)}
                        style={{
                          padding: '12px 16px',
                          border: `2px solid ${sel ? '#2563eb' : '#e5e7eb'}`,
                          borderRadius: 10,
                          background: sel ? '#eff6ff' : 'white',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 14,
                          fontWeight: 600,
                          color: sel ? '#2563eb' : '#374151',
                          transition: 'all 0.12s',
                        }}
                      >
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
    </Box>
  )
}

// ── 문제 화면 ────────────────────────────────────────────────
function ExamScreen({ exam, onFinish, onBack, initialAnswers = {}, initialIdx = 0, reviewMode = false }) {
  const isCollection = exam.type === 'collection'
  const questions = exam.questions

  const [currentIdx, setCurrentIdx] = useState(initialIdx)
  const [userAnswers, setUserAnswers] = useState(initialAnswers)
  const [flags, setFlags] = useState(new Set())
  const [timeLeft, setTimeLeft] = useState(isCollection || reviewMode ? 0 : 150 * 60)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)

  const timerRef = useRef(null)

  useEffect(() => {
    if (isCollection || reviewMode || timeLeft === 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleSubmit()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [isCollection, reviewMode])

  function handleSubmit() {
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
  const h = Math.floor(timeLeft / 3600)
  const m = Math.floor((timeLeft % 3600) / 60)
  const s = timeLeft % 60
  const timerStr = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  const timerColor = timeLeft <= 60 ? '#dc2626' : timeLeft <= 300 ? '#d97706' : '#1f2937'

  const unanswered = questions.length - Object.keys(userAnswers).length

  return (
    <Box style={{ minHeight: '100vh', background: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
      {/* 헤더 */}
      <Box
        style={{
          background: reviewMode ? '#1f2937' : 'white',
          borderBottom: '1px solid #e5e7eb',
          padding: '0 16px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 60,
          zIndex: 10,
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          flexShrink: 0,
        }}
      >
        <Group gap={8}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}
          >
            <IconChevronLeft size={20} color={reviewMode ? 'white' : '#374151'} />
          </button>
          <Text fw={700} size="sm" c={reviewMode ? 'white' : '#1f2937'} style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {exam.name}
          </Text>
          {q?.subject && (
            <Badge size="xs" style={{ background: reviewMode ? 'rgba(255,255,255,0.15)' : '#eff6ff', color: reviewMode ? 'white' : '#2563eb', border: 'none' }}>
              {SUBJECT_SHORT[q.subject] || q.subject}
            </Badge>
          )}
        </Group>

        <Group gap={12}>
          <Text size="sm" c={reviewMode ? 'rgba(255,255,255,0.7)' : '#6b7280'}>
            <Text span fw={700} c={reviewMode ? 'white' : '#1f2937'}>{currentIdx + 1}</Text>
            {' '}/ {questions.length}
          </Text>
          {!isCollection && (
            <Text fw={700} size="sm" style={{ color: timerColor, fontVariantNumeric: 'tabular-nums', background: '#f3f4f6', padding: '3px 10px', borderRadius: 8 }}>
              {timerStr}
            </Text>
          )}
        </Group>

        <Group gap={8}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: reviewMode ? '#e5e7eb' : '#4b5563', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <IconList size={14} />
            목록
          </button>
          {!isCollection && !reviewMode && (
            <button
              onClick={() => setShowSubmitModal(true)}
              style={{ background: '#2563eb', border: 'none', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'white' }}
            >
              제출하기
            </button>
          )}
        </Group>
      </Box>

      {/* 검토 모드 배너 */}
      {reviewMode && (
        <Box style={{ background: '#fef3c7', borderBottom: '1px solid #fde68a', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <Text size="xs" fw={600} c="#92400e">📋 검토 모드 — 정답이 표시됩니다</Text>
        </Box>
      )}

      {/* 본문 */}
      <Box style={{ flex: 1, display: 'grid', gridTemplateColumns: sidebarOpen ? '1fr 220px' : '1fr', position: 'relative' }}>
        {/* 문제 영역 */}
        <Box style={{ padding: '20px 16px', overflowY: 'auto' }}>
          <Box style={{ maxWidth: 800, margin: '0 auto' }}>
            {/* 문제 카드 */}
            <Box style={{ background: 'white', borderRadius: 12, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12 }}>
              <Group align="flex-start" gap={12} mb={20} wrap="nowrap">
                <Box
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: '#2563eb', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 14, flexShrink: 0,
                  }}
                >
                  {q.number}
                </Box>
                <Text fw={600} size="sm" c="#1f2937" style={{ lineHeight: 1.7, flex: 1 }}>{q.question}</Text>
              </Group>

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
                      <span>{c}</span>
                    </button>
                  )
                })}
              </Stack>
            </Box>

            {/* 해설 */}
            {showAnswer && (
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
                  ? (q.answer > 0 ? `정답: ${q.answer}번${q.explanation ? ' — ' + q.explanation : ''}` : q.explanation || '(해설 없음)')
                  : userAnswers[currentIdx] === q.answer
                    ? `✓ 정답! (${q.answer}번)${q.explanation ? ' — ' + q.explanation : ''}`
                    : `✗ 오답 — 정답: ${q.answer}번 / 내 답: ${userAnswers[currentIdx] ? userAnswers[currentIdx] + '번' : '미응답'}${q.explanation ? ' — ' + q.explanation : ''}`
                }
              </Box>
            )}

            {/* 이전/다음 */}
            <Group justify="space-between" mt={16}>
              <button
                onClick={() => navigate(-1)}
                disabled={currentIdx === 0}
                style={{
                  padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db',
                  background: 'white', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 600, color: '#4b5563', opacity: currentIdx === 0 ? 0.4 : 1,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
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
                style={{
                  padding: '10px 20px', borderRadius: 8, border: '1px solid #d1d5db',
                  background: 'white', cursor: currentIdx === questions.length - 1 ? 'not-allowed' : 'pointer',
                  fontSize: 14, fontWeight: 600, color: '#4b5563', opacity: currentIdx === questions.length - 1 ? 0.4 : 1,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                다음 <IconChevronRight size={16} />
              </button>
            </Group>
          </Box>
        </Box>

        {/* 사이드바 */}
        {sidebarOpen && (
          <>
            <Box
              style={{
                background: 'white', borderLeft: '1px solid #e5e7eb',
                padding: '14px 12px', overflowY: 'auto', maxHeight: 'calc(100vh - 112px)', position: 'sticky', top: 112,
              }}
            >
              <Text size="xs" fw={700} c="#9ca3af" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
                문제 현황
              </Text>

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
          </>
        )}
      </Box>

      {/* 제출 모달 */}
      {showSubmitModal && (
        <Box style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box style={{ background: 'white', borderRadius: 16, padding: 32, maxWidth: 400, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
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
  if (isFlagged) { bg = '#fffbeb'; border = '#d97706'; color = '#d97706' }
  else if (isAnswered) { bg = '#2563eb'; border = '#2563eb'; color = 'white' }

  return (
    <button
      onClick={onClick}
      style={{
        aspectRatio: '1', borderRadius: 5, border: `1.5px solid ${border}`,
        background: bg, cursor: 'pointer', fontSize: 10, fontWeight: 600, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        outline: isCurrent ? '2.5px solid #2563eb' : 'none',
        outlineOffset: 2,
      }}
    >
      {label}
    </button>
  )
}

// ── 결과 화면 ────────────────────────────────────────────────
function ResultScreen({ result, onReview, onRetry }) {
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
    <Box style={{ minHeight: '100%', background: '#f3f4f6', padding: '24px 16px' }}>
      <Box style={{ maxWidth: 700, margin: '0 auto', background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
        {/* 헤더 */}
        <Box style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)', padding: '32px 24px', textAlign: 'center', color: 'white' }}>
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
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
            {[
              { val: correct, label: '정답', color: '#16a34a' },
              { val: wrong, label: '오답', color: '#dc2626' },
              { val: unanswered, label: '미응답', color: '#1f2937' },
            ].map(({ val, label, color }) => (
              <Box key={label} style={{ background: '#f9fafb', borderRadius: 10, padding: '16px', textAlign: 'center' }}>
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
                    <Box key={s} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Text size="xs" c="#4b5563" style={{ width: 90, flexShrink: 0 }}>{SUBJECT_SHORT[s] || s}</Text>
                      <Box style={{ flex: 1, background: '#f3f4f6', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                        <Box style={{ width: `${pct}%`, height: '100%', background: isFail ? '#dc2626' : '#2563eb', borderRadius: 99, transition: 'width 0.8s ease' }} />
                      </Box>
                      <Text size="xs" fw={700} c={isFail ? '#dc2626' : '#374151'} style={{ width: 70, textAlign: 'right', flexShrink: 0 }}>
                        {st.correct}/{st.total} ({pct}점)
                      </Text>
                    </Box>
                  )
                })}
              </Stack>
            </Box>
          )}

          <Group gap={10}>
            <button
              onClick={onReview}
              style={{ flex: 1, padding: '14px', borderRadius: 10, border: '2px solid #2563eb', background: 'white', color: '#2563eb', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              오답 검토
            </button>
            <button
              onClick={onRetry}
              style={{ flex: 1, padding: '14px', borderRadius: 10, border: 'none', background: '#2563eb', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}
            >
              다시 시작
            </button>
          </Group>
        </Box>
      </Box>
    </Box>
  )
}

// ── 메인 ─────────────────────────────────────────────────────
export default function EngineerExamView({ onSaveResult, examResults }) {
  const [exams, setExams] = useState(null)
  const [screen, setScreen] = useState('start') // 'start' | 'exam' | 'result' | 'review'
  const [tab, setTab] = useState('exam') // 'exam' | 'history'
  const [selectedExamIdx, setSelectedExamIdx] = useState(-1)
  const [examResult, setExamResult] = useState(null)

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'exam-questions.json')
      .then(r => r.json())
      .then(data => setExams(data.exams))
      .catch(() => setExams([]))
  }, [])

  if (!exams) {
    return <Center style={{ minHeight: 300 }}><Loader size="sm" /></Center>
  }

  if (exams.length === 0) {
    return <Center style={{ minHeight: 300 }}><Text c="dimmed">데이터를 불러올 수 없습니다.</Text></Center>
  }

  if (screen === 'exam') {
    return (
      <ExamScreen
        key="exam"
        exam={exams[selectedExamIdx]}
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
          })
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
    return (
      <ExamScreen
        key="review"
        exam={examResult.exam}
        reviewMode
        initialAnswers={examResult.userAnswers}
        initialIdx={wrongIdxs[0] ?? 0}
        onFinish={() => setScreen('result')}
        onBack={() => setScreen('result')}
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
          setScreen('review')
        }}
        onRetry={() => setScreen('start')}
      />
    )
  }

  return (
    <StartScreen
      exams={exams}
      onStart={idx => { setSelectedExamIdx(idx); setScreen('exam') }}
      examResults={examResults}
      tab={tab}
      onTabChange={setTab}
    />
  )
}
