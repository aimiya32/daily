import { Paper } from '@mantine/core'

// 상세/편집 화면 공통 카드
export default function ContentCard({ children }) {
  return (
    <Paper maw={640} mx="auto" radius={14} shadow="sm" p="xl" style={{ background: 'white' }}>
      {children}
    </Paper>
  )
}
