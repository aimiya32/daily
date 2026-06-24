import { useState } from 'react'
import {
  Drawer, Stack, Group, Text, NumberInput, Button, Chip, Select,
} from '@mantine/core'
import { MonthPickerInput } from '@mantine/dates'
import { IconDeviceFloppy, IconTrash } from '@tabler/icons-react'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import './TrackerBulkPlan.module.scss'

dayjs.locale('ko')

const WEEKDAYS = [
  { v: '0', label: '일' }, { v: '1', label: '월' }, { v: '2', label: '화' },
  { v: '3', label: '수' }, { v: '4', label: '목' }, { v: '5', label: '금' }, { v: '6', label: '토' },
]

// 선택한 월에서 선택한 요일에 해당하는 모든 날짜(YYYY-MM-DD)
function matchingDates(month, weekdays) {
  const m = dayjs(month).startOf('month')
  const days = m.daysInMonth()
  const set = new Set(weekdays.map(Number))
  const out = []
  for (let d = 1; d <= days; d++) {
    const date = m.date(d)
    if (set.has(date.day())) out.push(date.format('YYYY-MM-DD'))
  }
  return out
}

export default function TrackerBulkPlan({ opened, onClose, categories, initialMonth, bulkSetPlanned }) {
  const [month, setMonth] = useState(initialMonth ? dayjs(initialMonth).toDate() : new Date())
  const [weekdays, setWeekdays] = useState([])
  const [catId, setCatId] = useState(categories[0]?.id ?? null)
  const [value, setValue] = useState('')

  const selectedId = categories.some(c => c.id === catId) ? catId : categories[0]?.id
  const cat = categories.find(c => c.id === selectedId)
  const dates = matchingDates(month, weekdays)
  const hasValue = value !== '' && value !== undefined && value !== null
  const canSave = !!cat && weekdays.length > 0 && dates.length > 0 && hasValue

  function handleSave() {
    if (!canSave) return
    bulkSetPlanned(dates.map(date => ({ categoryId: cat.id, date, planned: value })))
    onClose()
  }

  function handleDelete() {
    if (!cat || weekdays.length === 0 || dates.length === 0) return
    if (!confirm(`${dayjs(month).format('YYYY년 M월')}의 선택한 요일 '${cat.name}' 계획을 삭제할까요?`)) return
    bulkSetPlanned(dates.map(date => ({ categoryId: cat.id, date, planned: null })))
    onClose()
  }

  return (
    <Drawer opened={opened} onClose={onClose} title="일괄 계획 입력" position="right" size="sm" overlayProps={{ backgroundOpacity: 0 }}>
      <Stack gap="lg">
        <MonthPickerInput
          label="월 선택"
          value={month}
          onChange={setMonth}
          valueFormat="YYYY년 M월"
        />

        <Stack gap={6}>
          <Text size="sm" fw={500}>요일</Text>
          <Chip.Group multiple value={weekdays} onChange={setWeekdays}>
            <Group gap={6}>
              {WEEKDAYS.map(w => (
                <Chip key={w.v} value={w.v} size="sm" radius="xl" variant="light" color="teal">{w.label}</Chip>
              ))}
            </Group>
          </Chip.Group>
        </Stack>

        <Select
          label="카테고리"
          data={categories.map(c => ({ value: c.id, label: c.unit ? `${c.name} (${c.unit})` : c.name }))}
          value={selectedId}
          onChange={setCatId}
          allowDeselect={false}
        />

        <NumberInput
          label="계획"
          placeholder="0"
          value={value}
          onChange={setValue}
          min={0}
          hideControls
          suffix={cat?.unit ? ` ${cat.unit}` : ''}
        />

        <Text size="xs" c="dimmed">
          {dates.length > 0
            ? `선택한 ${dayjs(month).format('M월')}의 해당 요일 ${dates.length}일에 일괄 적용됩니다.`
            : '월과 요일을 선택하세요.'}
        </Text>

        <Group grow>
          <Button
            variant="light" color="red"
            leftSection={<IconTrash size={15} />}
            onClick={handleDelete}
            disabled={dates.length === 0}
          >
            계획 삭제
          </Button>
          <Button
            variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }}
            leftSection={<IconDeviceFloppy size={15} />}
            onClick={handleSave}
            disabled={!canSave}
          >
            계획 저장
          </Button>
        </Group>
      </Stack>
    </Drawer>
  )
}
