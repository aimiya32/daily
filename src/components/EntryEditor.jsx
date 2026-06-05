import { useState } from 'react'
import { Stack, Textarea, TextInput, Button, Group, Select, Paper } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { DatePickerInput } from '@mantine/dates'
import dayjs from 'dayjs'

export default function EntryEditor({ entry, onSave, onCancel, categories }) {
  const [date, setDate] = useState(entry ? dayjs(entry.date).toDate() : new Date())
  const [content, setContent] = useState(entry?.content ?? '')
  const [categoryId, setCategoryId] = useState(entry?.categoryId ?? null)
  const [tagsInput, setTagsInput] = useState((entry?.tags ?? []).join(', '))
  const isNarrow = useMediaQuery('(max-width: 500px)')

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }))

  function parseTags(str) {
    const seen = new Set()
    const out = []
    for (const t of str.split(',')) {
      const tag = t.trim()
      if (tag && !seen.has(tag)) { seen.add(tag); out.push(tag) }
    }
    return out
  }

  function handleSave() {
    if (!content.trim()) return
    onSave({
      id: entry?.id ?? crypto.randomUUID(),
      date: dayjs(date).format('YYYY-MM-DD'),
      content: content.trim(),
      categoryId: categoryId ?? null,
      tags: parseTags(tagsInput),
      updatedAt: new Date().toISOString(),
    })
  }

  return (
    <Paper maw={640} mx="auto" radius={isNarrow ? 'md' : 'xl'} shadow="sm" p="xl" style={{ background: 'white' }}>
      <Stack gap="lg">
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

        <TextInput
          label="태그"
          placeholder="쉼표로 구분 (예: 여행, 운동, 회고)"
          value={tagsInput}
          onChange={e => setTagsInput(e.currentTarget.value)}
        />

        <Textarea
          label="내용"
          placeholder="오늘 하루를 기록하세요..."
          value={content}
          onChange={e => setContent(e.currentTarget.value)}
          autosize
          minRows={12}
          maxRows={30}
          styles={{ input: { lineHeight: 1.9, fontSize: '0.9375rem' } }}
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
