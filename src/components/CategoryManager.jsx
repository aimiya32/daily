import { useState } from 'react'
import { Drawer, Stack, Group, TextInput, Button, ActionIcon, Text } from '@mantine/core'
import { IconTrash, IconPlus } from '@tabler/icons-react'

export default function CategoryManager({ opened, onClose, categories, onAdd, onDelete }) {
  const [input, setInput] = useState('')

  function handleAdd() {
    if (!input.trim()) return
    onAdd(input)
    setInput('')
  }

  return (
    <Drawer opened={opened} onClose={onClose} title="카테고리 관리" position="right" size="sm" overlayProps={{ backgroundOpacity: 0 }}>
      <Stack gap="md">
        <Group gap="xs">
          <TextInput
            placeholder="카테고리 이름"
            value={input}
            onChange={e => setInput(e.currentTarget.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            style={{ flex: 1 }}
          />
          <Button leftSection={<IconPlus size={14} />} onClick={handleAdd} disabled={!input.trim()}>
            추가
          </Button>
        </Group>

        <Stack gap="xs">
          {categories.length === 0 && (
            <Text size="sm" c="dimmed" ta="center">카테고리가 없어요.</Text>
          )}
          {categories.map(cat => (
            <Group key={cat.id} justify="space-between" px="xs" py={6}
              style={{ border: '1px solid var(--mantine-color-gray-2)', borderRadius: 8 }}>
              <Text size="sm">{cat.name}</Text>
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
