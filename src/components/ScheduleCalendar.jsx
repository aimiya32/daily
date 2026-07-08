import { useState } from 'react'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import { Stack, Chip, Group, Button, ScrollArea } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus } from '@tabler/icons-react'
import { useCalendarMaxItems } from '../hooks/useCalendarMaxItems'
import { hexOf, DEFAULT_HEX } from '../lib/colors'
import CalendarGrid from './CalendarGrid'
import CalendarNav from './CalendarNav'
import { DayPill, OverflowCount } from './DayPill'
import ScheduleDayDrawer from './ScheduleDayDrawer'
import dayjs from 'dayjs'
import './ScheduleCalendar.module.scss'

export default function ScheduleCalendar({ schedules, categories, onView, onAdd, onManageCategories }) {
  const [_monthStr, _setMonthStr] = useLocalStorageState('ui_schedule_month', dayjs().format('YYYY-MM'))
  const current = dayjs(_monthStr).startOf('month')
  const setCurrent = (d) => _setMonthStr(d.format('YYYY-MM'))
  const [filterCat, setFilterCat] = useState('all')
  const [selectedDate, setSelectedDate] = useState(null)
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)

  const maxItems = useCalendarMaxItems()

  const today = dayjs().format('YYYY-MM-DD')

  const filteredSchedules = filterCat === 'all'
    ? schedules
    : schedules.filter(s => s.categoryId === filterCat)

  const byDate = {}
  for (const s of filteredSchedules) {
    if (!byDate[s.date]) byDate[s.date] = []
    byDate[s.date].push(s)
  }

  const colorHexMap = Object.fromEntries(categories.map(c => [c.id, hexOf(c.color)]))

  function handleSelectDate(dateStr) {
    setSelectedDate(dateStr)
    openDrawer()
  }

  function renderDayContent(dateStr) {
    const daySchedules = byDate[dateStr] || []
    const visible = daySchedules.slice(0, maxItems)
    const overflow = daySchedules.length - visible.length
    return (
      <Stack gap={2}>
        {visible.map(s => (
          <DayPill key={s.id} hex={colorHexMap[s.categoryId] ?? DEFAULT_HEX} fontSize="0.6875rem">
            {s.title}
          </DayPill>
        ))}
        <OverflowCount count={overflow} />
      </Stack>
    )
  }

  return (
    <Stack gap="sm" maw={800} mx="auto">
      <Stack gap="xs">
        <Group justify="flex-end">
          <Button size="xs" variant="gradient" gradient={{ from: 'violet', to: 'grape' }} radius="xl"
                  leftSection={<IconPlus size={13} />} onClick={() => onAdd(null)}>
            일정 추가
          </Button>
        </Group>
        {categories.length > 0 && (
          <ScrollArea type="never" scrollbarSize={0} w="100%">
            <Chip.Group value={filterCat} onChange={setFilterCat}>
              <Group gap="xs" wrap="nowrap" style={{ width: 'max-content' }}>
                <Chip value="all" variant="light" size="sm" radius="xl">전체</Chip>
                {categories.map(cat => (
                  <Chip key={cat.id} value={cat.id} variant="light" size="sm" radius="xl">{cat.name}</Chip>
                ))}
              </Group>
            </Chip.Group>
          </ScrollArea>
        )}
      </Stack>

      <Stack gap={0}>
        <CalendarNav
          title={current.format('YYYY년 M월')}
          monthValue={current.toDate()}
          onMonthSelect={(v) => setCurrent(dayjs(v).startOf('month'))}
          onToday={() => setCurrent(dayjs().startOf('month'))}
        />
        <CalendarGrid
          current={current}
          today={today}
          onSelectDate={handleSelectDate}
          renderDayContent={renderDayContent}
        />
      </Stack>

      <ScheduleDayDrawer
        opened={drawerOpened}
        onClose={closeDrawer}
        date={selectedDate}
        schedules={schedules}
        categories={categories}
        onView={onView}
        onAdd={onAdd}
      />
    </Stack>
  )
}
