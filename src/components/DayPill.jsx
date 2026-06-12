import { Box, Text } from '@mantine/core'
import { DEFAULT_HEX } from '../lib/colors'

// 달력 칸 안에 표시하는 작은 알약 라벨
export function DayPill({ hex = DEFAULT_HEX, fontSize = '0.75rem', onClick, children }) {
  return (
    <Box
      onClick={onClick}
      style={{
        background: hex + '22',
        borderRadius: 4,
        padding: '2px 6px',
        width: '100%',
        cursor: onClick ? 'pointer' : undefined,
      }}
    >
      <Text truncate ta="center" style={{ fontSize, color: hex, fontWeight: 700, lineHeight: 1.4 }}>
        {children}
      </Text>
    </Box>
  )
}

// 달력 칸에 다 못 보여준 항목 수 (+N)
export function OverflowCount({ count }) {
  if (count <= 0) return null
  return (
    <Text c="dimmed" ta="center" style={{ fontSize: '0.625rem', lineHeight: 1.4 }}>
      +{count}
    </Text>
  )
}
