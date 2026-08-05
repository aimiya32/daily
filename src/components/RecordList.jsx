import { useState } from 'react'
import { Stack, Paper, Text, Group, ActionIcon, Center, Chip, Badge, Box, SegmentedControl, Button, SimpleGrid } from '@mantine/core'
import { IconPencil, IconTrash, IconPencilPlus } from '@tabler/icons-react'
import CalendarGrid from './CalendarGrid'
import WeekGrid from './WeekGrid'
import CalendarNav from './CalendarNav'
import StoredImage from './StoredImage'
import { DayPill, OverflowCount } from './DayPill'
import { useCalendarMaxItems } from '../hooks/useCalendarMaxItems'
import { useMonthCursor, useWeekCursor } from '../hooks/useCalendarCursor'
import { todayStr } from '../lib/dates'
import { collectTags } from '../lib/tags'
import dayjs from 'dayjs'
import styles from './RecordList.module.scss'

export default function RecordList({ records, categories, onEdit, onDelete, onView, onNew }) {
  const maxItems = useCalendarMaxItems()
  const [filterCat, setFilterCat] = useState('all')
  const [calView, setCalView] = useState('month') // list | month | week
  const [current, setCurrent] = useMonthCursor()
  const [currentWeek, setCurrentWeek] = useWeekCursor()
  const [selectedTag, setSelectedTag] = useState(null)
  const cardRadius = 14

  const today = todayStr()

  // 사용된 모든 태그
  const allTags = collectTags(records)
  const taggedRecords = selectedTag
    ? records.filter(e => (e.tags ?? []).includes(selectedTag)).sort((a, b) => (a.date < b.date ? 1 : -1))
    : []

  const filtered = filterCat === 'all'
    ? records
    : records.filter(e => e.categoryId === filterCat)

  // 선택된 카테고리가 '이미지형'이면 리스트를 갤러리로 표시
  const activeCat = categories.find(c => c.id === filterCat)
  const isImageView = activeCat?.viewType === 'image'

  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]))

  const byDate = {}
  for (const e of filtered) {
    if (!byDate[e.date]) byDate[e.date] = []
    byDate[e.date].push(e)
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => currentWeek.add(i, 'day'))

  function renderMonthDay(dateStr) {
    const dayRecords = byDate[dateStr]
    if (!dayRecords) return null
    const visible = dayRecords.slice(0, maxItems)
    const overflow = dayRecords.length - visible.length
    return (
      <Stack gap={2}>
        {visible.map(record => {
          const catName = record.categoryId ? catMap[record.categoryId] : null
          return (
            <DayPill key={record.id} onClick={e => { e.stopPropagation(); onView(record) }}>
              {record.title || catName || '기록'}
            </DayPill>
          )
        })}
        <OverflowCount count={overflow} />
      </Stack>
    )
  }

  function renderWeekDay(dateStr) {
    const record = byDate[dateStr]
    if (!record) return <Text size="xs" c="dimmed">—</Text>
    const cat = categories.find(c => c.id === record.categoryId)
    return (
      <Group gap={6} wrap="nowrap" align="center" onClick={e => { e.stopPropagation(); onView(record) }} style={{ cursor: 'pointer', minWidth: 0 }}>
        {cat && <Badge size="sm" variant="light" radius="xl" style={{ flexShrink: 0 }}>{cat.name}</Badge>}
        {record.title && (
          <Text fw={700} size="sm" c="#4F46E5" lineClamp={1}>{record.title}</Text>
        )}
      </Group>
    )
  }

  const viewOptions = [{ label: '월간', value: 'month' }, { label: '주간', value: 'week' }, { label: '리스트', value: 'list' }, { label: '태그', value: 'tag' }]

  function renderRecordCard(record) {
    return (
      <Paper key={record.id} radius={cardRadius} p="lg" shadow="sm"
        style={{ cursor: 'pointer', background: 'white', transition: 'box-shadow 0.2s ease, transform 0.2s ease' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}
        onClick={() => onView(record)}
      >
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Stack gap={6} style={{ minWidth: 0 }}>
            {(record.title || (record.categoryId && catMap[record.categoryId])) && (
              <Group gap={6} wrap="nowrap" align="center" style={{ minWidth: 0 }}>
                {record.categoryId && catMap[record.categoryId] && (
                  <Badge size="sm" variant="light" radius="xl" color="indigo" style={{ flexShrink: 0 }}>{catMap[record.categoryId]}</Badge>
                )}
                {record.title && (
                  <Text fw={700} size="sm" c="#4F46E5" lineClamp={1}>{record.title}</Text>
                )}
              </Group>
            )}
            <Group gap={6} wrap="wrap" align="center">
              <Text fw={700} size="sm" c="#1E293B">{dayjs(record.date).format('YYYY년 M월 D일')}</Text>
              <Text fw={700} size="sm" c="#1E293B">{dayjs(record.date).format('dddd')}</Text>
            </Group>
            {(record.tags ?? []).length > 0 && (
              <Text size="xs" c="#94A3B8">
                {(record.tags ?? []).map(t => `#${t}`).join(' ')}
              </Text>
            )}
          </Stack>
          <Group gap={4} wrap="nowrap">
            <ActionIcon variant="subtle" color="gray" size="sm"
              onClick={e => { e.stopPropagation(); onEdit(record) }}>
              <IconPencil size={15} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" size="sm"
              onClick={e => { e.stopPropagation(); if (confirm('삭제할까요?')) onDelete(record.id) }}>
              <IconTrash size={15} />
            </ActionIcon>
          </Group>
        </Group>
      </Paper>
    )
  }

  function renderGalleryItem(record) {
    const imgId = record.images?.[0]
    return (
      <Paper key={record.id} radius={cardRadius} shadow="sm"
        style={{ overflow: 'hidden', cursor: 'pointer', background: 'white' }}
        onClick={() => onView(record)}
      >
        {imgId ? (
          <StoredImage id={imgId} variant="thumb" height={240} radius={0} />
        ) : (
          <Box className={styles.galleryPlaceholder}>
            <Text size="xs" c="dimmed">이미지 없음</Text>
          </Box>
        )}
        <Stack gap={2} p="xs">
          <Text size="xs" c="#94A3B8">{dayjs(record.date).format('YYYY. M. D.')}</Text>
          {record.title && <Text fw={700} size="sm" c="#1E293B" lineClamp={1}>{record.title}</Text>}
        </Stack>
      </Paper>
    )
  }

  return (
    <Stack maw={800} mx="auto" gap="md">
      <Stack gap="sm">
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <SegmentedControl value={calView} onChange={setCalView} data={viewOptions} />
          <Button size="xs" variant="gradient" gradient={{ from: 'indigo', to: 'violet' }} radius="xl"
            leftSection={<IconPencilPlus size={13} />} onClick={onNew}>
            새 기록
          </Button>
        </Group>
        {categories.length > 0 && (
          <Chip.Group value={filterCat} onChange={setFilterCat}>
            <Group gap="xs" wrap="nowrap" className={styles.chipScroll} style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
              <Chip value="all" variant="light" size="sm" radius="xl" className={styles.chipItem}>전체</Chip>
              {categories.map(cat => (
                <Chip key={cat.id} value={cat.id} variant="light" size="sm" radius="xl" className={styles.chipItem}>{cat.name}</Chip>
              ))}
            </Group>
          </Chip.Group>
        )}
      </Stack>

      {calView === 'list' && (
        filtered.length === 0 ? (
          <Center mt="xl"><Text c="dimmed" size="sm">작성된 기록이 없어요.</Text></Center>
        ) : isImageView ? (
          <SimpleGrid cols={2} spacing="sm">
            {filtered.map(renderGalleryItem)}
          </SimpleGrid>
        ) : (
          filtered.map(renderRecordCard)
        )
      )}

      {calView === 'tag' && (
        <Stack gap="md" mt="md">
          {allTags.length === 0 ? (
            <Center mt="xl"><Text c="dimmed" size="sm">사용된 태그가 없어요. 기록을 쓸 때 태그를 입력해보세요.</Text></Center>
          ) : (
            <Group gap="xs" wrap="wrap">
              {(selectedTag ? [selectedTag] : allTags).map(tag => (
                <Chip
                  key={tag}
                  checked={selectedTag === tag}
                  onChange={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  variant="light" color="violet" size="md" radius="sm"
                  styles={{
                    iconWrapper: { display: 'none' },
                    label: { background: '#fff', border: 'none', paddingLeft: 16, paddingRight: 16, fontSize: '0.95rem', height: 34, fontWeight: 700 },
                  }}
                >
                  <span style={{ fontSize: '0.72em', fontWeight: 500, opacity: 0.5, marginRight: 5 }}>#</span>
                  <Text span fw={700} variant="gradient" gradient={{ from: 'indigo', to: 'violet', deg: 45 }}>{tag}</Text>
                </Chip>
              ))}
            </Group>
          )}
          {selectedTag && (
            taggedRecords.length === 0
              ? <Center mt="md"><Text c="dimmed" size="sm">해당 태그의 기록이 없어요.</Text></Center>
              : taggedRecords.map(renderRecordCard)
          )}
        </Stack>
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
