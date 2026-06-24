import { Popover, Group, Text } from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { useDisclosure } from '@mantine/hooks'
import { IconChevronDown } from '@tabler/icons-react'
import dayjs from 'dayjs'
import styles from './DatePopoverTitle.module.scss'

// 클릭하면 DatePicker 팝오버가 열리는 날짜 라벨. onChange에는 dayjs 객체를 넘긴다.
export default function DatePopoverTitle({ value, onChange, format = 'M월 D일 (ddd)' }) {
  const [opened, { toggle, close }] = useDisclosure(false)
  return (
    <Popover opened={opened} onChange={(o) => !o && close()} position="bottom-start" shadow="md" withArrow>
      <Popover.Target>
        <Group gap={4} align="center" wrap="nowrap" className={styles.trigger} onClick={toggle}>
          <Text fw={700} size="md" className={styles.titleNoWrap}>{dayjs(value).format(format)}</Text>
          <IconChevronDown size={15} color="var(--mantine-color-gray-6)" />
        </Group>
      </Popover.Target>
      <Popover.Dropdown>
        <DatePicker
          value={dayjs(value).toDate()}
          onChange={(v) => { if (v) { onChange(dayjs(v)); close() } }}
          locale="ko"
        />
      </Popover.Dropdown>
    </Popover>
  )
}
