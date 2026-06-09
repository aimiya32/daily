import { useState } from 'react'
import { Drawer, Stack, Group, TextInput, Button, ActionIcon, Text, Select } from '@mantine/core'
import { IconTrash, IconPlus } from '@tabler/icons-react'

const VIEW_OPTIONS = [
  { label: '목록형', value: 'list' },
  { label: '이미지형', value: 'image' },
]

export default function CategoryManager({ opened, onClose, categories, onAdd, onUpdate, onDelete }) {
  const [input, setInput] = useState('')
  const [viewType, setViewType] = useState('list')

  function handleAdd() {
    if (!input.trim()) return
    onAdd(input, viewType)
    setInput('')
  }

  return (
    <Drawer opened={opened} onClose={onClose} title="카테고리 관리" position="right" size="sm" overlayProps={{ backgroundOpacity: 0 }}>
      <Stack gap="md">
        <Group gap="xs" wrap="nowrap">
          <TextInput
            placeholder="카테고리 이름"
            value={input}
            onChange={e => setInput(e.currentTarget.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            style={{ flex: 1 }}
          />
          <Select data={VIEW_OPTIONS} value={viewType} onChange={setViewType} w={110} allowDeselect={false} />
          <ActionIcon variant="filled" size={36} onClick={handleAdd} disabled={!input.trim()}>
            <IconPlus size={16} />
          </ActionIcon>
        </Group>

        <Stack gap="xs">
          {categories.length === 0 && (
            <Text size="sm" c="dimmed" ta="center">카테고리가 없어요.</Text>
          )}
          {categories.map(cat => (
            <Group key={cat.id} gap="xs" wrap="nowrap" px="xs" py={6}
              style={{ border: '1px solid var(--mantine-color-gray-2)', borderRadius: 8 }}>
              <Text size="sm" style={{ flex: 1, minWidth: 0 }} truncate>{cat.name}</Text>
              <Select
                data={VIEW_OPTIONS}
                value={cat.viewType ?? 'list'}
                onChange={v => onUpdate(cat.id, { viewType: v })}
                w={110} size="xs" allowDeselect={false}
              />
              <ActionIcon variant="subtle" color="red" size="sm" onClick={() => onDelete(cat.id)}>
                <IconTrash size={14} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      </Stack>
    </Drawer>
  )
}
