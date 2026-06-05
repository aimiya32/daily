import { useState } from 'react'
import {Box, Stack, Text, Chip, Group, Drawer, Paper, Badge, Button, Center, ScrollArea} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPlus } from '@tabler/icons-react'
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

  const colorHexMap = Object.fromEntries(
    categories.map(c => [c.id, SCAT_COLORS.find(sc => sc.name === c.color)?.hex ?? '#4F46E5'])
  )

  // 드로어에 보여줄 선택 날짜의 일정 (시간순 정렬)
  const drawerSchedules = selectedDate
    ? schedules.filter(s => s.date === selectedDate).sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    : []

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
        {visible.map(s => {
          const hex = colorHexMap[s.categoryId] ?? '#4F46E5'
          return (
            <Box key={s.id} style={{
              background: hex + '22',
              borderRadius: 4,
              padding: '2px 6px',
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
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        {categories.length > 0 ? (
          <ScrollArea type="never" scrollbarSize={0}>
            <Chip.Group value={filterCat} onChange={setFilterCat}>
              <Group gap="xs" wrap="no-wrap">
                <Chip value="all" variant="light" size="sm" radius="xl">전체</Chip>
                {categories.map(cat => (
                  <Chip key={cat.id} value={cat.id} variant="light" size="sm" radius="xl">{cat.name}</Chip>
                ))}
              </Group>
            </Chip.Group>
          </ScrollArea>
        ) : <Box />}
        <Button size="xs" variant="gradient" gradient={{ from: 'violet', to: 'grape' }} radius="xl"
          leftSection={<IconPlus size={13} />} onClick={() => onAdd(null)}>
          일정 추가
        </Button>
      </Group>

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

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        position="right"
        size="sm"
        overlayProps={{ backgroundOpacity: 0 }}
        title={selectedDate ? dayjs(selectedDate).format('M월 D일 (ddd)') : ''}
      >
        <Stack gap="sm">
          {drawerSchedules.length === 0 && (
            <Center py="lg"><Text size="sm" c="dimmed">이 날짜에 일정이 없어요.</Text></Center>
          )}
          {drawerSchedules.map(s => {
            const hex = colorHexMap[s.categoryId] ?? '#4F46E5'
            const cat = categories.find(c => c.id === s.categoryId)
            return (
              <Paper
                key={s.id} p="sm" radius="md" withBorder
                style={{ cursor: 'pointer', borderColor: hex + '33' }}
                onClick={() => { onView(s); closeDrawer() }}
              >
                <Group justify="space-between" align="flex-start" mb={s.description ? 6 : 0} wrap="nowrap">
                  <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                    {s.time && <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>{s.time}</Text>}
                    <Text fw={700} c="#1E293B">{s.title}</Text>
                  </Group>
                  {cat && (
                    <Badge size="sm" radius="xl" style={{ background: hex + '18', color: hex, border: `1px solid ${hex}33`, flexShrink: 0 }}>
                      {cat.name}
                    </Badge>
                  )}
                </Group>
                {s.description && (
                  <Text size="sm" c="#475569" style={{ whiteSpace: 'pre-wrap' }}>{s.description}</Text>
                )}
              </Paper>
            )
          })}

          <Button
            variant="light" color="violet" radius="xl"
            leftSection={<IconPlus size={15} />}
            onClick={() => { onAdd(selectedDate); closeDrawer() }}
          >
            이 날짜에 일정 추가
          </Button>
        </Stack>
      </Drawer>
    </Stack>
  )
}
