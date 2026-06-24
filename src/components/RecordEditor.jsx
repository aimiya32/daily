import { useState } from 'react'
import {
  Stack, Textarea, TextInput, Button, Group, Select,
  Checkbox, FileButton, Box, ActionIcon, Badge,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconPhoto, IconX } from '@tabler/icons-react'
import StoredImage from './StoredImage'
import ContentCard from './ContentCard'
import { useImageAttachments } from '../hooks/useImageAttachments'
import { parseTags } from '../lib/tags'
import dayjs from 'dayjs'
import styles from './RecordEditor.module.scss'

export default function RecordEditor({ record, onSave, onCancel, categories }) {
  const [date, setDate] = useState(record ? dayjs(record.date).toDate() : new Date())
  const [title, setTitle] = useState(record?.title ?? '')
  const [content, setContent] = useState(record?.content ?? '')
  const [categoryId, setCategoryId] = useState(record?.categoryId ?? null)
  const [tagsInput, setTagsInput] = useState((record?.tags ?? []).join(', '))
  const [keepOriginal, setKeepOriginal] = useState(false)
  const [saving, setSaving] = useState(false)
  const images = useImageAttachments(record?.images ?? [])

  const catOptions = categories.map(c => ({ value: c.id, label: c.name }))

  async function handleSave() {
    if (!content.trim() || saving) return
    setSaving(true)
    try {
      const added = await images.commit({ keepOriginal })
      onSave({
        id: record?.id ?? crypto.randomUUID(),
        date: dayjs(date).format('YYYY-MM-DD'),
        title: title.trim() || null,
        content: content.trim(),
        categoryId: categoryId ?? null,
        tags: parseTags(tagsInput),
        images: [...images.keptExisting, ...added.map(a => a.id)],
        updatedAt: new Date().toISOString(),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ContentCard>
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
          label="제목"
          placeholder="제목 (선택)"
          value={title}
          onChange={e => setTitle(e.currentTarget.value)}
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

        {/* 이미지 첨부 */}
        <Stack gap="xs">
          {/* 썸네일(기존) / 첨부 버튼 / 원본 체크박스 한 줄 */}
          <Group gap="xs" wrap="nowrap" align="center" className={styles.attachRow}>
            {images.keptExisting.map(id => (
              <Box key={id} className={styles.thumbWrap}>
                <StoredImage id={id} variant="thumb" height={46} radius={6} />
                <ActionIcon
                  size={16} radius="xl" color="dark" variant="filled"
                  className={styles.removeBtn}
                  onClick={() => images.removeExisting(id)}
                >
                  <IconX size={10} />
                </ActionIcon>
              </Box>
            ))}
            <FileButton onChange={images.addFiles} accept="image/*" multiple>
              {(props) => (
                <Button {...props} size="xs" variant="light" color="indigo" radius="md"
                  leftSection={<IconPhoto size={15} />} style={{ flexShrink: 0 }}>
                  이미지 첨부
                </Button>
              )}
            </FileButton>
            <Checkbox
              size="xs"
              label="원본 크기로 업로드"
              checked={keepOriginal}
              onChange={e => setKeepOriginal(e.currentTarget.checked)}
              style={{ flexShrink: 0 }}
              styles={{ label: { whiteSpace: 'nowrap', paddingInlineStart: 6 } }}
            />
          </Group>

          {/* 첨부된 파일명 (저장 전) — 흰 배경 + 테두리, 아래에 표시 */}
          {images.pending.length > 0 && (
            <Group gap="xs" wrap="wrap">
              {images.pending.map(p => (
                <Badge
                  key={p.key}
                  variant="outline" color="indigo" radius="sm" size="lg"
                  style={{ maxWidth: 180, textTransform: 'none', background: '#fff', borderColor: 'var(--mantine-color-indigo-2)', color: 'var(--mantine-color-indigo-7)' }}
                  styles={{ label: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 400, fontSize: '0.62rem' } }}
                  rightSection={
                    <ActionIcon size={14} radius="xl" variant="transparent" color="indigo" onClick={() => images.removePending(p.key)}>
                      <IconX size={11} />
                    </ActionIcon>
                  }
                >
                  {p.file.name}
                </Badge>
              ))}
            </Group>
          )}
        </Stack>

        <Group justify="flex-end">
          <Button variant="subtle" color="gray" onClick={onCancel}>취소</Button>
          <Button
            variant="gradient"
            gradient={{ from: 'indigo', to: 'violet' }}
            onClick={handleSave}
            loading={saving}
            disabled={!content.trim()}
          >
            저장
          </Button>
        </Group>
      </Stack>
    </ContentCard>
  )
}
