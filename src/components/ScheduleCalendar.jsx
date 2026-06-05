import { useState } from 'react'
import { Box, Stack, Text, Chip, Group } from '@mantine/core'
import { useCalendarMaxItems } from '../hooks/useCalendarMaxItems'
import { SCAT_COLORS } from '../hooks/useScheduleCategories'
import CalendarGrid from './CalendarGrid'
import CalendarNav from './CalendarNav'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'

dayjs.locale('ko')

export default function ScheduleCalendar({ schedules, categories, onView, onAdd, onManageCategories }) {
  const [current, setCurrent] = useState(dayjs().startOf('month'))
  const [filterCat, setFilterCat] = useState('all')

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

  const colorHexMap = Object.fromEntries(
    categories.map(c => [c.id, SCAT_COLORS.find(sc => sc.name === c.color)?.hex ?? '#4F46E5'])
  )

  function renderDayContent(dateStr) {
    const daySchedules = byDate[dateStr] || []
    const visible = daySchedules.slice(0, maxItems)
    const overflow = daySchedules.length - visible.length
    return (
      <Stack gap={2}>
        {visible.map(s => {
          const hex = colorHexMap[s.categoryId] ?? '#4F46E5'
          return (
            <Box key={s.id} onClick={() => onView(s)} style={{
              background: hex + '22',
              borderRadius: 4,
              padding: '2px 6px',
              cursor: 'pointer',
              width: '100%',
            }}>
              <Text size="xs" truncate style={{ color: hex, fontWeight: 700, fontSize: '0.6875rem', lineHeight: 1.4 }}>
                {s.time ? `${s.time} ` : ''}{s.title}
              </Text>
            </Box>
          )
        })}
        {overflow > 0 && (
          <Text size="xs" c="dimmed" ta="center" style={{ fontSize: '0.625rem', lineHeight: 1.4 }}>
            +{overflow}
          </Text>
        )}
      </Stack>
    )
  }

  return (
    <Stack gap="sm" maw={800} mx="auto">
      {categories.length > 0 && (
        <Chip.Group value={filterCat} onChange={setFilterCat}>
          <Group gap="xs" wrap="wrap">
            <Chip value="all" variant="light" size="sm" radius="xl">전체</Chip>
            {categories.map(cat => (
              <Chip key={cat.id} value={cat.id} variant="light" size="sm" radius="xl">{cat.name}</Chip>
            ))}
          </Group>
        </Chip.Group>
      )}

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
          renderDayContent={renderDayContent}
        />
      </Stack>
    </Stack>
  )
}
