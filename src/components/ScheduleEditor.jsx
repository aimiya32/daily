import { useState } from 'react'
import { Stack, TextInput, Textarea, Button, Group, Select, Paper } from '@mantine/core'
import { DatePickerInput, TimeInput } from '@mantine/dates'
import dayjs from 'dayjs'

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

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }))

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
    })
  }

  return (
    <Paper maw={640} mx="auto" radius="xl" shadow="sm" p="xl" style={{ background: 'white' }}>
      <Stack gap="lg">
        <DatePickerInput
          label="날짜"
          value={date}
          onChange={setDate}
          valueFormat="YYYY년 MM월 DD일"
          required
        />
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
    </Paper>
  )
}
