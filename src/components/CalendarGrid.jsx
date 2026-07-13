import {Box, Text, Paper, Flex} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { WEEKDAYS_KO } from '../lib/dates'
import { useHolidays } from '../hooks/useHolidays'
import { getLunarLabel } from '../lib/lunar'
import styles from './CalendarGrid.module.scss'

// wide=true: 모바일 뷰포트라도 부모가 가로 스크롤로 넓게 펴진 상태 → 날짜 정렬 등을 데스크톱 기준으로 렌더링
export default function CalendarGrid({ current, today, onSelectDate, renderDayContent, hideToday = false, standalone = false, selectedDate = null, wide = false }) {
  const isMobile = useMediaQuery('(max-width: 700px)') && !wide
  const holidays = useHolidays(current.year(), current.month() + 1)
  const firstDay = current.startOf('month')
  const startOffset = firstDay.day()
  const daysInMonth = current.daysInMonth()

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(current.date(d))
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const radius = 14

  // standalone=true면 패널 안에 심어 쓰는 플레인 스타일: 라운드·좌우 테두리 없이 상하 라인만, 음력·빈 칸 배경 생략.
  // 세로 플렉스로 부모 높이를 채우며 주 행들이 균등하게 늘어난다.
  const paperStyle = standalone
    ? { borderRadius: 0, borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }
    : { borderRadius: `0 0 ${radius}px ${radius}px`, overflow: 'hidden', border: '1px solid #E2E8F0', borderTop: 'none' }

  return (
    <Paper style={paperStyle}>
      <Box className={styles.grid7}>
        {WEEKDAYS_KO.map((d, i) => (
          <Box key={d} py={8} className={styles.weekHeader}>
            <Text size="xs" fw={600} c={i === 0 ? 'red.5' : i === 6 ? 'indigo.5' : 'gray.6'}>
              {d}
            </Text>
          </Box>
        ))}
      </Box>

      {weeks.map((week, wi) => (
        <Box key={wi} className={styles.weekRow} style={standalone ? { flex: 1 } : undefined}>
          {week.map((day, di) => {
            const isLast = wi === weeks.length - 1
            const borderRight = di < 6 ? '1px solid var(--mantine-color-gray-1)' : 'none'
            const borderBottom = !isLast ? '1px solid var(--mantine-color-gray-1)' : 'none'

            if (!day) {
              return (
                <Box key={di} className={`${styles.emptyCell} ${standalone ? styles.compactCell : ''}`}
                  style={{ borderRight, borderBottom, ...(standalone && { background: 'transparent' }) }} />
              )
            }

            const dateStr = day.format('YYYY-MM-DD')
            const isToday = !hideToday && dateStr === today
            const isSelected = selectedDate === dateStr
            const holidayName = holidays[dateStr]
            const isHoliday = !!holidayName
            const dateColor = isToday ? 'white' : (di === 0 || isHoliday) ? 'red.5' : di === 6 ? 'indigo.5' : 'gray.8'

            return (
              <Box
                key={di}
                onClick={() => onSelectDate?.(dateStr)}
                className={`${styles.dayCell} ${standalone ? styles.compactCell : ''}`}
                style={{
                  cursor: onSelectDate ? 'pointer' : 'default',
                  borderRight,
                  borderBottom,
                  // 오늘은 원형 배지로 이미 표시되므로 사각 선택 배경을 깔지 않는다
                  background: isSelected && !isToday ? '#EEF2FF' : undefined,
                }}
              >
                <Flex align={'center'} justify={isMobile ? 'center' : 'flex-start'} style={{ marginLeft: isMobile ? 0 : 10 }}>
                  <Box className={styles.dateCircle} style={{ background: isToday ? 'var(--mantine-color-indigo-6)' : 'transparent' }}>
                    <Text size="xs" fw={isToday ? 700 : 400} c={dateColor}>
                      {day.date()}
                    </Text>
                  </Box>
                  {!isMobile && !standalone && (
                    <Text c="gray.6" ta="center" className={styles.lunarLabel}>
                      ({getLunarLabel(day.year(), day.month() + 1, day.date())})
                    </Text>
                  )}
                </Flex>

                {holidayName && (
                  <Text c="red.4" ta="center" className={styles.holidayLabel} truncate>
                    {holidayName}
                  </Text>
                )}

                <Box className={styles.dayContent}>
                  {renderDayContent?.(dateStr, di)}
                </Box>
              </Box>
            )
          })}
        </Box>
      ))}
    </Paper>
  )
}
