import { Stack, Text, Group, Drawer, Paper, Badge, Button, Center } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { hexOf, DEFAULT_HEX } from '../lib/colors'
import dayjs from 'dayjs'

// 특정 날짜의 일정 목록을 보여주는 왼쪽 슬라이드 드로어
export default function ScheduleDayDrawer({ opened, onClose, date, schedules, categories, onView, onAdd }) {
  const colorHexMap = Object.fromEntries(categories.map(c => [c.id, hexOf(c.color)]))

  // 해당 날짜 일정 필터 + 시간순 정렬
  const daySchedules = date
    ? schedules.filter(s => s.date === date).sort((a, b) => (a.time || '').localeCompare(b.time || ''))
    : []

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={date ? dayjs(date).format('M월 D일 (ddd)') : ''}
    >
      <Stack gap="sm">
        {daySchedules.length === 0 && (
          <Center py="lg"><Text size="sm" c="dimmed">이 날짜에 일정이 없어요.</Text></Center>
        )}
        {daySchedules.map(s => {
          const hex = colorHexMap[s.categoryId] ?? DEFAULT_HEX
          const cat = categories.find(c => c.id === s.categoryId)
          return (
            <Paper
              key={s.id} p="sm" radius="md" withBorder
              style={{ cursor: 'pointer', borderColor: hex + '33' }}
              onClick={() => { onView(s); onClose() }}
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
          onClick={() => { onAdd(date); onClose() }}
        >
          이 날짜에 일정 추가
        </Button>
      </Stack>
    </Drawer>
  )
}
