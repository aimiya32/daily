import { useState, useEffect } from 'react'
import { Stack, Group, Text, Paper, ActionIcon, Button, Checkbox, TextInput, Textarea, Center, Select, Modal, Tooltip } from '@mantine/core'
import { useDisclosure, useClickOutside } from '@mantine/hooks'
import {
  IconChevronLeft, IconChevronRight, IconTrash, IconPlus,
  IconChecklist, IconClock,
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
    // 690px 이상에서는 모바일 1열로 접지 않고 3열을 유지 → 폭이 모자라면 이 래퍼가 가로 스크롤된다
    <div className={styles.dashboardScroll}>
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
      <Group justify="flex-end" align="center" gap={8} mt={6} mb="sm" wrap="nowrap">
        <Select
          size="xs"
          radius="xl"
          allowDeselect={false}
          w={130}
          data={[{ value: 'all', label: '전체' }, ...scheduleCategories.map(c => ({ value: c.id, label: c.name }))]}
          value={filterCat ?? 'all'}
          onChange={v => onChangeFilterCat(v === 'all' ? null : v)}
        />
        {/* 크기 30 = Select size="xs"의 입력 높이 */}
        <ActionIcon variant="light" color="indigo" size={30} radius="xl" onClick={onAddSchedule}>
          <IconPlus size={16} />
        </ActionIcon>
      </Group>

      <Group justify="space-between" align="center" mb="md" wrap="nowrap">
        <Group gap={6} wrap="nowrap">
          <ActionIcon variant="subtle" color="gray" radius="xl"
            onClick={() => setViewMonth(monthStart.subtract(1, 'month').format('YYYY-MM'))}>
            <IconChevronLeft size={18} />
          </ActionIcon>
          <Text fw={700} className={styles.panelTitle}>{monthStart.format('YYYY년 M월')}</Text>
          <ActionIcon variant="subtle" color="gray" radius="xl"
            onClick={() => setViewMonth(monthStart.add(1, 'month').format('YYYY-MM'))}>
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>
        <Group gap={8} wrap="nowrap">
          <Button size="compact-xs" variant="light" color="indigo" radius="xl"
            onClick={() => { onChangeDate(today); setViewMonth(dayjs(today).format('YYYY-MM')) }}>
            오늘
          </Button>
          <Text size="xs" c="dimmed">
            {dayjs(dateStr).format('M월 D일 ddd요일')} (음 {getLunarLabel(dayjs(dateStr).year(), dayjs(dateStr).month() + 1, dayjs(dateStr).date())})
          </Text>
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
        <span className={styles.titleBar} />
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

  // 상세 툴팁이 열린 개인 일정 id (한 번에 하나만 열린다)
  const [openedDescId, setOpenedDescId] = useState(null)
  // 시간별 일정 카드 바깥을 클릭하면 열린 툴팁을 닫는다
  const eventsCardRef = useClickOutside(() => setOpenedDescId(null))

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
      <Paper ref={eventsCardRef} className={styles.panel} p="md">
        <Group gap={8} mb="xs">
          <span className={styles.titleBar} />
          <Text fw={700} className={styles.panelTitle}>시간별 일정</Text>
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
              <ScheduleRow
                key={`s-${item.data.id}`}
                item={item.data}
                catColor={catColor}
                opened={openedDescId === item.data.id}
                onToggle={() => setOpenedDescId(id => (id === item.data.id ? null : item.data.id))}
              />
            )
          ))}
        </Stack>
      </Paper>

      <Paper className={styles.panel} p="md">
        <Group justify="space-between" align="center" mb="xs">
          <Group gap={8}>
            <span className={styles.titleBar} />
            <Text fw={700} className={styles.panelTitle}>Todo</Text>
          </Group>
          <ActionIcon variant="light" color="indigo" size="sm" radius="xl" onClick={openTodoModal}>
            <IconPlus size={16} />
          </ActionIcon>
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
              onDelete={() => onDeleteTodo(it.id)}
            />
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
            onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) handleAddTodo() }}
          />
          <Button color="indigo" radius="md" onClick={handleAddTodo} disabled={!todoInput.trim()}>추가</Button>
        </Stack>
      </Modal>
    </Stack>
  )
}

// 투두 한 줄: 체크박스 + 텍스트(클릭 시 완료 토글) + 삭제. 긴 텍스트는 줄바꿈.
function TodoRow({ item, onToggle, onDelete }) {
  return (
    <Group gap="xs" wrap="nowrap" align="flex-start" className={styles.todoRow}>
      <Checkbox checked={item.done} onChange={onToggle} color="indigo" radius="xl" style={{ marginTop: 5, '--checkbox-size': '0.9rem' }} />
      <Text
        size="sm"
        onClick={onToggle}
        style={{
          flex: 1,
          minWidth: 0,
          cursor: 'pointer',
          lineHeight: '22px',
          wordBreak: 'break-word',
          ...(item.done
            ? { textDecoration: 'line-through', color: 'var(--mantine-color-dimmed)' }
            : {}),
        }}
      >
        {item.text}
      </Text>
      <ActionIcon variant="subtle" color="red" className={styles.rowDeleteBtn} onClick={onDelete} style={{ alignSelf: 'flex-start' }}>
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
    <Group gap="xs" wrap="nowrap" align="flex-start" className={styles.eventRow}>
      {item.time && (
        <Text size="sm" fw={700} c="indigo" w={42} className={styles.eventRowTime}>{item.time}</Text>
      )}
      {/* 긴 텍스트가 줄바꿈되도록 TextInput 대신 autosize Textarea 사용 (Enter는 줄바꿈이 아니라 저장) */}
      <Textarea
        autosize
        minRows={1}
        value={value}
        onChange={e => setValue(e.currentTarget.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit()
            e.currentTarget.blur()
          }
        }}
        variant="unstyled"
        size="sm"
        style={{ flex: 1, minWidth: 0 }}
        classNames={{ input: styles.eventRowInput }}
      />
      <ActionIcon variant="subtle" color="red" className={styles.rowDeleteBtn} onClick={onDelete}>
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  )
}

// 개인 일정 한 줄(시간별 일정 카드): 카테고리 도트 + 시간 + 제목 (읽기 전용). description이 있으면 클릭 시 툴팁으로 상세 내용 표시.
function ScheduleRow({ item, catColor, opened, onToggle }) {
  const desc = item.description
  const row = (
    <Group gap="xs" wrap="nowrap" align="flex-start" className={styles.eventRow}
      onClick={() => desc && onToggle()}
      style={desc ? { cursor: 'pointer' } : undefined}>
      <span className={`${styles.catDot} ${styles.eventRowDot}`} style={{ background: hexOf(catColor.get(item.categoryId)) ?? DEFAULT_HEX }} />
      <Text size="sm" fw={700} c="indigo" w={42} className={styles.eventRowTime}>{item.time}</Text>
      <Text size="sm" className={styles.eventRowText}>{item.title}</Text>
    </Group>
  )
  if (!desc) return row
  return (
    <Tooltip label={desc} opened={opened} multiline maw={280} position="bottom-start"
      offset={{ mainAxis: 5, crossAxis: 20 }}
      styles={{ tooltip: { whiteSpace: 'pre-wrap' } }}>
      {row}
    </Tooltip>
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
