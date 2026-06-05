import { Paper, Group, Box, ActionIcon, Text, Button, Popover } from '@mantine/core'
import { MonthPicker } from '@mantine/dates'
import { useMediaQuery, useDisclosure } from '@mantine/hooks'
import { IconChevronLeft, IconChevronRight, IconChevronDown } from '@tabler/icons-react'

export default function CalendarNav({ title, onPrev, onNext, onToday, rightSection, monthValue, onMonthSelect }) {
  const isNarrow = useMediaQuery('(max-width: 500px)')
  const radius = 14
  const [picker, { toggle: togglePicker, close: closePicker }] = useDisclosure(false)
  const isMonthPicker = !!onMonthSelect

  const centerDate = isMonthPicker ? (
    <Popover opened={picker} onChange={(o) => !o && closePicker()} position="bottom" shadow="md" withArrow>
      <Popover.Target>
        <Group gap={4} align="center" wrap="nowrap" style={{ cursor: 'pointer' }} onClick={togglePicker}>
          <Text fw={700} size="md" style={{ whiteSpace: 'nowrap' }}>{title}</Text>
          <IconChevronDown size={15} color="var(--mantine-color-gray-6)" />
        </Group>
      </Popover.Target>
      <Popover.Dropdown>
        <MonthPicker
          value={monthValue}
          onChange={(v) => { if (v) { onMonthSelect(v); closePicker() } }}
        />
      </Popover.Dropdown>
    </Popover>
  ) : (
    <Group gap={4} align="center" wrap="nowrap">
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
        borderRadius: `${radius}px ${radius}px 0 0`,
        background: 'white',
        boxShadow: '0 -1px 0 #E2E8F0 inset',
        border: '1px solid #E2E8F0',
        borderBottom: 'none',
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
