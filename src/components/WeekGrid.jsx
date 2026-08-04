import { Box, Paper, Stack, Text } from '@mantine/core'
import { WEEKDAYS_KO } from '../lib/dates'
import { useHolidays } from '../hooks/useHolidays'
import styles from './WeekGrid.module.scss'

export default function WeekGrid({ weekDays, today, selectedDate, onSelectDate, renderDayContent }) {
  // 주가 달을 걸칠 수 있어(예: 8/31~9/6) 첫날·마지막날 기준으로 두 번 조회해 병합한다
  const first = weekDays[0]
  const last = weekDays[weekDays.length - 1]
  const holidaysA = useHolidays(first.year(), first.month() + 1)
  const holidaysB = useHolidays(last.year(), last.month() + 1)
  const holidays = { ...holidaysA, ...holidaysB }

  return (
    <Paper style={{ borderRadius: '0 0 16px 16px', overflow: 'hidden', border: '1px solid #E2E8F0', borderTop: 'none' }}>
      <Stack gap={0}>
        {weekDays.map((day, di) => {
          const dateStr = day.format('YYYY-MM-DD')
          const isToday = dateStr === today
          const isSelected = selectedDate ? dateStr === selectedDate : false
          const holidayName = holidays[dateStr]
          const dateColor = isToday ? 'white' : holidayName ? 'red.5' : 'gray.8'

          return (
            <Box
              key={dateStr}
              onClick={() => onSelectDate?.(dateStr)}
              className={styles.dayRow}
              style={{
                background: isSelected ? '#EEF2FF' : 'white',
                borderBottom: di < 6 ? '1px solid var(--mantine-color-gray-1)' : 'none',
                cursor: onSelectDate ? 'pointer' : 'default',
              }}
            >
              <Stack gap={0} align="center" className={styles.dateStack}>
                <Text size="sm" fw={600} c={di === 0 ? 'red.5' : di === 6 ? 'blue.5' : 'gray.5'}>
                  {WEEKDAYS_KO[di]}
                </Text>
                <Box
                  className={styles.dateCircle}
                  style={{ background: isToday ? 'var(--mantine-color-blue-6)' : 'transparent' }}
                >
                  <Text size="md" fw={isToday ? 700 : 500} c={dateColor}>
                    {day.date()}
                  </Text>
                </Box>
              </Stack>

              <Box className={styles.dayContent}>
                {holidayName && (
                  <Text c="red.4" size="xs" className={styles.holidayLabel} truncate>
                    {holidayName}
                  </Text>
                )}
                {renderDayContent?.(dateStr, di)}
              </Box>
            </Box>
          )
        })}
      </Stack>
    </Paper>
  )
}
