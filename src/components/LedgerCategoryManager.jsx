import { useState } from 'react'
import { Drawer, Stack, Group, TextInput, Button, ActionIcon, Text, SegmentedControl, Divider } from '@mantine/core'
import { IconTrash, IconPlus } from '@tabler/icons-react'

export default function LedgerCategoryManager({ opened, onClose, categories, onAdd, onDelete }) {
  const [input, setInput] = useState('')
  const [type, setType] = useState('expense')

  function handleAdd() {
    if (!input.trim()) return
    onAdd(input, type)
    setInput('')
  }

  const expenseCats = categories.filter(c => c.type === 'expense')
  const incomeCats = categories.filter(c => c.type === 'income')

  function renderList(list) {
    if (list.length === 0) return <Text size="sm" c="dimmed" ta="center">카테고리가 없어요.</Text>
    return list.map(cat => (
      <Group key={cat.id} justify="space-between" px="xs" py={6}
        style={{ border: '1px solid var(--mantine-color-gray-2)', borderRadius: 8 }}>
        <Text size="sm">{cat.name}</Text>
        <ActionIcon variant="subtle" color="red" size="sm" onClick={() => onDelete(cat.id)}>
          <IconTrash size={14} />
        </ActionIcon>
      </Group>
    ))
  }

  return (
    <Drawer opened={opened} onClose={onClose} title="가계부 카테고리 관리" position="right" size="sm" overlayProps={{ backgroundOpacity: 0 }}>
      <Stack gap="md">
        <Stack gap="xs">
          <SegmentedControl
            value={type} onChange={setType} fullWidth
            data={[{ label: '지출', value: 'expense' }, { label: '수입', value: 'income' }]}
          />
          <Group gap="xs" wrap="nowrap">
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
        </Stack>

        <Stack gap="xs">
          <Text size="xs" fw={700} c="#DC2626">지출</Text>
          {renderList(expenseCats)}
        </Stack>

        <Divider />

        <Stack gap="xs">
          <Text size="xs" fw={700} c="#2563EB">수입</Text>
          {renderList(incomeCats)}
        </Stack>
      </Stack>
    </Drawer>
  )
}
