import { useState, useEffect } from 'react'
import {
  Stack, Paper, Group, Text, Button, TextInput, Textarea,
  SegmentedControl, ActionIcon, Center, Chip, Box, FileButton,
} from '@mantine/core'
import {
  IconPlus, IconTrash, IconPhoto, IconX,
  IconPhone, IconPrinter, IconMail, IconWorld, IconNote,
} from '@tabler/icons-react'
import StoredImage from './StoredImage'
import { storeImageFile, deleteImage, getImage, putImage } from '../lib/imageStore'
import { uploadImageRecord } from '../lib/driveImages'

function parseTags(str) {
  const seen = new Set()
  const out = []
  for (const t of str.split(',')) {
    const tag = t.trim()
    if (tag && !seen.has(tag)) { seen.add(tag); out.push(tag) }
  }
  return out
}

export default function ContactsView({ items, onAdd, onDelete }) {
  const [tab, setTab] = useState('register') // register | list | tag
  const [selectedTag, setSelectedTag] = useState(null)

  // 등록 폼
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [fax, setFax] = useState('')
  const [email, setEmail] = useState('')
  const [sns, setSns] = useState('')
  const [note, setNote] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [pending, setPending] = useState(null) // 첨부 파일(미저장)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!pending) { setPreviewUrl(null); return }
    const url = URL.createObjectURL(pending)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [pending])

  const hasContent = [name, phone, fax, email, sns, note, tagsInput].some(v => v.trim()) || !!pending

  function resetForm() {
    setName(''); setPhone(''); setFax(''); setEmail(''); setSns(''); setNote(''); setTagsInput(''); setPending(null)
  }

  async function handleAdd() {
    if (!hasContent || saving) return
    setSaving(true)
    try {
      const images = []
      if (pending) {
        const id = await storeImageFile(pending, false)
        images.push(id)
        const rec = await getImage(id)
        if (rec) uploadImageRecord(id, rec).then(ok => { if (ok) putImage({ ...rec, uploaded: true }) })
      }
      onAdd({
        id: crypto.randomUUID(),
        name: name.trim(),
        phone: phone.trim(),
        fax: fax.trim(),
        email: email.trim(),
        sns: sns.trim(),
        note: note.trim(),
        tags: parseTags(tagsInput),
        images,
        updatedAt: new Date().toISOString(),
      })
      resetForm()
      setTab('list')
    } finally {
      setSaving(false)
    }
  }

  function fieldRow(Icon, value) {
    if (!value) return null
    return (
      <Group gap={6} wrap="nowrap" align="center">
        <Icon size={14} color="#94A3B8" style={{ flexShrink: 0 }} />
        <Text size="sm" c="#334155" style={{ wordBreak: 'break-all' }}>{value}</Text>
      </Group>
    )
  }

  function renderCard(c) {
    const imgId = c.images?.[0]
    return (
      <Paper key={c.id} radius={14} p="md" shadow="xs" style={{ background: 'white' }}>
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Group gap="md" wrap="nowrap" align="flex-start" style={{ minWidth: 0 }}>
            {imgId && (
              <Box style={{ width: 72, flexShrink: 0 }}>
                <StoredImage id={imgId} variant="thumb" height={72} radius={10} />
              </Box>
            )}
            <Stack gap={4} style={{ minWidth: 0 }}>
              <Text fw={700} size="md" c="#1E293B">{c.name || '(이름 없음)'}</Text>
              {fieldRow(IconPhone, c.phone)}
              {fieldRow(IconPrinter, c.fax)}
              {fieldRow(IconMail, c.email)}
              {fieldRow(IconWorld, c.sns ?? c.blog)}
              {fieldRow(IconNote, c.note)}
              {(c.tags ?? []).length > 0 && (
                <Text size="xs" c="#94A3B8">{(c.tags ?? []).map(t => `#${t}`).join(' ')}</Text>
              )}
            </Stack>
          </Group>
          <ActionIcon variant="subtle" color="red" size="sm" style={{ flexShrink: 0 }}
            onClick={() => { if (confirm('삭제할까요?')) onDelete(c.id) }}>
            <IconTrash size={15} />
          </ActionIcon>
        </Group>
      </Paper>
    )
  }

  const allTags = [...new Set(items.flatMap(c => c.tags ?? []))].sort((a, b) => a.localeCompare(b))
  const taggedItems = selectedTag ? items.filter(c => (c.tags ?? []).includes(selectedTag)) : []

  return (
    <Stack maw={800} mx="auto" gap="md">
      <Group justify="flex-start">
        <SegmentedControl
          size="sm" value={tab} onChange={setTab}
          data={[{ label: '등록', value: 'register' }, { label: '리스트', value: 'list' }, { label: '태그', value: 'tag' }]}
        />
      </Group>

      {/* 등록 */}
      {tab === 'register' && (
        <Paper radius={14} shadow="sm" p="lg" style={{ background: 'white' }}>
          <Stack gap="sm">
            {/* 이미지 */}
            <Group gap="sm" align="center">
              {previewUrl ? (
                <Box style={{ position: 'relative', width: 72, flexShrink: 0 }}>
                  <img src={previewUrl} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
                  <ActionIcon size={18} radius="xl" color="dark" variant="filled"
                    style={{ position: 'absolute', top: -6, right: -6, opacity: 0.9 }}
                    onClick={() => setPending(null)}>
                    <IconX size={11} />
                  </ActionIcon>
                </Box>
              ) : (
                <FileButton onChange={setPending} accept="image/*">
                  {(props) => (
                    <Button {...props} size="xs" variant="light" color="indigo" radius="md"
                      leftSection={<IconPhoto size={15} />}>
                      이미지 추가
                    </Button>
                  )}
                </FileButton>
              )}
            </Group>

            <TextInput label="이름" value={name} onChange={e => setName(e.currentTarget.value)} />
            <TextInput label="전화번호" value={phone} onChange={e => setPhone(e.currentTarget.value)} />
            <TextInput label="팩스" value={fax} onChange={e => setFax(e.currentTarget.value)} />
            <TextInput label="이메일" value={email} onChange={e => setEmail(e.currentTarget.value)} />
            <TextInput label="SNS" value={sns} onChange={e => setSns(e.currentTarget.value)} />
            <TextInput label="비고" value={note} onChange={e => setNote(e.currentTarget.value)} />
            <TextInput label="태그" value={tagsInput} onChange={e => setTagsInput(e.currentTarget.value)} />

            <Group justify="flex-end">
              <Button leftSection={<IconPlus size={14} />} onClick={handleAdd} loading={saving} disabled={!hasContent}>
                추가
              </Button>
            </Group>
          </Stack>
        </Paper>
      )}

      {/* 리스트 */}
      {tab === 'list' && (
        items.length === 0 ? (
          <Center mt="md"><Text c="dimmed" size="sm">등록된 연락처가 없어요.</Text></Center>
        ) : (
          <Stack gap="xs">{items.map(renderCard)}</Stack>
        )
      )}

      {/* 태그 */}
      {tab === 'tag' && (
        <Stack gap="md">
          {allTags.length === 0 ? (
            <Center mt="md"><Text c="dimmed" size="sm">사용된 태그가 없어요.</Text></Center>
          ) : (
            <Group gap="xs" wrap="wrap">
              {allTags.map(tag => (
                <Chip key={tag} checked={selectedTag === tag}
                  onChange={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  variant="light" color="grape" size="sm" radius="sm">
                  #{tag}
                </Chip>
              ))}
            </Group>
          )}
          {selectedTag && (
            taggedItems.length === 0
              ? <Center mt="md"><Text c="dimmed" size="sm">해당 태그의 연락처가 없어요.</Text></Center>
              : <Stack gap="xs">{taggedItems.map(renderCard)}</Stack>
          )}
        </Stack>
      )}
    </Stack>
  )
}
