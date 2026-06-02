import { Paper, Group, ActionIcon, Text, Button } from '@mantine/core'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

export default function CalendarNav({ title, onPrev, onNext, onToday, rightSection }) {
  return (
    <Paper
      px="lg"
      py="md"
      style={{
        borderRadius: '16px 16px 0 0',
        background: 'white',
        boxShadow: '0 -1px 0 #E2E8F0 inset',
        border: '1px solid #E2E8F0',
        borderBottom: 'none',
      }}
    >
      <Group justify="space-between">
        <Group gap={4}>
          <ActionIcon variant="subtle" color="gray" radius="xl" onClick={onPrev}>
            <IconChevronLeft size={16} />
          </ActionIcon>
          <Text fw={700} size="md" ta="center" style={{ minWidth: 140 }}>{title}</Text>
          <ActionIcon variant="subtle" color="gray" radius="xl" onClick={onNext}>
            <IconChevronRight size={16} />
          </ActionIcon>
          <Button size="xs" variant="subtle" color="indigo" radius="xl" onClick={onToday}>
            오늘
          </Button>
        </Group>
        {rightSection && <Group gap="xs">{rightSection}</Group>}
      </Group>
    </Paper>
  )
}
