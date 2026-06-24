import { useState } from 'react'
import { Drawer, Stack, Group, TextInput, Button, Text } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { hexOf } from '../lib/colors'
import ColorSwatchPicker, { ColorDot } from './ColorSwatchPicker'
import { CategoryRow, EmptyText } from './CategoryRow'
import './TrackerCategoryManager.module.scss'

export default function TrackerCategoryManager({ opened, onClose, categories, onAdd, onDelete }) {
  const [name, setName] = useState('')
  const [unit, setUnit] = useState('')
  const [color, setColor] = useState('indigo')

  function handleAdd() {
    if (!name.trim()) return
    onAdd(name, unit, color)
    setName('')
    setUnit('')
  }

  return (
    <Drawer opened={opened} onClose={onClose} title="목표 카테고리 관리">
      <Stack gap="md">
        <Stack gap="xs">
          <Group grow gap="xs">
            <TextInput
              placeholder="이름 (예: 달리기)"
              value={name}
              onChange={e => setName(e.currentTarget.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <TextInput
              placeholder="단위 (예: km)"
              value={unit}
              onChange={e => setUnit(e.currentTarget.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </Group>
          <ColorSwatchPicker value={color} onChange={setColor} />
          <Button
            leftSection={<IconPlus size={14} />}
            onClick={handleAdd}
            disabled={!name.trim()}
            variant="gradient"
            gradient={{ from: 'indigo', to: 'cyan' }}
          >
            추가
          </Button>
        </Stack>

        <Stack gap="xs">
          {categories.length === 0 && <EmptyText />}
          {categories.map(cat => (
            <CategoryRow key={cat.id} onDelete={() => onDelete(cat.id)}>
              <ColorDot hex={hexOf(cat.color)} />
              <Text size="sm">{cat.name}</Text>
              {cat.unit && <Text size="xs" c="dimmed">({cat.unit})</Text>}
            </CategoryRow>
          ))}
        </Stack>
      </Stack>
    </Drawer>
  )
}
