import { Box, Paper, Stack, Text } from '@mantine/core'
import { WEEKDAYS_KO } from '../lib/dates'

export default function WeekGrid({ weekDays, today, selectedDate, onSelectDate, renderDayContent }) {
  return (
    <Paper style={{ borderRadius: '0 0 16px 16px', overflow: 'hidden', border: '1px solid #E2E8F0', borderTop: 'none' }}>
      <Stack gap={0}>
        {weekDays.map((day, di) => {
          const dateStr = day.format('YYYY-MM-DD')
          const isToday = dateStr === today
          const isSelected = selectedDate ? dateStr === selectedDate : false

          return (
            <Box
              key={dateStr}
              onClick={() => onSelectDate?.(dateStr)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '12px 16px',
                background: isSelected ? '#EEF2FF' : 'white',
                borderBottom: di < 6 ? '1px solid var(--mantine-color-gray-1)' : 'none',
                cursor: onSelectDate ? 'pointer' : 'default',
              }}
            >
              <Stack gap={0} align="center" style={{ width: 48, flexShrink: 0 }}>
                <Text size="sm" fw={600} c={di === 0 ? 'red.5' : di === 6 ? 'blue.5' : 'gray.5'}>
                  {WEEKDAYS_KO[di]}
                </Text>
                <Box style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: isToday ? 'var(--mantine-color-blue-6)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text size="md" fw={isToday ? 700 : 500} c={isToday ? 'white' : 'gray.8'}>
                    {day.date()}
                  </Text>
                </Box>
              </Stack>

              <Box style={{ flex: 1, paddingTop: 6 }}>
                {renderDayContent?.(dateStr, di)}
              </Box>
            </Box>
          )
        })}
      </Stack>
    </Paper>
  )
}
