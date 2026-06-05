import { Stack, Text, Group, Badge, ActionIcon, Paper, Divider } from '@mantine/core'
import { IconPencil, IconTrash, IconClock } from '@tabler/icons-react'
import { SCAT_COLORS } from '../hooks/useScheduleCategories'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'

dayjs.locale('ko')

export default function ScheduleDetail({ schedule, categories, onEdit, onDelete }) {
  const cat = categories.find(c => c.id === schedule.categoryId)
  const colorHex = cat ? (SCAT_COLORS.find(sc => sc.name === cat.color)?.hex ?? '#4F46E5') : null

  return (
    <Paper maw={640} mx="auto" radius={14} shadow="sm" p="xl" style={{ background: 'white' }}>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <Stack gap={8}>
            <Text fw={800} size="xl" c="#1E293B" style={{ letterSpacing: '-0.5px' }}>
              {schedule.title}
            </Text>
            <Group gap={8} wrap="wrap">
              <Text size="sm" c="#94A3B8">
                {dayjs(schedule.date).format('YYYY년 M월 D일 (ddd)')}
              </Text>
              {schedule.time && (
                <Group gap={4}>
                  <IconClock size={13} color="#94A3B8" />
                  <Text size="sm" c="#94A3B8">{schedule.time}</Text>
                </Group>
              )}
              {cat && (
                <Badge
                  size="sm"
                  radius="xl"
                  style={{ background: colorHex + '18', color: colorHex, border: `1px solid ${colorHex}33` }}
                >
                  {cat.name}
                </Badge>
              )}
            </Group>
          </Stack>
          <Group gap="xs">
            <ActionIcon variant="light" color="indigo" radius="xl" size="lg" onClick={onEdit}>
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon variant="light" color="red" radius="xl" size="lg"
              onClick={() => { if (confirm('삭제할까요?')) onDelete() }}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>

        {schedule.description && (
          <>
            <Divider color="gray.1" />
            <Text size="md" lh={2} style={{ whiteSpace: 'pre-wrap', color: '#334155' }}>
              {schedule.description}
            </Text>
          </>
        )}
      </Stack>
    </Paper>
  )
}
