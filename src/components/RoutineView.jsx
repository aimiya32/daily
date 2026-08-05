import { useState, useEffect } from 'react'
import {
  Stack, Group, Text, ActionIcon, Checkbox, TextInput,
  Switch, SegmentedControl, Badge, Drawer,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus, IconCheck } from '@tabler/icons-react'
import { useCalendarMaxItems } from '../hooks/useCalendarMaxItems'
import { useMonthCursor, useWeekCursor, useDayCursor } from '../hooks/useCalendarCursor'
import CalendarGrid from './CalendarGrid'
import WeekGrid from './WeekGrid'
import CalendarNav from './CalendarNav'
import DatePopoverTitle from './DatePopoverTitle'
import { DayPill, OverflowCount } from './DayPill'
import { todayStr } from '../lib/dates'
import dayjs from 'dayjs'
import styles from './RoutineView.module.scss'

export default function RoutineView({ routines, isChecked, toggle, getCheckedRoutineIds, addRoutine, updateRoutine, toggleVisible, onExposeOpen }) {
  const [calView, setCalView] = useState('month') // month | week
  const [current, setCurrent] = useMonthCursor()
  const [currentWeek, setCurrentWeek] = useWeekCursor()
  const [selectedDay, setSelectedDay] = useDayCursor()
  const selectedDate = selectedDay.format('YYYY-MM-DD')
  const setSelectedDate = (s) => setSelectedDay(dayjs(s))
  const [mode, setMode] = useState('check')
  const [newName, setNewName] = useState('')
  const [editNames, setEditNames] = useState({})
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)

  useEffect(() => {
    onExposeOpen?.(openDrawer)
  }, [openDrawer, onExposeOpen])

  const maxItems = useCalendarMaxItems()

  const today = todayStr()
  const visibleRoutines = routines.filter(r => r.visible)

  function handleEditSave(id) {
    const name = editNames[id]
    if (name?.trim()) updateRoutine(id, name)
    setEditNames(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  function goToday() {
    setCurrent(dayjs().startOf('month'))
    setCurrentWeek(dayjs().startOf('week'))
    setSelectedDate(today)
  }

  // 달력에서 날짜 클릭 → 선택 후 우측 드로어 열기
  function selectAndOpen(dateStr) {
    setSelectedDate(dateStr)
    openDrawer()
  }

  // ── 주간 ────────────────────────────────────────────
  const weekDays = Array.from({ length: 7 }, (_, i) => currentWeek.add(i, 'day'))

  // ── 루틴 배지 헬퍼 ──────────────────────────────────
  function CheckedBadges({ dateStr }) {
    const ids = getCheckedRoutineIds(dateStr).filter(id => routines.find(r => r.id === id)?.visible)
    if (ids.length === 0) return <Text size="xs" c="dimmed">-</Text>
    return (
      <>
        {ids.map(id => {
          const r = routines.find(rt => rt.id === id)
          return r ? (
            <Badge key={id} size="lg" variant="light" color="indigo" radius="xl">{r.name}</Badge>
          ) : null
        })}
      </>
    )
  }

  // ── 월간 달력 ────────────────────────────────────────
  function MonthCalendar() {
    function renderDayContent(dateStr) {
      const checkedIds = getCheckedRoutineIds(dateStr).filter(id => routines.find(r => r.id === id)?.visible)
      const visible = checkedIds.slice(0, maxItems)
      const overflow = checkedIds.length - visible.length
      return (
        <Stack gap={2}>
          {visible.map(id => {
            const r = routines.find(rt => rt.id === id)
            return r ? <DayPill key={id}>{r.name}</DayPill> : null
          })}
          <OverflowCount count={overflow} />
        </Stack>
      )
    }

    return (
      <Stack gap={0}>
        <CalendarNav
          title={current.format('YYYY년 M월')}
          monthValue={current.toDate()}
          onMonthSelect={(v) => setCurrent(dayjs(v).startOf('month'))}
          onToday={goToday}
        />
        <CalendarGrid
          current={current}
          today={today}
          onSelectDate={selectAndOpen}
          renderDayContent={renderDayContent}
        />
      </Stack>
    )
  }

  // ── 주간 뷰 (세로) ───────────────────────────────────
  function WeekCalendar() {
    return (
      <Stack gap={0}>
        <CalendarNav
          title={`${currentWeek.format('M월 D일')} – ${currentWeek.add(6, 'day').format('M월 D일')}`}
          onPrev={() => setCurrentWeek(w => w.subtract(1, 'week'))}
          onNext={() => setCurrentWeek(w => w.add(1, 'week'))}
          onToday={goToday}
        />
        <WeekGrid
          weekDays={weekDays}
          today={today}
          selectedDate={selectedDate}
          onSelectDate={selectAndOpen}
          renderDayContent={dateStr => (
            <Group gap={6} wrap="wrap">
              <CheckedBadges dateStr={dateStr} />
            </Group>
          )}
        />
      </Stack>
    )
  }

  // ── 루틴 리스트 패널 ─────────────────────────────────
  function RoutinePanel() {
    return (
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            {getCheckedRoutineIds(selectedDate).filter(id => routines.find(r => r.id === id)?.visible).length}
            /{visibleRoutines.length} 완료
          </Text>
          <SegmentedControl size="xs" value={mode} onChange={setMode}
            data={[{ label: '체크', value: 'check' }, { label: '수정', value: 'edit' }]} />
        </Group>

        <Stack gap="xs">
          {routines.length === 0 && (
            <Text size="sm" c="dimmed" ta="center" py="md">루틴을 추가해보세요.</Text>
          )}
          {routines.map(routine => {
            const checked = isChecked(routine.id, selectedDate)

            if (mode === 'check') {
              if (!routine.visible) return null
              return (
                <Group key={routine.id} gap="sm" px="xs" py={6}
                  style={{
                    borderRadius: 8,
                    background: checked ? '#EEF2FF' : 'var(--mantine-color-gray-0)',
                    border: `1px solid ${checked ? '#A5B4FC' : 'var(--mantine-color-gray-2)'}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => toggle(routine.id, selectedDate)}
                >
                  <Checkbox checked={checked} onChange={() => toggle(routine.id, selectedDate)} radius="xl" color="indigo" />
                  <Text size="sm" fw={checked ? 600 : 400} c={checked ? 'indigo.7' : 'gray.8'} style={{ flex: 1 }}>
                    {routine.name}
                  </Text>
                  {checked && <IconCheck size={14} color="var(--mantine-color-indigo-5)" />}
                </Group>
              )
            }

            const editVal = editNames[routine.id] ?? routine.name
            return (
              <Group key={routine.id} gap="xs" align="center">
                <Switch checked={routine.visible} onChange={() => toggleVisible(routine.id)} size="sm" color="indigo" />
                <TextInput
                  value={editVal}
                  onChange={e => setEditNames(prev => ({ ...prev, [routine.id]: e.currentTarget.value }))}
                  onBlur={() => handleEditSave(routine.id)}
                  onKeyDown={e => e.key === 'Enter' && handleEditSave(routine.id)}
                  size="xs" radius="md" style={{ flex: 1 }}
                  styles={{ input: { color: routine.visible ? undefined : 'var(--mantine-color-gray-4)' } }}
                />
              </Group>
            )
          })}
        </Stack>

        <Group gap="xs">
          <TextInput
            placeholder="새 루틴 추가"
            value={newName}
            onChange={e => setNewName(e.currentTarget.value)}
            onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) { addRoutine(newName); setNewName('') } }}
            size="xs" radius="md" style={{ flex: 1 }}
          />
          <ActionIcon variant="light" color="indigo" radius="xl"
            onClick={() => { if (newName.trim()) { addRoutine(newName); setNewName('') } }}>
            <IconPlus size={14} />
          </ActionIcon>
        </Group>
      </Stack>
    )
  }

  // ── 뷰 전환 컨트롤 ───────────────────────────────────
  return (
    <Stack maw={1000} mx="auto" gap="md">
      <Group justify="flex-start">
        <SegmentedControl
          value={calView}
          onChange={setCalView}
          data={[{ label: '월간', value: 'month' }, { label: '주간', value: 'week' }]}
        />
      </Group>

      {calView === 'month' && MonthCalendar()}
      {calView === 'week' && WeekCalendar()}

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={
          <DatePopoverTitle
            value={selectedDate}
            onChange={(d) => {
              setSelectedDate(d.format('YYYY-MM-DD'))
              setCurrent(d.startOf('month'))
              setCurrentWeek(d.startOf('week'))
            }}
          />
        }
      >
        {RoutinePanel()}
      </Drawer>
    </Stack>
  )
}
