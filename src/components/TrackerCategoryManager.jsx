import { useState } from 'react'
import { Drawer, Stack, Group, TextInput, Button, ActionIcon, Text, Box } from '@mantine/core'
import { IconTrash, IconPlus } from '@tabler/icons-react'
import { TCAT_COLORS } from '../hooks/useTrackerCategories'

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
    <Drawer opened={opened} onClose={onClose} title="목표 카테고리 관리" position="right" size="sm" overlayProps={{ backgroundOpacity: 0 }}>
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
          <Group gap="xs">
            {TCAT_COLORS.map(c => (
              <Box
                key={c.name}
                onClick={() => setColor(c.name)}
                style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: c.hex, cursor: 'pointer',
                  outline: color === c.name ? `3px solid ${c.hex}` : '2px solid transparent',
                  outlineOffset: 2, transition: 'outline 0.1s',
                }}
              />
            ))}
          </Group>
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
          {categories.length === 0 && (
            <Text size="sm" c="dimmed" ta="center">카테고리가 없어요.</Text>
          )}
          {categories.map(cat => {
            const hex = TCAT_COLORS.find(c => c.name === cat.color)?.hex ?? '#4F46E5'
            return (
              <Group key={cat.id} justify="space-between" px="xs" py={6}
                style={{ border: '1px solid var(--mantine-color-gray-2)', borderRadius: 8 }}>
                <Group gap="xs">
                  <Box style={{ width: 14, height: 14, borderRadius: '50%', background: hex }} />
                  <Text size="sm">{cat.name}</Text>
                  {cat.unit && <Text size="xs" c="dimmed">({cat.unit})</Text>}
                </Group>
                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => onDelete(cat.id)}>
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>
            )
          })}
        </Stack>
      </Stack>
    </Drawer>
  )
}
