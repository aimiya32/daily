import { Group, Box } from '@mantine/core'
import { CATEGORY_COLORS } from '../lib/colors'

// 카테고리 색상 선택 동그라미 팔레트
export default function ColorSwatchPicker({ value, onChange }) {
  return (
    <Group gap="xs">
      {CATEGORY_COLORS.map(c => (
        <Box
          key={c.name}
          onClick={() => onChange(c.name)}
          style={{
            width: 24, height: 24, borderRadius: '50%',
            background: c.hex, cursor: 'pointer',
            outline: value === c.name ? `3px solid ${c.hex}` : '2px solid transparent',
            outlineOffset: 2, transition: 'outline 0.1s',
          }}
        />
      ))}
    </Group>
  )
}

export function ColorDot({ hex, size = 14 }) {
  return <Box style={{ width: size, height: size, borderRadius: '50%', background: hex, flexShrink: 0 }} />
}
