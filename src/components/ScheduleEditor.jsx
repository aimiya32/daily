import { useState } from 'react'
import { Stack, TextInput, Textarea, Button, Group, Select, NumberInput, Text, Collapse, Box, Checkbox, SegmentedControl } from '@mantine/core'
import { DatePickerInput, TimeInput } from '@mantine/dates'
import ContentCard from './ContentCard'
import dayjs from 'dayjs'
import KoreanLunarCalendar from 'korean-lunar-calendar'
import { getLunarLabel } from '../lib/lunar'

const _cal = new KoreanLunarCalendar()

export default function ScheduleEditor({ schedule, categories, initialDate, onSave, onCancel }) {
  const [date, setDate] = useState(
    schedule ? dayjs(schedule.date).toDate()
    : initialDate ? dayjs(initialDate).toDate()
    : new Date()
  )
  const [time, setTime] = useState(schedule?.time ?? '')
  const [title, setTitle] = useState(schedule?.title ?? '')
  const [description, setDescription] = useState(schedule?.description ?? '')
  const [categoryId, setCategoryId] = useState(schedule?.categoryId ?? null)
  const [lunarMonth, setLunarMonth] = useState('')
  const [lunarDay, setLunarDay] = useState('')
  const [lunarInputOpen, setLunarInputOpen] = useState(false)
  const [lunarRecurrence, setLunarRecurrence] = useState(null) // { month, day } 음력 입력으로 설정된 경우
  const [yearlyRepeat, setYearlyRepeat] = useState(false)
  const [repeatMode, setRepeatMode] = useState('indefinite') // indefinite | count
  const [repeatCount, setRepeatCount] = useState(10)

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }))

  const selectedDayjs = dayjs(date)
  const lunarLabel = getLunarLabel(selectedDayjs.year(), selectedDayjs.month() + 1, selectedDayjs.date())

  function applyLunar() {
    const y = selectedDayjs.year()
    const m = Number(lunarMonth)
    const d = Number(lunarDay)
    if (!m || !d) return
    if (!_cal.setLunarDate(y, m, d, false)) return
    const { year, month, day } = _cal.getSolarCalendar()
    setDate(new Date(year, month - 1, day))
    setLunarRecurrence({ month: m, day: d })
    setLunarMonth('')
    setLunarDay('')
    setLunarInputOpen(false)
  }

  function handleSave() {
    if (!title.trim()) return
    onSave({
      id: schedule?.id ?? crypto.randomUUID(),
      date: dayjs(date).format('YYYY-MM-DD'),
      time: time || null,
      title: title.trim(),
      description: description.trim() || null,
      categoryId: categoryId ?? null,
      updatedAt: new Date().toISOString(),
      yearlyRepeat: !schedule && yearlyRepeat,
      repeatMode: !schedule && yearlyRepeat ? repeatMode : undefined,
      repeatCount: !schedule && yearlyRepeat && repeatMode === 'count' ? repeatCount : undefined,
      lunarRecurrence: !schedule && yearlyRepeat ? lunarRecurrence : undefined,
    })
  }

  return (
    <ContentCard>
      <Stack gap="lg">
        <div>
          <DatePickerInput
            label="날짜"
            value={date}
            onChange={(v) => { setDate(v); setLunarRecurrence(null) }}
            valueFormat="YYYY년 MM월 DD일"
            firstDayOfWeek={0}
            getDayProps={(d) => {
              const day = d.getDay()
              if (day === 6) return { style: { color: '#1c7ed6' } }
              if (day === 0) return { style: { color: '#e03131' } }
              return {}
            }}
            required
          />
          {lunarLabel && (
            <Text size="xs" c="gray.5" mt={4}>음력 {lunarLabel}</Text>
          )}
          <Button
            variant="outline" color="gray" size="xs" mt={6}
            px="sm" style={{ borderColor: 'var(--mantine-color-gray-3)' }}
            onClick={() => setLunarInputOpen(o => !o)}
          >
            음력으로 입력하기
          </Button>
          <Collapse in={lunarInputOpen}>
            <Box mt="xs" p="sm" style={{ border: '1px solid var(--mantine-color-gray-2)', borderRadius: 8, background: 'var(--mantine-color-gray-0)' }}>
              <Group gap="xs" align="flex-end">
                <NumberInput
                  label="음력 월"
                  placeholder="월"
                  min={1} max={12}
                  value={lunarMonth}
                  onChange={setLunarMonth}
                  style={{ width: 80 }}
                  hideControls
                />
                <NumberInput
                  label="음력 일"
                  placeholder="일"
                  min={1} max={30}
                  value={lunarDay}
                  onChange={setLunarDay}
                  style={{ width: 80 }}
                  hideControls
                />
                <Button variant="light" color="indigo" size="xs" mb={1} onClick={applyLunar}>
                  변환
                </Button>
              </Group>
            </Box>
          </Collapse>
        </div>
        <TimeInput
          label="시간"
          value={time}
          onChange={e => setTime(e.currentTarget.value)}
        />

        <TextInput
          label="제목"
          placeholder="일정 제목을 입력하세요"
          value={title}
          onChange={e => setTitle(e.currentTarget.value)}
          required
        />

        <Select
          label="카테고리"
          placeholder="선택 안함"
          data={catOptions}
          value={categoryId}
          onChange={setCategoryId}
          clearable
        />

        <Textarea
          label="내용"
          placeholder="상세 내용 (선택)"
          value={description}
          onChange={e => setDescription(e.currentTarget.value)}
          autosize
          minRows={4}
        />

        {!schedule && (
          <Box>
            <Checkbox
              label="매년 등록"
              description={lunarRecurrence ? `음력 ${lunarRecurrence.month}월 ${lunarRecurrence.day}일 기준으로 매년 양력 날짜 자동 계산` : undefined}
              checked={yearlyRepeat}
              onChange={e => setYearlyRepeat(e.currentTarget.checked)}
            />
            <Collapse in={yearlyRepeat}>
              <Box mt="sm" pl={28}>
                <SegmentedControl
                  size="xs"
                  value={repeatMode}
                  onChange={setRepeatMode}
                  data={[
                    { label: '무기한', value: 'indefinite' },
                    { label: '반복 횟수', value: 'count' },
                  ]}
                />
                {repeatMode === 'count' && (
                  <Group gap="xs" align="center" mt="xs">
                    <NumberInput
                      value={repeatCount}
                      onChange={setRepeatCount}
                      min={1} max={100}
                      style={{ width: 80 }}
                      hideControls
                    />
                    <Text size="sm" c="gray.6">년</Text>
                  </Group>
                )}
              </Box>
            </Collapse>
          </Box>
        )}

        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onCancel}>취소</Button>
          <Button
            variant="gradient"
            gradient={{ from: 'violet', to: 'grape' }}
            onClick={handleSave}
            disabled={!title.trim()}
          >
            저장
          </Button>
        </Group>
      </Stack>
    </ContentCard>
  )
}
