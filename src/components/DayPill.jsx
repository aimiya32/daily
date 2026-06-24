import { Box, Text } from '@mantine/core'
import { DEFAULT_HEX } from '../lib/colors'
import styles from './DayPill.module.scss'

// 달력 칸 안에 표시하는 작은 알약 라벨
export function DayPill({ hex = DEFAULT_HEX, fontSize = '0.75rem', onClick, children }) {
  return (
    <Box
      onClick={onClick}
      className={styles.pill}
      style={{
        background: hex + '22',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      <Text truncate ta="center" className={styles.pillText} style={{ fontSize, color: hex }}>
        {children}
      </Text>
    </Box>
  )
}

// 달력 칸에 다 못 보여준 항목 수 (+N)
export function OverflowCount({ count }) {
  if (count <= 0) return null
  return (
    <Text c="dimmed" ta="center" className={styles.overflowText}>
      +{count}
    </Text>
  )
}
