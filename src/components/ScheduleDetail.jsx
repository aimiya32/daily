import { Stack, Text, Group, Badge, ActionIcon, Divider, Button } from '@mantine/core'
import { IconPencil, IconTrash, IconClock } from '@tabler/icons-react'
import { hexOf } from '../lib/colors'
import ContentCard from './ContentCard'
import dayjs from 'dayjs'

export default function ScheduleDetail({ schedule, categories, onEdit, onDelete, onDeleteAll }) {
  const cat = categories.find(c => c.id === schedule.categoryId)
  const colorHex = cat ? hexOf(cat.color) : null

  return (
    <ContentCard>
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
            <ActionIcon variant="light" color="gray" radius="xl" size="lg" onClick={onEdit}>
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon variant="light" color="red" radius="xl" size="lg"
              onClick={() => { if (confirm('이 일정을 삭제할까요?')) onDelete() }}>
              <IconTrash size={16} />
            </ActionIcon>
            {schedule.recurrenceId && onDeleteAll && (
              <Button variant="light" color="red" size="xs" radius="xl"
                onClick={() => { if (confirm('반복 일정을 모두 삭제할까요?')) onDeleteAll() }}>
                전체 삭제
              </Button>
            )}
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
    </ContentCard>
  )
}
