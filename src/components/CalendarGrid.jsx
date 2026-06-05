import { Box, Text, Paper } from '@mantine/core'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'

dayjs.locale('ko')

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function CalendarGrid({
  current,
  today,
  selectedDate,
  onSelectDate,
  dayCellStyle,
  renderDayContent,
  hideToday = false,
  stretchCells = true,
}) {
  const firstDay = current.startOf('month')
  const startOffset = firstDay.day()
  const daysInMonth = current.daysInMonth()

  const cells = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(current.date(d))
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  const cellStyle = dayCellStyle ?? { minHeight: 72 }

  const radius = 14

  return (
    <Paper style={{ borderRadius: `0 0 ${radius}px ${radius}px`, overflow: 'hidden', border: '1px solid #E2E8F0', borderTop: 'none' }}>
      <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {WEEKDAYS.map((d, i) => (
          <Box key={d} py={8} style={{
            textAlign: 'center',
            background: 'var(--mantine-color-gray-0)',
            borderBottom: '1px solid var(--mantine-color-gray-2)',
          }}>
            <Text size="xs" fw={600} c={i === 0 ? 'red.5' : i === 6 ? 'indigo.5' : 'gray.6'}>
              {d}
            </Text>
          </Box>
        ))}
      </Box>

      {weeks.map((week, wi) => (
        <Box key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', alignItems: stretchCells ? 'stretch' : 'start' }}>
          {week.map((day, di) => {
            const isLast = wi === weeks.length - 1
            const borderRight = di < 6 ? '1px solid var(--mantine-color-gray-1)' : 'none'
            const borderBottom = !isLast ? '1px solid var(--mantine-color-gray-1)' : 'none'

            if (!day) {
              return (
                <Box key={di} style={{
                  ...cellStyle,
                  alignSelf: stretchCells ? 'stretch' : 'start',
                  background: 'var(--mantine-color-gray-0)',
                  borderRight,
                  borderBottom,
                }} />
              )
            }

            const dateStr = day.format('YYYY-MM-DD')
            const isToday = !hideToday && dateStr === today
            const isSelected = selectedDate ? dateStr === selectedDate : false

            return (
              <Box
                key={di}
                onClick={() => onSelectDate?.(dateStr)}
                style={{
                  ...cellStyle,
                  alignSelf: stretchCells ? 'stretch' : 'start',
                  padding: '6px 4px',
                  background: isSelected ? '#EEF2FF' : 'white',
                  cursor: onSelectDate ? 'pointer' : 'default',
                  overflow: 'hidden',
                  borderRight,
                  borderBottom,
                }}
              >
                <Box style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: isToday ? 'var(--mantine-color-indigo-6)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 4px',
                }}>
                  <Text
                    size="xs"
                    fw={isToday ? 700 : 400}
                    c={isToday ? 'white' : di === 0 ? 'red.5' : di === 6 ? 'indigo.5' : 'gray.8'}
                  >
                    {day.date()}
                  </Text>
                </Box>

                <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 2, textAlign: 'center' }}>
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
