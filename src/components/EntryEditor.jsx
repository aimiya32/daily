import { useState } from 'react'
import { Stack, Textarea, Button, Group, Select, Paper } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import dayjs from 'dayjs'

export default function EntryEditor({ entry, onSave, onCancel, categories }) {
  const [date, setDate] = useState(entry ? dayjs(entry.date).toDate() : new Date())
  const [content, setContent] = useState(entry?.content ?? '')
  const [categoryId, setCategoryId] = useState(entry?.categoryId ?? null)

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }))

  function handleSave() {
    if (!content.trim()) return
    onSave({
      id: entry?.id ?? crypto.randomUUID(),
      date: dayjs(date).format('YYYY-MM-DD'),
      content: content.trim(),
      categoryId: categoryId ?? null,
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <Paper maw={640} mx="auto" radius="xl" shadow="sm" p="xl" style={{ background: 'white' }}>
      <Stack gap="lg">
        <Group grow>
          <DatePickerInput
            label="날짜"
            value={date}
            onChange={setDate}
            valueFormat="YYYY년 MM월 DD일"
            maxDate={new Date()}
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
        </Group>

        <Textarea
          label="내용"
          placeholder="오늘 하루를 기록하세요..."
          value={content}
          onChange={e => setContent(e.currentTarget.value)}
          autosize
          minRows={12}
          maxRows={30}
          styles={{ input: { lineHeight: 1.9, fontSize: 15 } }}
        />

        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onCancel}>취소</Button>
          <Button
            variant="gradient"
            gradient={{ from: 'indigo', to: 'violet' }}
            onClick={handleSave}
            disabled={!content.trim()}
          >
            저장
          </Button>
        </Group>
      </Stack>
    </Paper>
  )
}
