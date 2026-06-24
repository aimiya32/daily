import {Box, Text, Paper, Flex} from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { WEEKDAYS_KO } from '../lib/dates'
import { useHolidays } from '../hooks/useHolidays'
import { getLunarLabel } from '../lib/lunar'
import styles from './CalendarGrid.module.scss'

export default function CalendarGrid({ current, today, onSelectDate, renderDayContent, hideToday = false }) {
  const isMobile = useMediaQuery('(max-width: 700px)')
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

  return (
    <Paper style={{ borderRadius: `0 0 ${radius}px ${radius}px`, overflow: 'hidden', border: '1px solid #E2E8F0', borderTop: 'none' }}>
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
        <Box key={wi} className={styles.weekRow}>
          {week.map((day, di) => {
            const isLast = wi === weeks.length - 1
            const borderRight = di < 6 ? '1px solid var(--mantine-color-gray-1)' : 'none'
            const borderBottom = !isLast ? '1px solid var(--mantine-color-gray-1)' : 'none'

            if (!day) {
              return (
                <Box key={di} className={styles.emptyCell} style={{ borderRight, borderBottom }} />
              )
            }

            const dateStr = day.format('YYYY-MM-DD')
            const isToday = !hideToday && dateStr === today
            const holidayName = holidays[dateStr]
            const isHoliday = !!holidayName
            const dateColor = isToday ? 'white' : (di === 0 || isHoliday) ? 'red.5' : di === 6 ? 'indigo.5' : 'gray.8'

            return (
              <Box
                key={di}
                onClick={() => onSelectDate?.(dateStr)}
                className={styles.dayCell}
                style={{
                  cursor: onSelectDate ? 'pointer' : 'default',
                  borderRight,
                  borderBottom,
                }}
              >
                <Flex align={'center'} justify={isMobile ? 'center' : 'flex-start'} style={{ marginLeft: isMobile ? 0 : 10 }}>
                  <Box className={styles.dateCircle} style={{ background: isToday ? 'var(--mantine-color-indigo-6)' : 'transparent' }}>
                    <Text size="xs" fw={isToday ? 700 : 400} c={dateColor}>
                      {day.date()}
                    </Text>
                  </Box>
                  {!isMobile && (
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
