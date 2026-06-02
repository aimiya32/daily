import { Stack, Text, Group, Badge, ActionIcon, Paper, Divider } from '@mantine/core'
import { IconPencil } from '@tabler/icons-react'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'

dayjs.locale('ko')

export default function EntryDetail({ entry, categories, onEdit }) {
  const cat = categories.find(c => c.id === entry.categoryId)

  return (
    <Paper maw={640} mx="auto" radius="xl" shadow="sm" p="xl" style={{ background: 'white' }}>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <Stack gap={6}>
            <Text fw={800} size="xl" c="#1E293B" style={{ letterSpacing: '-0.5px' }}>
              {dayjs(entry.date).format('YYYY년 M월 D일')}
            </Text>
            <Group gap={8}>
              <Text size="sm" c="#94A3B8">{dayjs(entry.date).format('dddd')}</Text>
              {cat && (
                <Badge size="sm" variant="light" radius="xl" color="indigo">{cat.name}</Badge>
              )}
            </Group>
          </Stack>
          <ActionIcon variant="light" color="indigo" radius="xl" size="lg" onClick={onEdit}>
            <IconPencil size={16} />
          </ActionIcon>
        </Group>

        <Divider color="gray.1" />

        <Text size="md" lh={2} style={{ whiteSpace: 'pre-wrap', color: '#334155' }}>
          {entry.content}
        </Text>
      </Stack>
    </Paper>
  )
}
