import { Paper, Group, Box, ActionIcon, Text, Button, Popover } from '@mantine/core'
import { MonthPicker } from '@mantine/dates'
import { useMediaQuery, useDisclosure } from '@mantine/hooks'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'
import dayjs from 'dayjs'

export default function CalendarNav({ title, onPrev, onNext, onToday, rightSection, monthValue, onMonthSelect, standalone = false }) {
  const isNarrow = useMediaQuery('(max-width: 500px)')
  const radius = 14
  const [picker, { toggle: togglePicker, close: closePicker }] = useDisclosure(false)
  const isMonthPicker = !!onMonthSelect

  const centerDate = isMonthPicker ? (
    <Group gap="md" align="center" wrap="nowrap">
      <ActionIcon variant="subtle" color="gray" radius="xl"
        onClick={() => onMonthSelect(dayjs(monthValue).subtract(1, 'month').toDate())}>
        <IconChevronLeft size={16} />
      </ActionIcon>
      <Popover opened={picker} onChange={(o) => !o && closePicker()} position="bottom" shadow="md" withArrow>
        <Popover.Target>
          <Text fw={700} size="md" style={{ whiteSpace: 'nowrap', cursor: 'pointer' }} onClick={togglePicker}>{title}</Text>
        </Popover.Target>
        <Popover.Dropdown>
          <MonthPicker
            value={monthValue}
            monthsListFormat="M월"
            onChange={(v) => { if (v) { onMonthSelect(v); closePicker() } }}
          />
        </Popover.Dropdown>
      </Popover>
      <ActionIcon variant="subtle" color="gray" radius="xl"
        onClick={() => onMonthSelect(dayjs(monthValue).add(1, 'month').toDate())}>
        <IconChevronRight size={16} />
      </ActionIcon>
    </Group>
  ) : (
    <Group gap="md" align="center" wrap="nowrap">
      <ActionIcon variant="subtle" color="gray" radius="xl" onClick={onPrev}>
        <IconChevronLeft size={16} />
      </ActionIcon>
      <Text fw={700} size="md" style={{ whiteSpace: 'nowrap' }}>{title}</Text>
      <ActionIcon variant="subtle" color="gray" radius="xl" onClick={onNext}>
        <IconChevronRight size={16} />
      </ActionIcon>
    </Group>
  )

  const rightGroup = (
    <Group gap="xs" wrap="nowrap" style={{ marginLeft: 'auto', zIndex: 1 }}>
      {rightSection}
      <Button size="xs" variant="light" color="indigo" radius="xl" onClick={onToday}>
        오늘
      </Button>
    </Group>
  )

  return (
    <Paper
      px={isNarrow ? 'sm' : 'lg'}
      py="md"
      style={{
        borderRadius: standalone ? radius : `${radius}px ${radius}px 0 0`,
        background: 'white',
        boxShadow: standalone ? undefined : '0 -1px 0 #E2E8F0 inset',
        border: '1px solid #E2E8F0',
        borderBottom: standalone ? '1px solid #E2E8F0' : 'none',
      }}
    >
      <Box style={{ position: 'relative', display: 'flex', alignItems: 'center', minHeight: 30 }}>
        {isMonthPicker ? (
          /* 월 달력: 날짜 화면 가운데, 오늘 최우측 */
          <>
            <Box style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
              {centerDate}
            </Box>
            {rightGroup}
          </>
        ) : (
          /* 주간: 날짜 왼쪽 정렬(한 줄), 오늘 최우측 */
          <>
            {centerDate}
            {rightGroup}
          </>
        )}
      </Box>
    </Paper>
  )
}
