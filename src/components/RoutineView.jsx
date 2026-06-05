import { useState, useEffect, useRef } from 'react'
import {
  Paper, Stack, Group, Text, Box, ActionIcon,
  Button, Checkbox, TextInput, Switch, SegmentedControl, Badge, Drawer, Popover,
} from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown } from '@tabler/icons-react'
import { useCalendarMaxItems } from '../hooks/useCalendarMaxItems'
import { IconPlus, IconCheck } from '@tabler/icons-react'
import CalendarGrid from './CalendarGrid'
import WeekGrid from './WeekGrid'
import CalendarNav from './CalendarNav'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'

dayjs.locale('ko')

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const ROUTINE_COLOR = '#4F46E5'

export default function RoutineView({ routines, isChecked, toggle, getCheckedRoutineIds, addRoutine, updateRoutine, toggleVisible, onExposeOpen }) {
  const [calView, setCalView] = useState('month') // month | week
  const [current, setCurrent] = useState(dayjs().startOf('month'))
  const [currentWeek, setCurrentWeek] = useState(dayjs().startOf('week'))
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [mode, setMode] = useState('check')
  const [newName, setNewName] = useState('')
  const [editNames, setEditNames] = useState({})
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)
  const [datePickerOpened, { toggle: toggleDatePicker, close: closeDatePicker }] = useDisclosure(false)

  useEffect(() => {
    onExposeOpen?.(openDrawer)
  }, [openDrawer, onExposeOpen])

  const maxItems = useCalendarMaxItems()

  const today = dayjs().format('YYYY-MM-DD')
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
            return r ? (
              <Box key={id} style={{
                background: ROUTINE_COLOR + '22',
                borderRadius: 4, padding: '2px 6px', width: '100%',
              }}>
                <Text style={{ fontSize: 12, color: ROUTINE_COLOR, fontWeight: 700, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.name}
                </Text>
              </Box>
            ) : null
          })}
          {overflow > 0 && (
            <Text size="xs" c="dimmed" ta="center" style={{ fontSize: 10, lineHeight: 1.4 }}>+{overflow}</Text>
          )}
        </Stack>
      )
    }

    return (
      <Stack gap={0}>
        <CalendarNav
          title={current.format('YYYY년 M월')}
          onPrev={() => setCurrent(c => c.subtract(1, 'month'))}
          onNext={() => setCurrent(c => c.add(1, 'month'))}
          onToday={goToday}
        />
        <CalendarGrid
          current={current}
          today={today}
          onSelectDate={setSelectedDate}
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
          onSelectDate={setSelectedDate}
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

              if (mode === 'edit') {
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
              }
              return null
            })}
          </Stack>

          {(mode === 'check' || mode === 'edit') && (
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
          )}
      </Stack>
    )
  }

  // ── 뷰 전환 컨트롤 ───────────────────────────────────
  return (
    <Stack maw={1000} mx="auto" gap="md">
      <Group justify="flex-end">
        <SegmentedControl
          size="xs"
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
        position="right"
        overlayProps={{ backgroundOpacity: 0 }}
        title={
          <Popover
            opened={datePickerOpened}
            onChange={(o) => !o && closeDatePicker()}
            position="bottom-start"
            shadow="md"
            withArrow
          >
            <Popover.Target>
              <Group
                gap={4}
                align="center"
                style={{ cursor: 'pointer' }}
                onClick={toggleDatePicker}
              >
                <Text fw={600}>{dayjs(selectedDate).format('M월 D일 (ddd)')}</Text>
                <IconChevronDown size={16} color="var(--mantine-color-gray-6)" />
              </Group>
            </Popover.Target>
            <Popover.Dropdown>
              <DatePicker
                value={dayjs(selectedDate).toDate()}
                onChange={(value) => {
                  if (!value) return
                  const d = dayjs(value)
                  setSelectedDate(d.format('YYYY-MM-DD'))
                  setCurrent(d.startOf('month'))
                  setCurrentWeek(d.startOf('week'))
                  closeDatePicker()
                }}
                locale="ko"
              />
            </Popover.Dropdown>
          </Popover>
        }
        size="sm"
      >
        {RoutinePanel()}
      </Drawer>
    </Stack>
  )
}
