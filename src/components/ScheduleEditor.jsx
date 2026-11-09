import { useState } from 'react'
import { Stack, TextInput, Textarea, Button, Group, Select, NumberInput, Text, Collapse, Box, Checkbox, SegmentedControl } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import ContentCard from './ContentCard'
import dayjs from 'dayjs'
import KoreanLunarCalendar from 'korean-lunar-calendar'
import { getLunarLabel } from '../lib/lunar'
import styles from './ScheduleEditor.module.scss'
import { getScheduleVisibility } from '../lib/scheduleVisibility'

const _cal = new KoreanLunarCalendar()

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/

// 숫자만 받아 입력 중 HH:MM 형태로 표시
function formatTimeTyping(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  return digits.length <= 2 ? digits : `${digits.slice(0, 2)}:${digits.slice(2)}`
}

// 입력 종료 시 정규화: "9" → "09:00", "930" → "09:30", "1430" → "14:30"
function normalizeTime(value) {
  const digits = value.replace(/\D/g, '')
  if (!digits) return ''
  let h, m
  if (digits.length <= 2) { h = digits; m = '00' }
  else if (digits.length === 3) { h = digits.slice(0, 1); m = digits.slice(1) }
  else { h = digits.slice(0, 2); m = digits.slice(2, 4) }
  return `${h.padStart(2, '0')}:${m}`
}

export default function ScheduleEditor({ schedule, categories, initialDate, onSave, onCancel }) {
  const [date, setDate] = useState(
    schedule ? dayjs(schedule.date).toDate()
    : initialDate ? dayjs(initialDate).toDate()
    : new Date()
  )
  const [visibility, setVisibility] = useState(schedule ? getScheduleVisibility(schedule) : 'monthly')
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
  const [applyToAll, setApplyToAll] = useState(false) // 반복 일정 전체에 수정 적용

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

  const [timeTouched, setTimeTouched] = useState(false)
  const timeValid = !time || TIME_RE.test(normalizeTime(time))
  const timeError = timeTouched && !timeValid ? '00:00 ~ 23:59 형식으로 입력하세요' : null

  function handleSave() {
    if (!title.trim()) return
    if (!timeValid) { setTimeTouched(true); return }
    onSave({
      id: schedule?.id ?? crypto.randomUUID(),
      recurrenceId: schedule?.recurrenceId,
      date: dayjs(date).format('YYYY-MM-DD'),
      time: normalizeTime(time) || null,
      visibility,
      title: title.trim(),
      description: description.trim() || null,
      categoryId: categoryId ?? null,
      updatedAt: new Date().toISOString(),
      yearlyRepeat: !schedule && yearlyRepeat,
      repeatMode: !schedule && yearlyRepeat ? repeatMode : undefined,
      repeatCount: !schedule && yearlyRepeat && repeatMode === 'count' ? repeatCount : undefined,
      lunarRecurrence: !schedule && yearlyRepeat ? lunarRecurrence : undefined,
      applyToAll: !!schedule && !!schedule.recurrenceId && applyToAll,
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
            <Box mt="xs" p="sm" className={styles.lunarBox}>
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
        <Select
          label="표시 위치"
          description="시간 입력 여부와 관계없이 선택한 곳에 표시됩니다."
          data={[
            { value: 'weekly', label: '주간' },
            { value: 'monthly', label: '월간' },
            { value: 'both', label: '둘 다' },
          ]}
          value={visibility}
          onChange={setVisibility}
          allowDeselect={false}
          required
        />

        <TextInput
          label="시간"
          placeholder="예: 1430 → 14:30"
          inputMode="numeric"
          autoComplete="off"
          maxLength={5}
          value={time}
          onChange={e => { setTime(formatTimeTyping(e.currentTarget.value)); setTimeTouched(false) }}
          onBlur={() => { setTime(normalizeTime(time)); setTimeTouched(true) }}
          error={timeError}
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

        {schedule && schedule.recurrenceId && (
          <Checkbox
            label="반복 일정 전체에 적용 (제목·시간·표시 위치·분류·내용)"
            checked={applyToAll}
            onChange={e => setApplyToAll(e.currentTarget.checked)}
          />
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
