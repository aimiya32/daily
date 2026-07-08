import { useState, useEffect } from 'react'
import { Stack, Group, Text, Paper, ActionIcon, Button, Checkbox, TextInput, Center, Chip, Modal } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import {
  IconChevronLeft, IconChevronRight, IconTrash, IconPlus,
  IconCalendarWeek, IconChecklist, IconClock,
} from '@tabler/icons-react'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import { WEEKDAYS_KO } from '../lib/dates'
import { getLunarLabel } from '../lib/lunar'
import { useCalendarMaxItems } from '../hooks/useCalendarMaxItems'
import { hexOf, DEFAULT_HEX } from '../lib/colors'
import CalendarGrid from './CalendarGrid'
import { DayPill, OverflowCount } from './DayPill'
import styles from './WorkDashboard.module.scss'

dayjs.locale('ko')

const FMT = 'YYYY-MM-DD'

// 업무 대시보드 홈: 월간 달력 / 주간 일정 / 오늘(선택일) 3패널 가로 배치
export default function WorkDashboard({
  todos, events, schedules, scheduleCategories, weekly, dateStr, onChangeDate,
  onAddTodo, onToggleTodo, onEditTodo, onDeleteTodo,
  onEditEvent, onDeleteEvent,
  onEditWeekly, onDeleteWeekly,
  onAddSchedule,
}) {
  // 카테고리 필터 (null = 전체) — 월간/주간/시간별 패널의 개인 일정 표시에 공통 적용
  const [filterCat, setFilterCat] = useState(null)

  return (
    <div className={styles.dashboardGrid}>
      <MonthPanel
        events={events}
        schedules={schedules}
        scheduleCategories={scheduleCategories}
        dateStr={dateStr}
        onChangeDate={onChangeDate}
        onAddSchedule={onAddSchedule}
        filterCat={filterCat}
        onChangeFilterCat={setFilterCat}
      />
      <WeekPanel
        events={events}
        schedules={schedules}
        scheduleCategories={scheduleCategories}
        weekly={weekly}
        dateStr={dateStr}
        onChangeDate={onChangeDate}
        onEditWeekly={onEditWeekly}
        onDeleteWeekly={onDeleteWeekly}
        filterCat={filterCat}
      />
      <DayPanel
        todos={todos}
        events={events}
        schedules={schedules}
        scheduleCategories={scheduleCategories}
        dateStr={dateStr}
        filterCat={filterCat}
        onAddTodo={onAddTodo}
        onToggleTodo={onToggleTodo}
        onEditTodo={onEditTodo}
        onDeleteTodo={onDeleteTodo}
        onEditEvent={onEditEvent}
        onDeleteEvent={onDeleteEvent}
      />
    </div>
  )
}

// 시간순 정렬용 비교: 시간 있는 것 먼저(시간순), 시간 없는 것은 뒤로
function compareSchedule(a, b) {
  if (a.time && b.time) return a.time.localeCompare(b.time)
  if (a.time) return -1
  if (b.time) return 1
  return 0
}

// ── 패널 1: 월간 달력 ─────────────────────────────────────
// 개인 모드에서 등록한 일정(schedules)을 읽기 전용으로 표시한다. '전체'/카테고리별 필터 지원.
function MonthPanel({ events, schedules, scheduleCategories, dateStr, onChangeDate, onAddSchedule, filterCat, onChangeFilterCat }) {
  // 표시 중인 달('YYYY-MM'). 선택 날짜가 다른 달로 바뀌면 그 달을 따라간다.
  const [viewMonth, setViewMonth] = useState(() => dayjs(dateStr).format('YYYY-MM'))
  useEffect(() => {
    setViewMonth(dayjs(dateStr).format('YYYY-MM'))
  }, [dateStr])

  const monthStart = dayjs(`${viewMonth}-01`)
  const today = dayjs().format(FMT)

  // 달력 셀당 표시할 일정 최대 개수 (개인 일정 달력과 동일한 반응형 기준)
  const maxItems = useCalendarMaxItems()

  // 시간별 일정이 있는 날짜 집합 (인디고 도트 표시용) — Todo는 달력에 표시하지 않는다
  const eventDates = new Set(events.map(x => x.date))

  // 카테고리 id → 색 이름 맵
  const catColor = new Map(scheduleCategories.map(c => [c.id, c.color]))

  // 필터 적용된 일정만 (시간 없는 일정만 — 시간 있는 일정은 DayPanel에서 표시)
  const filtered = schedules.filter(s => !s.time && (filterCat == null || s.categoryId === filterCat))

  // 날짜별 일정 맵 (셀 안 텍스트 표시용) — 시간순 정렬
  const scheduleByDate = new Map()
  filtered.forEach(s => {
    const arr = scheduleByDate.get(s.date) || []
    arr.push(s)
    scheduleByDate.set(s.date, arr)
  })
  scheduleByDate.forEach(arr => arr.sort(compareSchedule))

  // 달력 셀 내용: 업무 도트 + 카테고리 색 알약(개인 일정 달력과 동일한 패턴)
  function renderDayContent(ds) {
    const items = scheduleByDate.get(ds) || []
    const visible = items.slice(0, maxItems)
    const overflow = items.length - visible.length
    return (
      <Stack gap={2}>
        {eventDates.has(ds) && (
          <div className={styles.monthDotRow}><span className={styles.dot} /></div>
        )}
        {visible.map(s => (
          <DayPill key={s.id} hex={hexOf(catColor.get(s.categoryId)) ?? DEFAULT_HEX} fontSize="0.6875rem">
            {s.title}
          </DayPill>
        ))}
        <OverflowCount count={overflow} />
      </Stack>
    )
  }

  return (
    <Paper className={`${styles.panel} ${styles.monthPanel}`} p="md">
      {scheduleCategories.length > 0 && (
        <Chip.Group multiple={false} value={filterCat ?? 'all'} onChange={v => onChangeFilterCat(v === 'all' ? null : v)}>
          <div className={styles.filterBar}>
            <Chip value="all" size="xs" radius="xl" variant="light" color="indigo">전체</Chip>
            {scheduleCategories.map(c => (
              <Chip key={c.id} value={c.id} size="xs" radius="xl" variant="light" color={c.color}>{c.name}</Chip>
            ))}
          </div>
        </Chip.Group>
      )}

      <Group justify="space-between" mt={6} mb="md">
        <Text fw={700} className={styles.panelTitle}>{monthStart.format('YYYY년 M월')}</Text>
        <Group gap={4}>
          <ActionIcon variant="subtle" color="gray" radius="xl"
            onClick={() => setViewMonth(monthStart.subtract(1, 'month').format('YYYY-MM'))}>
            <IconChevronLeft size={18} />
          </ActionIcon>
          <ActionIcon variant="subtle" color="gray" radius="xl"
            onClick={() => setViewMonth(monthStart.add(1, 'month').format('YYYY-MM'))}>
            <IconChevronRight size={18} />
          </ActionIcon>
          <Button size="compact-xs" variant="light" color="indigo" radius="xl"
            onClick={() => { onChangeDate(today); setViewMonth(dayjs(today).format('YYYY-MM')) }}>
            오늘
          </Button>
          <Button size="compact-xs" variant="gradient" gradient={{ from: 'violet', to: 'grape' }} radius="xl"
            leftSection={<IconPlus size={12} />}
            onClick={onAddSchedule}>
            일정 추가
          </Button>
        </Group>
      </Group>

      <CalendarGrid
        current={monthStart}
        today={today}
        onSelectDate={onChangeDate}
        selectedDate={dateStr}
        standalone
        renderDayContent={renderDayContent}
      />
    </Paper>
  )
}

// ── 패널 2: 주간 일정 ─────────────────────────────────────
function WeekPanel({ events, schedules, scheduleCategories, weekly, dateStr, onChangeDate, onEditWeekly, onDeleteWeekly, filterCat }) {
  const base = dayjs(dateStr)
  // 카테고리 id → 색 이름 맵
  const catColor = new Map(scheduleCategories.map(c => [c.id, c.color]))
  // 월요일 시작 주
  const weekStart = base.subtract((base.day() + 6) % 7, 'day')
  const days = Array.from({ length: 7 }, (_, i) => weekStart.add(i, 'day'))
  const today = dayjs().format(FMT)

  return (
    <Paper className={styles.panel} p="md">
      <Group gap={8} mb="xs">
        <span className={styles.panelIcon} style={{ background: 'linear-gradient(135deg, #38BDF822, #38BDF810)' }}>
          <IconCalendarWeek size={17} color="#38BDF8" />
        </span>
        <Text fw={700} className={styles.panelTitle}>주간 일정</Text>
      </Group>
      <Stack gap={6}>
        {days.map(d => {
          const ds = d.format(FMT)
          const dayEvents = events
            .filter(e => e.date === ds)
            .sort((a, b) => a.time.localeCompare(b.time))
          // 등록순(오래된 것 위) 정렬: 데이터는 prepend라 배열은 최신이 앞 → 뒤집는다
          const dayWeekly = weekly.filter(w => w.date === ds).slice().reverse()
          // 개인 일정(읽기 전용, 시간 표기 없이 도트+제목만) — 카테고리 필터 적용, 시간 있는 것 먼저 시간순 정렬
          const daySchedules = schedules
            .filter(s => s.date === ds && (filterCat == null || s.categoryId === filterCat))
            .slice()
            .sort(compareSchedule)
          const isToday = ds === today
          const isSelected = ds === dateStr
          return (
            <div key={ds} className={`${styles.weekRow} ${isSelected ? styles.weekRowSelected : ''} ${isToday ? styles.weekRowToday : ''}`}>
              <div className={styles.weekRowTop}>
                <div
                  className={styles.weekRowMain}
                  role="button"
                  tabIndex={0}
                  onClick={() => onChangeDate(ds)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChangeDate(ds) } }}
                >
                  <div className={`${styles.weekLabel} ${d.day() === 0 ? styles.sunday : ''} ${d.day() === 6 ? styles.saturday : ''} ${isToday ? styles.weekLabelToday : ''}`}>
                    <span className={styles.weekLabelBadge}>
                      <Text size="sm" fw={600}>{d.date()}</Text>
                    </span>
                    <Text size="xs" c="dimmed">{WEEKDAYS_KO[d.day()]}</Text>
                  </div>
                  <div className={styles.weekEvents}>
                    {dayWeekly.length === 0 && daySchedules.length === 0 && dayEvents.length === 0 && (
                      <Text size="xs" c="dimmed">-</Text>
                    )}
                    {dayWeekly.map(w => (
                      <WeekWeeklyRow
                        key={w.id}
                        item={w}
                        onEdit={text => onEditWeekly(w, text)}
                        onDelete={() => onDeleteWeekly(w.id)}
                      />
                    ))}
                    {daySchedules.map(s => (
                      // 개인 일정: 카테고리 색 도트 + 제목 (시간 표기 없음, 읽기 전용)
                      <Group key={`s-${s.id}`} gap={6} wrap="nowrap" className={styles.weekWeeklyLine}>
                        <span
                          className={styles.catDot}
                          style={{ background: hexOf(catColor.get(s.categoryId)) ?? DEFAULT_HEX }}
                        />
                        <Text size="xs" className={styles.weekWeeklyText}>{s.title}</Text>
                      </Group>
                    ))}
                    {dayEvents.map(e => (
                      <Text key={e.id} size="xs" className={styles.weekEventLine}>
                        <b>{e.time}</b> {e.text}
                      </Text>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </Stack>
    </Paper>
  )
}

// ── 패널 3: 오늘(선택일) — Todo 카드, 시간별 일정 카드 ──────
function DayPanel({ todos, events, schedules, scheduleCategories, dateStr, filterCat, onAddTodo, onToggleTodo, onEditTodo, onDeleteTodo, onEditEvent, onDeleteEvent }) {
  const [todoInput, setTodoInput] = useState('')

  // 추가 입력용 모달 (+ 버튼으로 연다)
  const [todoModal, todoModalCtl] = useDisclosure(false)

  const dayTodos = todos.filter(t => t.date === dateStr)

  // 카테고리 id → 색 이름 맵
  const catColor = new Map(scheduleCategories.map(c => [c.id, c.color]))

  // 업무 이벤트(편집 가능)와 시간 있는 개인 일정(읽기 전용)을 시간순으로 병합
  const workItems = events
    .filter(e => e.date === dateStr)
    .map(e => ({ kind: 'event', time: e.time, data: e }))
  const personalItems = schedules
    .filter(s => s.date === dateStr && s.time && (filterCat == null || s.categoryId === filterCat))
    .map(s => ({ kind: 'schedule', time: s.time, data: s }))
  const dayItems = [...workItems, ...personalItems].sort((a, b) => a.time.localeCompare(b.time))

  // Todo 모달 열기: 입력값 초기화
  function openTodoModal() {
    setTodoInput('')
    todoModalCtl.open()
  }

  function handleAddTodo() {
    if (!todoInput.trim()) return
    onAddTodo(dateStr, todoInput)
    setTodoInput('')
    todoModalCtl.close()
  }

  return (
    <Stack gap="md">
      <Paper className={styles.panel} p="md">
        <Group justify="space-between" align="center" mb="xs">
          <Group gap={8}>
            <span className={styles.panelIcon} style={{ background: 'linear-gradient(135deg, #34D39922, #34D39910)' }}>
              <IconChecklist size={17} color="#34D399" />
            </span>
            <Text fw={700} className={styles.panelTitle}>Todo</Text>
          </Group>
          <Group gap={8}>
            <Text size="xs" c="dimmed">
              {dayjs(dateStr).format('M월 D일 ddd요일')} (음 {getLunarLabel(dayjs(dateStr).year(), dayjs(dateStr).month() + 1, dayjs(dateStr).date())})
            </Text>
            <ActionIcon variant="light" color="indigo" size="sm" radius="xl" onClick={openTodoModal}>
              <IconPlus size={16} />
            </ActionIcon>
          </Group>
        </Group>
        <Stack gap={6}>
          {dayTodos.length === 0 && (
            <Center>
              <Stack align="center" gap={4} py="md">
                <IconChecklist size={22} color="#cbd5e1" />
                <Text size="sm" c="dimmed">할 일이 없어요.</Text>
              </Stack>
            </Center>
          )}
          {dayTodos.map(it => (
            <TodoRow
              key={it.id}
              item={it}
              onToggle={() => onToggleTodo(it)}
              onEdit={text => onEditTodo(it, text)}
              onDelete={() => onDeleteTodo(it.id)}
            />
          ))}
        </Stack>
      </Paper>

      <Paper className={styles.panel} p="md">
        <Group justify="space-between" align="center" mb="xs">
          <Group gap={8}>
            <span className={styles.panelIcon} style={{ background: 'linear-gradient(135deg, #FB923C22, #FB923C10)' }}>
              <IconClock size={17} color="#FB923C" />
            </span>
            <Text fw={700} className={styles.panelTitle}>시간별 일정</Text>
          </Group>
        </Group>
        <Stack gap={6}>
          {dayItems.length === 0 && (
            <Center>
              <Stack align="center" gap={4} py="md">
                <IconClock size={22} color="#cbd5e1" />
                <Text size="sm" c="dimmed">일정이 없어요.</Text>
              </Stack>
            </Center>
          )}
          {dayItems.map(item => (
            item.kind === 'event' ? (
              <EventRow
                key={`e-${item.data.id}`}
                item={item.data}
                onEdit={text => onEditEvent(item.data, text)}
                onDelete={() => onDeleteEvent(item.data.id)}
              />
            ) : (
              // 개인 일정: 카테고리 도트 + 시간 + 제목 (읽기 전용)
              <Group key={`s-${item.data.id}`} gap="xs" wrap="nowrap" className={styles.eventRow}>
                <span
                  className={styles.catDot}
                  style={{ background: hexOf(catColor.get(item.data.categoryId)) ?? DEFAULT_HEX }}
                />
                <Text size="sm" fw={700} c="indigo" w={42} style={{ flexShrink: 0 }}>{item.data.time}</Text>
                <Text size="sm" style={{ flex: 1, minWidth: 0 }} truncate>{item.data.title}</Text>
              </Group>
            )
          ))}
        </Stack>
      </Paper>

      {/* 할 일 추가 모달 */}
      <Modal opened={todoModal} onClose={todoModalCtl.close} title="할 일 추가" radius="md" centered>
        <Stack gap="sm">
          <TextInput
            autoFocus
            size="sm"
            variant="filled"
            radius="md"
            placeholder="할 일 입력"
            value={todoInput}
            onChange={e => setTodoInput(e.currentTarget.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddTodo()}
          />
          <Button color="indigo" radius="md" onClick={handleAddTodo} disabled={!todoInput.trim()}>추가</Button>
        </Stack>
      </Modal>
    </Stack>
  )
}

// 투두 한 줄: 체크박스 + 인라인 텍스트 편집 + 삭제
function TodoRow({ item, onToggle, onEdit, onDelete }) {
  const [value, setValue] = useState(item.text)

  function commit() {
    if (value !== item.text) onEdit(value)
  }

  return (
    <Group gap="xs" wrap="nowrap" className={styles.todoRow}>
      <Checkbox checked={item.done} onChange={onToggle} color="indigo" radius="xl" />
      <TextInput
        value={value}
        onChange={e => setValue(e.currentTarget.value)}
        onBlur={commit}
        onKeyDown={e => e.key === 'Enter' && (commit(), e.currentTarget.blur())}
        variant="unstyled"
        style={{ flex: 1 }}
        styles={{
          input: item.done
            ? { textDecoration: 'line-through', color: 'var(--mantine-color-dimmed)' }
            : undefined,
        }}
      />
      <ActionIcon variant="subtle" color="red" className={styles.rowDeleteBtn} onClick={onDelete}>
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  )
}

// 일정 한 줄: 시간 라벨(있으면) + 인라인 텍스트 편집 + 삭제. 시간별 일정과 월간 일정 공용.
function EventRow({ item, onEdit, onDelete }) {
  const [value, setValue] = useState(item.text)

  function commit() {
    if (value !== item.text) onEdit(value)
  }

  return (
    <Group gap="xs" wrap="nowrap" className={styles.eventRow}>
      {item.time && (
        <Text size="sm" fw={700} c="indigo" w={42} style={{ flexShrink: 0 }}>{item.time}</Text>
      )}
      <TextInput
        value={value}
        onChange={e => setValue(e.currentTarget.value)}
        onBlur={commit}
        onKeyDown={e => e.key === 'Enter' && (commit(), e.currentTarget.blur())}
        variant="unstyled"
        style={{ flex: 1 }}
      />
      <ActionIcon variant="subtle" color="red" className={styles.rowDeleteBtn} onClick={onDelete}>
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  )
}

// 주간 일정 한 줄(요일 행 안): 표시/인라인 편집 토글 + 항상 노출되는 삭제 아이콘
function WeekWeeklyRow({ item, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(item.text)

  function commit() {
    setEditing(false)
    const t = value.trim()
    if (t && t !== item.text) onEdit(t)
    else setValue(item.text)
  }

  if (editing) {
    return (
      <TextInput
        autoFocus
        size="xs"
        className={styles.weekWeeklyEditInput}
        value={value}
        onChange={e => setValue(e.currentTarget.value)}
        onClick={e => e.stopPropagation()}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.stopPropagation(); commit() }
          if (e.key === 'Escape') { e.stopPropagation(); setValue(item.text); setEditing(false) }
        }}
      />
    )
  }

  return (
    <Group gap={4} wrap="nowrap" className={styles.weekWeeklyLine}>
      <Text
        size="xs"
        className={styles.weekWeeklyText}
        role="button"
        tabIndex={0}
        onClick={e => { e.stopPropagation(); setEditing(true) }}
        onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); setEditing(true) } }}
      >
        <span className={styles.weeklyBullet}>•</span> {item.text}
      </Text>
      <ActionIcon
        variant="subtle"
        color="red"
        size="xs"
        onClick={e => { e.stopPropagation(); onDelete() }}
      >
        <IconTrash size={12} />
      </ActionIcon>
    </Group>
  )
}
