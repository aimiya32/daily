import { Group, ActionIcon, Text } from '@mantine/core'
import { IconTrash } from '@tabler/icons-react'

// 카테고리 관리 Drawer의 한 줄: 내용 + 삭제 버튼
export function CategoryRow({ onDelete, children }) {
  return (
    <Group gap="xs" wrap="nowrap" px="xs" py={6}
      style={{ border: '1px solid var(--mantine-color-gray-2)', borderRadius: 8 }}>
      <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
        {children}
      </Group>
      <ActionIcon variant="subtle" color="red" size="sm" onClick={onDelete}>
        <IconTrash size={14} />
      </ActionIcon>
    </Group>
  )
}

export function EmptyText({ children = '카테고리가 없어요.' }) {
  return <Text size="sm" c="dimmed" ta="center">{children}</Text>
}
