import { useState } from 'react'
import {
  Stack, Group, Text, Box, Paper, NumberInput, Progress, Center,
  Popover, Button, Select, SegmentedControl,
} from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { IconChevronDown, IconCalendarPlus } from '@tabler/icons-react'
import CalendarNav from './CalendarNav'
import CalendarGrid from './CalendarGrid'
import TrackerBulkPlan from './TrackerBulkPlan'
import { TCAT_COLORS } from '../hooks/useTrackerCategories'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'

dayjs.locale('ko')

function hexOf(cat) {
  return TCAT_COLORS.find(c => c.name === cat.color)?.hex ?? '#4F46E5'
}

const PLAN_COLOR = '#94A3B8'   // 계획
const ACTUAL_COLOR = '#4F46E5' // 실제

function fmt(n) {
  if (n === null || n === undefined || n === '') return 0
  return Math.round(n * 100) / 100
}

export default function TrackerView({ categories, logs, getLog, setLog, bulkSetPlanned }) {
  const [mode, setMode] = useState('calendar') // calendar | summary
  const [day, setDay] = useState(dayjs())
  const [month, setMonth] = useState(dayjs().startOf('month'))
  const [catId, setCatId] = useState(categories[0]?.id ?? null)
  const [calMode, setCalMode] = useState('all') // all | plan | actual (달력 표시 모드)
  const [bulkOpened, { open: openBulk, close: closeBulk }] = useDisclosure(false)

  const selectedId = categories.some(c => c.id === catId) ? catId : categories[0]?.id
  const selectedCat = categories.find(c => c.id === selectedId)

  // [start, end] 범위 내 합계
  function sumRange(categoryId, start, end) {
    let planned = 0, actual = 0
    for (const l of logs) {
      if (l.categoryId !== categoryId) continue
      if (l.date < start || l.date > end) continue
      planned += Number(l.planned) || 0
      actual += Number(l.actual) || 0
    }
    return { planned, actual }
  }

  if (categories.length === 0) {
    return (
      <Center py={60}>
        <Stack align="center" gap={6}>
          <Text c="dimmed">목표 카테고리가 없어요.</Text>
          <Text size="sm" c="dimmed">오른쪽 위 카테고리 버튼으로 추가해보세요. (예: 달리기 / km)</Text>
        </Stack>
      </Center>
    )
  }

  return (
    <Stack maw={760} mx="auto" gap="md">
      <Group justify="space-between">
        <SegmentedControl
          value={mode}
          onChange={setMode}
          data={[
            { label: '달력', value: 'calendar' },
            { label: '월별 합계', value: 'summary' },
          ]}
        />
        <Button
          variant="light" color="indigo" radius="xl" size="xs"
          leftSection={<IconCalendarPlus size={15} />}
          onClick={openBulk}
        >
          일괄 계획 입력
        </Button>
      </Group>

      {mode === 'calendar' && (
        <Stack gap="xl">
          <DailyView
            categories={categories} day={day} setDay={setDay}
            getLog={getLog} setLog={setLog}
            selectedId={selectedId} setCatId={setCatId}
          />
          <Stack gap="sm">
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <SegmentedControl
                value={calMode}
                onChange={(v) => v && setCalMode(v)}
                data={[
                  { label: '전체', value: 'all' },
                  { label: '계획', value: 'plan' },
                  { label: '실제', value: 'actual' },
                ]}
              />
              <MonthTotals cat={selectedCat} month={month} sumRange={sumRange} />
            </Group>
            <CalendarView
              cat={selectedCat} logs={logs} month={month} setMonth={setMonth}
              calMode={calMode}
              onSelectDate={(dateStr) => setDay(dayjs(dateStr))}
            />
          </Stack>
        </Stack>
      )}

      {mode === 'summary' && (
        <MonthlySummary
          categories={categories} month={month} setMonth={setMonth} sumRange={sumRange}
        />
      )}

      <TrackerBulkPlan
        opened={bulkOpened}
        onClose={closeBulk}
        categories={categories}
        initialMonth={month}
        bulkSetPlanned={bulkSetPlanned}
      />
    </Stack>
  )
}

// ── 일별 입력 ──────────────────────────────────────────
function DailyView({ categories, day, setDay, getLog, setLog, selectedId, setCatId }) {
  const dateStr = day.format('YYYY-MM-DD')
  const [picker, { toggle: togglePicker, close: closePicker }] = useDisclosure(false)
  const isNarrow = useMediaQuery('(max-width: 500px)')
  const radius = 14

  const cat = categories.find(c => c.id === selectedId)
  const log = cat ? getLog(cat.id, dateStr) : null
  const hex = cat ? hexOf(cat) : '#4F46E5'
  const achieved = log?.planned ? Math.round((Number(log.actual) || 0) / Number(log.planned) * 100) : null

  return (
    <Stack gap={0}>
      <Paper
        px={isNarrow ? 'sm' : 'lg'} py="md"
        style={{
          borderRadius: `${radius}px ${radius}px 0 0`, background: 'white',
          boxShadow: '0 -1px 0 #E2E8F0 inset', border: '1px solid #E2E8F0', borderBottom: 'none',
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', minHeight: 30 }}>
          {/* 날짜: 좌측 정렬, 화살표(▾)와 한 줄 */}
          <Popover opened={picker} onChange={(o) => !o && closePicker()} position="bottom-start" shadow="md" withArrow>
            <Popover.Target>
              <Group gap={4} align="center" wrap="nowrap" style={{ cursor: 'pointer' }} onClick={togglePicker}>
                <Text fw={700} size="md" style={{ whiteSpace: 'nowrap' }}>{day.format('YYYY년 M월 D일 (ddd)')}</Text>
                <IconChevronDown size={15} color="var(--mantine-color-gray-6)" />
              </Group>
            </Popover.Target>
            <Popover.Dropdown>
              <DatePicker
                value={day.toDate()}
                onChange={(v) => { if (v) { setDay(dayjs(v)); closePicker() } }}
                locale="ko"
              />
            </Popover.Dropdown>
          </Popover>
          {/* 오늘: 최우측 */}
          <Group gap="xs" wrap="nowrap" style={{ marginLeft: 'auto', zIndex: 1 }}>
            <Button size="xs" variant="light" color="indigo" radius="xl" onClick={() => setDay(dayjs())}>오늘</Button>
          </Group>
        </Box>
      </Paper>

      <Paper p="md" style={{ border: '1px solid #E2E8F0', borderTop: 'none', borderRadius: `0 0 ${radius}px ${radius}px`, background: 'white' }}>
        <Stack gap="sm">
          <Select
            label="카테고리"
            data={categories.map(c => ({ value: c.id, label: c.unit ? `${c.name} (${c.unit})` : c.name }))}
            value={selectedId}
            onChange={setCatId}
            allowDeselect={false}
            size="sm"
          />
          {cat && (
            <Paper p="sm" radius="md" style={{ border: `1px solid ${hex}22`, background: hex + '08' }}>
              {achieved !== null && (
                <Group justify="flex-end" mb={8}>
                  <Text size="xs" fw={700} style={{ color: hex }}>달성 {achieved}%</Text>
                </Group>
              )}
              <Group grow gap="sm">
                <NumberInput
                  label="계획"
                  placeholder="0"
                  value={log?.planned ?? ''}
                  onChange={v => setLog(cat.id, dateStr, { planned: v === '' ? null : v })}
                  min={0}
                  hideControls
                  suffix={cat.unit ? ` ${cat.unit}` : ''}
                  size="sm"
                />
                <NumberInput
                  label="실제"
                  placeholder="0"
                  value={log?.actual ?? ''}
                  onChange={v => setLog(cat.id, dateStr, { actual: v === '' ? null : v })}
                  min={0}
                  hideControls
                  suffix={cat.unit ? ` ${cat.unit}` : ''}
                  size="sm"
                />
              </Group>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Stack>
  )
}

// ── 카테고리별 합계 카드 ────────────────────────────────
function StatCard({ cat, planned, actual, breakdown }) {
  const hex = hexOf(cat)
  const pct = planned > 0 ? Math.round(actual / planned * 100) : null
  return (
    <Paper p="md" radius="md" style={{ border: `1px solid ${hex}22`, background: 'white' }}>
      <Group justify="space-between" mb={6}>
        <Group gap={8}>
          <Box style={{ width: 12, height: 12, borderRadius: '50%', background: hex }} />
          <Text fw={700} c="#1E293B">{cat.name}</Text>
          {cat.unit && <Text size="xs" c="dimmed">({cat.unit})</Text>}
        </Group>
        {pct !== null && <Text fw={800} style={{ color: hex }}>{pct}%</Text>}
      </Group>
      <Group gap="xl" mb={pct !== null ? 8 : 0}>
        <Text size="sm" c="dimmed">계획 <Text span fw={700} c="#334155">{fmt(planned)}</Text> {cat.unit}</Text>
        <Text size="sm" c="dimmed">실제 <Text span fw={700} style={{ color: hex }}>{fmt(actual)}</Text> {cat.unit}</Text>
      </Group>
      {pct !== null && <Progress value={Math.min(pct, 100)} color={cat.color} radius="xl" size="sm" />}
      {breakdown && breakdown.length > 0 && (
        <Stack gap={4} mt={10}>
          {breakdown.map((b, i) => (
            <Group key={i} justify="space-between">
              <Text size="xs" c="dimmed">{b.label}</Text>
              <Text size="xs" c="#475569">
                {fmt(b.actual)} / {fmt(b.planned)} {cat.unit}
                {b.planned > 0 && <Text span c="dimmed"> ({Math.round(b.actual / b.planned * 100)}%)</Text>}
              </Text>
            </Group>
          ))}
        </Stack>
      )}
    </Paper>
  )
}

// ── 월별 합계 (주차별 분해 포함) ─────────────────────────
function MonthlySummary({ categories, month, setMonth, sumRange }) {
  const monthStart = month.startOf('month')
  const monthEnd = month.endOf('month')

  // 이 달과 겹치는 주(일~토) 목록 — 이번 달 범위(1일~말일)로 잘라서 합산
  const weeks = []
  let cursor = monthStart.startOf('week')
  let n = 1
  while (cursor.isBefore(monthEnd) || cursor.isSame(monthEnd, 'day')) {
    const wStart = cursor.isBefore(monthStart) ? monthStart : cursor
    const rawEnd = cursor.add(6, 'day')
    const wEnd = rawEnd.isAfter(monthEnd) ? monthEnd : rawEnd
    weeks.push({
      label: `${n}주 (${wStart.format('M.D')}–${wEnd.format('M.D')})`,
      start: wStart.format('YYYY-MM-DD'),
      end: wEnd.format('YYYY-MM-DD'),
    })
    cursor = cursor.add(1, 'week')
    n += 1
  }

  return (
    <Stack gap="md">
      <CalendarNav
        title={month.format('YYYY년 M월')}
        monthValue={month.toDate()}
        onMonthSelect={(v) => setMonth(dayjs(v).startOf('month'))}
        onToday={() => setMonth(dayjs().startOf('month'))}
      />
      <Stack gap="sm">
        {categories.map(cat => {
          const { planned, actual } = sumRange(cat.id, monthStart.format('YYYY-MM-DD'), monthEnd.format('YYYY-MM-DD'))
          const breakdown = weeks.map(w => ({ label: w.label, ...sumRange(cat.id, w.start, w.end) }))
          return <StatCard key={cat.id} cat={cat} planned={planned} actual={actual} breakdown={breakdown} />
        })}
      </Stack>
    </Stack>
  )
}

// ── 달력 위 월 합계 (선택 카테고리, 계획/실제 한 줄) ──────
function MonthTotals({ cat, month, sumRange }) {
  if (!cat) return null
  const start = month.startOf('month').format('YYYY-MM-DD')
  const end = month.endOf('month').format('YYYY-MM-DD')
  const { planned, actual } = sumRange(cat.id, start, end)
  const pct = planned > 0 ? Math.round(actual / planned * 100) : null
  return (
    <Group gap={6} wrap="wrap">
      <Box style={{ width: 9, height: 9, borderRadius: '50%', background: PLAN_COLOR, flexShrink: 0 }} />
      <Text size="sm" c="dimmed">계획 <Text span fw={700} c="#334155">{fmt(planned)}{cat.unit ? ` ${cat.unit}` : ''}</Text></Text>
      <Text size="sm" c="dimmed">/</Text>
      <Box style={{ width: 9, height: 9, borderRadius: '50%', background: ACTUAL_COLOR, flexShrink: 0 }} />
      <Text size="sm" c="dimmed">실제 <Text span fw={700} style={{ color: ACTUAL_COLOR }}>{fmt(actual)}{cat.unit ? ` ${cat.unit}` : ''}</Text></Text>
      {pct !== null && <Text size="sm" c="dimmed">({pct}%)</Text>}
    </Group>
  )
}

// ── 달력 보기 (선택 카테고리, 계획/실제를 칸으로) ──────────
function CalendarView({ cat, logs, month, setMonth, calMode, onSelectDate }) {
  const today = dayjs().format('YYYY-MM-DD')
  const isNarrow = useMediaQuery('(max-width: 500px)')
  const unit = (cat?.unit && !isNarrow) ? cat.unit : ''  // 500px 이하에선 달력 칸 단위 생략
  const showPlan = calMode === 'all' || calMode === 'plan'
  const showActual = calMode === 'all' || calMode === 'actual'

  // 선택 카테고리의 날짜별 로그
  const byDate = {}
  if (cat) {
    for (const l of logs) {
      if (l.categoryId === cat.id) byDate[l.date] = l
    }
  }

  function slot(color, value) {
    if (value == null) return null
    return (
      <Box style={{
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: color + '22', borderRadius: 5, padding: '2px 4px',
      }}>
        <Text style={{ fontSize: '0.78rem', fontWeight: 700, color, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {fmt(value)}{unit}
        </Text>
      </Box>
    )
  }

  function renderDayContent(dateStr) {
    const log = byDate[dateStr]
    if (!log) return null
    return (
      <Stack gap={2}>
        {showActual && slot(ACTUAL_COLOR, log.actual)}
        {showPlan && slot(PLAN_COLOR, log.planned)}
      </Stack>
    )
  }

  return (
    <Stack gap={0}>
      <CalendarNav
        title={month.format('YYYY년 M월')}
        monthValue={month.toDate()}
        onMonthSelect={(v) => setMonth(dayjs(v).startOf('month'))}
        onToday={() => setMonth(dayjs().startOf('month'))}
      />
      <CalendarGrid
        current={month}
        today={today}
        onSelectDate={onSelectDate}
        renderDayContent={renderDayContent}
        hideToday
      />
    </Stack>
  )
}
