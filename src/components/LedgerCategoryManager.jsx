import { useState } from 'react'
import { Drawer, Stack, Group, TextInput, Button, Text, SegmentedControl, Divider } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { CategoryRow, EmptyText } from './CategoryRow'

export default function LedgerCategoryManager({ opened, onClose, categories, onAdd, onDelete }) {
  const [input, setInput] = useState('')
  const [type, setType] = useState('expense')

  function handleAdd() {
    if (!input.trim()) return
    onAdd(input, type)
    setInput('')
  }

  function renderList(list) {
    if (list.length === 0) return <EmptyText />
    return list.map(cat => (
      <CategoryRow key={cat.id} onDelete={() => onDelete(cat.id)}>
        <Text size="sm">{cat.name}</Text>
      </CategoryRow>
    ))
  }

  return (
    <Drawer opened={opened} onClose={onClose} title="가계부 카테고리 관리">
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
          {renderList(categories.filter(c => c.type === 'expense'))}
        </Stack>

        <Divider />

        <Stack gap="xs">
          <Text size="xs" fw={700} c="#2563EB">수입</Text>
          {renderList(categories.filter(c => c.type === 'income'))}
        </Stack>
      </Stack>
    </Drawer>
  )
}
