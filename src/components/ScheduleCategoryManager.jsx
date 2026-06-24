import { useState } from 'react'
import { Drawer, Stack, TextInput, Button, Text } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { hexOf } from '../lib/colors'
import ColorSwatchPicker, { ColorDot } from './ColorSwatchPicker'
import { CategoryRow, EmptyText } from './CategoryRow'
import './ScheduleCategoryManager.module.scss'

export default function ScheduleCategoryManager({ opened, onClose, categories, onAdd, onDelete }) {
  const [input, setInput] = useState('')
  const [color, setColor] = useState('blue')

  function handleAdd() {
    if (!input.trim()) return
    onAdd(input, color)
    setInput('')
  }

  return (
    <Drawer opened={opened} onClose={onClose} title="일정 카테고리 관리">
      <Stack gap="md">
        <Stack gap="xs">
          <TextInput
            placeholder="카테고리 이름"
            value={input}
            onChange={e => setInput(e.currentTarget.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <ColorSwatchPicker value={color} onChange={setColor} />
          <Button
            leftSection={<IconPlus size={14} />}
            onClick={handleAdd}
            disabled={!input.trim()}
            variant="gradient"
            gradient={{ from: 'violet', to: 'grape' }}
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
            </CategoryRow>
          ))}
        </Stack>
      </Stack>
    </Drawer>
  )
}
