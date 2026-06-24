import { Group, Box } from '@mantine/core'
import { CATEGORY_COLORS } from '../lib/colors'
import styles from './ColorSwatchPicker.module.scss'

// 카테고리 색상 선택 동그라미 팔레트
export default function ColorSwatchPicker({ value, onChange }) {
  return (
    <Group gap="xs">
      {CATEGORY_COLORS.map(c => (
        <Box
          key={c.name}
          onClick={() => onChange(c.name)}
          className={styles.swatch}
          style={{
            background: c.hex,
            outline: value === c.name ? `3px solid ${c.hex}` : '2px solid transparent',
          }}
        />
      ))}
    </Group>
  )
}

export function ColorDot({ hex, size = 14 }) {
  return <Box className={styles.colorDot} style={{ width: size, height: size, background: hex }} />
}
