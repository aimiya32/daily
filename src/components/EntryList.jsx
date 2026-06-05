import { useState } from 'react'
import { Stack, Paper, Text, Group, ActionIcon, Center, Chip, Badge, Box, SegmentedControl, Button } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconPencil, IconTrash, IconPencilPlus } from '@tabler/icons-react'
import CalendarGrid from './CalendarGrid'
import WeekGrid from './WeekGrid'
import CalendarNav from './CalendarNav'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'

dayjs.locale('ko')

export default function EntryList({ entries, categories, onEdit, onDelete, onView, onNew }) {
  const [filterCat, setFilterCat] = useState('all')
  const [calView, setCalView] = useState('month') // list | month | week
  const [current, setCurrent] = useState(dayjs().startOf('month'))
  const [currentWeek, setCurrentWeek] = useState(dayjs().startOf('week'))
  const isNarrow = useMediaQuery('(max-width: 500px)')
  const cardRadius = isNarrow ? 'md' : 'xl'

  const today = dayjs().format('YYYY-MM-DD')

  const filtered = filterCat === 'all'
    ? entries
    : entries.filter(e => e.categoryId === filterCat)

  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]))

  const byDate = {}
  for (const e of filtered) {
    if (!byDate[e.date]) byDate[e.date] = e
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => currentWeek.add(i, 'day'))

  function renderMonthDay(dateStr) {
    const entry = byDate[dateStr]
    if (!entry) return null
    const catName = entry.categoryId ? catMap[entry.categoryId] : null
    return (
      <Box onClick={e => { e.stopPropagation(); onView(entry) }} style={{
        background: '#4F46E515',
        borderRadius: 4,
        padding: '2px 6px',
        cursor: 'pointer',
        textAlign: 'center',
        width: '100%',
      }}>
        <Text style={{ fontSize: '0.75rem', color: '#4F46E5', fontWeight: 700, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {catName ?? '일기'}
        </Text>
      </Box>
    )
  }

  function renderWeekDay(dateStr) {
    const entry = byDate[dateStr]
    if (!entry) return <Text size="xs" c="dimmed">—</Text>
    const cat = categories.find(c => c.id === entry.categoryId)
    return (
      <Stack gap={6} onClick={e => { e.stopPropagation(); onView(entry) }} style={{ cursor: 'pointer' }}>
        {cat && <Badge size="xs" variant="light" radius="xl">{cat.name}</Badge>}
        <Text size="sm" lh={1.8} c="gray.7" style={{ whiteSpace: 'pre-wrap' }} lineClamp={4}>
          {entry.content}
        </Text>
      </Stack>
    )
  }

  const viewOptions = [{ label: '월간', value: 'month' }, { label: '주간', value: 'week' }, { label: '리스트', value: 'list' }]

  return (
    <Stack maw={800} mx="auto" gap="md">
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="sm" align="center" wrap="wrap">
          <SegmentedControl value={calView} onChange={setCalView} data={viewOptions} />
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
        </Group>
        <Button size="xs" variant="gradient" gradient={{ from: 'indigo', to: 'violet' }} radius="xl"
          leftSection={<IconPencilPlus size={13} />} onClick={onNew}>
          새 일기
        </Button>
      </Group>

      {calView === 'list' && (
        filtered.length === 0 ? (
          <Center mt="xl"><Text c="dimmed" size="sm">작성된 일기가 없어요.</Text></Center>
        ) : (
          filtered.map(entry => (
            <Paper key={entry.id} radius={cardRadius} p="lg" shadow="sm"
              style={{ cursor: 'pointer', background: 'white', transition: 'box-shadow 0.2s ease, transform 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}
              onClick={() => onView(entry)}
            >
              <Group justify="space-between">
                <Stack gap={6}>
                  <Text fw={700} size="sm" c="#1E293B">{dayjs(entry.date).format('YYYY년 M월 D일')}</Text>
                  <Group gap={6}>
                    <Text size="xs" c="#94A3B8">{dayjs(entry.date).format('dddd')}</Text>
                    {entry.categoryId && catMap[entry.categoryId] && (
                      <Badge size="xs" variant="light" radius="xl" color="indigo">{catMap[entry.categoryId]}</Badge>
                    )}
                  </Group>
                </Stack>
                <Group gap={4}>
                  <ActionIcon variant="subtle" color="gray" size="sm"
                    onClick={e => { e.stopPropagation(); onEdit(entry) }}>
                    <IconPencil size={15} />
                  </ActionIcon>
                  <ActionIcon variant="subtle" color="red" size="sm"
                    onClick={e => { e.stopPropagation(); if (confirm('삭제할까요?')) onDelete(entry.id) }}>
                    <IconTrash size={15} />
                  </ActionIcon>
                </Group>
              </Group>
            </Paper>
          ))
        )
      )}

      {calView === 'month' && (
        <Stack gap={0}>
          <CalendarNav
            title={current.format('YYYY년 M월')}
            monthValue={current.toDate()}
            onMonthSelect={(v) => setCurrent(dayjs(v).startOf('month'))}
            onToday={() => { setCurrent(dayjs().startOf('month')) }}
          />
          <CalendarGrid current={current} today={today} renderDayContent={renderMonthDay} />
        </Stack>
      )}

      {calView === 'week' && (
        <Stack gap={0}>
          <CalendarNav
            title={`${currentWeek.format('M월 D일')} – ${currentWeek.add(6, 'day').format('M월 D일')}`}
            onPrev={() => setCurrentWeek(w => w.subtract(1, 'week'))}
            onNext={() => setCurrentWeek(w => w.add(1, 'week'))}
            onToday={() => setCurrentWeek(dayjs().startOf('week'))}
          />
          <WeekGrid weekDays={weekDays} today={today} renderDayContent={renderWeekDay} />
        </Stack>
      )}
    </Stack>
  )
}
