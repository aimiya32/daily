import { useState } from 'react'
import {
  Stack, Textarea, TextInput, Button, Group, Select, Paper,
  Checkbox, FileButton, Box, ActionIcon, Badge,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconPhoto, IconX } from '@tabler/icons-react'
import StoredImage from './StoredImage'
import { storeImageFile, deleteImage, getImage, putImage } from '../lib/imageStore'
import { uploadImageRecord } from '../lib/driveImages'
import dayjs from 'dayjs'

export default function EntryEditor({ entry, onSave, onCancel, categories }) {
  const [date, setDate] = useState(entry ? dayjs(entry.date).toDate() : new Date())
  const [content, setContent] = useState(entry?.content ?? '')
  const [categoryId, setCategoryId] = useState(entry?.categoryId ?? null)
  const [tagsInput, setTagsInput] = useState((entry?.tags ?? []).join(', '))
  const [imageIds, setImageIds] = useState(entry?.images ?? [])  // 이미 저장된 이미지
  const [removedIds, setRemovedIds] = useState([])               // 저장 시 삭제할 기존 이미지
  const [pending, setPending] = useState([])                     // { key, file } 미저장 첨부
  const [keepOriginal, setKeepOriginal] = useState(false)
  const [saving, setSaving] = useState(false)

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

  // 첨부: 저장 전까지는 파일만 보관(저장/업로드 안 함)
  function handleFiles(files) {
    const list = Array.isArray(files) ? files : files ? [files] : []
    const items = list
      .filter(f => f.type?.startsWith('image/'))
      .map(f => ({ key: crypto.randomUUID(), file: f }))
    if (items.length) setPending(prev => [...prev, ...items])
  }

  function removeExisting(id) {
    setImageIds(prev => prev.filter(x => x !== id))
    setRemovedIds(prev => [...prev, id])
  }

  function removePending(key) {
    setPending(prev => prev.filter(p => p.key !== key))
  }

  async function handleSave() {
    if (!content.trim() || saving) return
    setSaving(true)
    try {
      // 1) 새로 첨부한 파일을 이제 IndexedDB 저장 + Drive 업로드
      const newIds = []
      for (const p of pending) {
        const id = await storeImageFile(p.file, keepOriginal)
        newIds.push(id)
        const rec = await getImage(id)
        if (rec) uploadImageRecord(id, rec).then(ok => { if (ok) putImage({ ...rec, uploaded: true }) })
      }
      // 2) 제거 표시된 기존 이미지 삭제
      for (const id of removedIds) await deleteImage(id)

      onSave({
        id: entry?.id ?? crypto.randomUUID(),
        date: dayjs(date).format('YYYY-MM-DD'),
        content: content.trim(),
        categoryId: categoryId ?? null,
        tags: parseTags(tagsInput),
        images: [...imageIds, ...newIds],
        updatedAt: new Date().toISOString(),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Paper maw={640} mx="auto" radius={14} shadow="sm" p="xl" style={{ background: 'white' }}>
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

        {/* 이미지 첨부 */}
        <Stack gap="xs">
          {/* 썸네일(기존) / 첨부 버튼 / 원본 체크박스 한 줄 */}
          <Group gap="xs" wrap="nowrap" align="center" style={{ overflowX: 'auto', paddingTop: 4 }}>
            {imageIds.map(id => (
              <Box key={id} style={{ position: 'relative', width: 46, flexShrink: 0 }}>
                <StoredImage id={id} variant="thumb" height={46} radius={6} />
                <ActionIcon
                  size={16} radius="xl" color="dark" variant="filled"
                  style={{ position: 'absolute', top: -5, right: -5, opacity: 0.9 }}
                  onClick={() => removeExisting(id)}
                >
                  <IconX size={10} />
                </ActionIcon>
              </Box>
            ))}
            <FileButton onChange={handleFiles} accept="image/*" multiple>
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
          {pending.length > 0 && (
            <Group gap="xs" wrap="wrap">
              {pending.map(p => (
                <Badge
                  key={p.key}
                  variant="outline" color="indigo" radius="sm" size="lg"
                  style={{ maxWidth: 180, textTransform: 'none', background: '#fff', borderColor: 'var(--mantine-color-indigo-2)', color: 'var(--mantine-color-indigo-7)' }}
                  styles={{ label: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 400, fontSize: '0.62rem' } }}
                  rightSection={
                    <ActionIcon size={14} radius="xl" variant="transparent" color="indigo" onClick={() => removePending(p.key)}>
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
    </Paper>
  )
}
