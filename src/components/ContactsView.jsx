import { useState, useEffect } from 'react'
import {
  Stack, Paper, Group, Text, Button, TextInput,
  SegmentedControl, ActionIcon, Center, Chip, Box, FileButton, SimpleGrid,
} from '@mantine/core'
import {
  IconPlus, IconTrash, IconPencil, IconPhoto, IconX,
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

// 파일의 원본 가로/세로 크기 읽기
function readImageSize(file) {
  return new Promise(resolve => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => { URL.revokeObjectURL(url); resolve({ w: img.naturalWidth, h: img.naturalHeight }) }
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null) }
    img.src = url
  })
}

export default function ContactsView({ items, onAdd, onUpdate, onDelete }) {
  const [tab, setTab] = useState('register') // register | list | tag
  const [selectedTag, setSelectedTag] = useState(null)
  const [expandedId, setExpandedId] = useState(null) // 펼쳐진 카드(하나만)

  // 등록/수정 폼
  const [editingId, setEditingId] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [fax, setFax] = useState('')
  const [email, setEmail] = useState('')
  const [sns, setSns] = useState('')
  const [note, setNote] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [existingIds, setExistingIds] = useState([])   // 수정 시 기존 이미지 id
  const [existingMeta, setExistingMeta] = useState({})
  const [removedIds, setRemovedIds] = useState([])     // 저장 시 삭제할 기존 이미지
  const [pending, setPending] = useState([])           // [{ key, file }]
  const [previews, setPreviews] = useState({})         // key -> objectURL
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const urls = pending.map(p => ({ key: p.key, url: URL.createObjectURL(p.file) }))
    setPreviews(Object.fromEntries(urls.map(u => [u.key, u.url])))
    return () => urls.forEach(u => URL.revokeObjectURL(u.url))
  }, [pending])

  const keptExisting = existingIds.filter(id => !removedIds.includes(id))
  const hasContent = [name, phone, fax, email, sns, note, tagsInput].some(v => v.trim()) || pending.length > 0 || keptExisting.length > 0

  function resetForm() {
    setEditingId(null)
    setName(''); setPhone(''); setFax(''); setEmail(''); setSns(''); setNote(''); setTagsInput('')
    setExistingIds([]); setExistingMeta({}); setRemovedIds([]); setPending([])
  }

  function startEdit(c) {
    setEditingId(c.id)
    setName(c.name ?? ''); setPhone(c.phone ?? ''); setFax(c.fax ?? ''); setEmail(c.email ?? '')
    setSns(c.sns ?? c.blog ?? ''); setNote(c.note ?? ''); setTagsInput((c.tags ?? []).join(', '))
    setExistingIds(c.images ?? []); setExistingMeta(c.imageMeta ?? {}); setRemovedIds([]); setPending([])
    setTab('register')
    setExpandedId(null)
  }

  function handleFiles(files) {
    const list = Array.isArray(files) ? files : files ? [files] : []
    const imgs = list.filter(f => f.type?.startsWith('image/')).map(f => ({ key: crypto.randomUUID(), file: f }))
    if (imgs.length) setPending(prev => [...prev, ...imgs])
  }

  function removePending(key) {
    setPending(prev => prev.filter(p => p.key !== key))
  }

  function removeExisting(id) {
    setRemovedIds(prev => [...prev, id])
  }

  async function handleSubmit() {
    if (!hasContent || saving) return
    setSaving(true)
    try {
      const newImages = []
      const newMeta = {}
      for (const p of pending) {
        const id = await storeImageFile(p.file, false)
        newImages.push(id)
        const size = await readImageSize(p.file)
        if (size) newMeta[id] = size
        const rec = await getImage(id)
        if (rec) uploadImageRecord(id, rec).then(ok => { if (ok) putImage({ ...rec, uploaded: true }) })
      }
      for (const id of removedIds) await deleteImage(id)

      const images = [...keptExisting, ...newImages]
      const imageMeta = {}
      for (const id of keptExisting) if (existingMeta[id]) imageMeta[id] = existingMeta[id]
      Object.assign(imageMeta, newMeta)

      const payload = {
        id: editingId ?? crypto.randomUUID(),
        name: name.trim(),
        phone: phone.trim(),
        fax: fax.trim(),
        email: email.trim(),
        sns: sns.trim(),
        note: note.trim(),
        tags: parseTags(tagsInput),
        images,
        imageMeta,
        updatedAt: new Date().toISOString(),
      }
      if (editingId) onUpdate(payload)
      else onAdd(payload)

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

  function renderImages(c) {
    const ids = c.images ?? []
    if (ids.length === 0) return null
    const meta = c.imageMeta ?? {}
    const portraits = ids.filter(id => { const m = meta[id]; return m && m.h > m.w })
    const landscapes = ids.filter(id => !portraits.includes(id)) // 가로 또는 크기 미상
    const imgStyle = { height: 'auto', objectFit: 'contain' }
    return (
      <Stack gap="xs">
        {landscapes.map(id => (
          <StoredImage key={id} id={id} variant="thumb" height="auto" radius={10} style={imgStyle} />
        ))}
        {portraits.length > 0 && (
          <SimpleGrid cols={2} spacing="xs">
            {portraits.map(id => (
              <StoredImage key={id} id={id} variant="thumb" height="auto" radius={10} style={imgStyle} />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    )
  }

  function renderCard(c) {
    const expanded = expandedId === c.id
    return (
      <Paper key={c.id} radius={14} p="md" shadow="xs"
        style={{ background: 'white', cursor: 'pointer' }}
        onClick={() => setExpandedId(prev => (prev === c.id ? null : c.id))}>
        <Stack gap="sm">
          <Group justify="flex-end" gap="xs" onClick={(e) => e.stopPropagation()}>
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={() => startEdit(c)}>
              <IconPencil size={15} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" size="sm"
              onClick={() => { if (confirm('삭제할까요?')) onDelete(c.id) }}>
              <IconTrash size={15} />
            </ActionIcon>
          </Group>
          {renderImages(c)}
          <Stack gap={4} style={{ minWidth: 0 }}>
            <Text fw={700} size="md" c="#1E293B">{c.name || '(이름 없음)'}</Text>
            {fieldRow(IconPhone, c.phone)}
            {expanded && (
              <>
                {fieldRow(IconPrinter, c.fax)}
                {fieldRow(IconMail, c.email)}
                {fieldRow(IconWorld, c.sns ?? c.blog)}
                {fieldRow(IconNote, c.note)}
              </>
            )}
            {(c.tags ?? []).length > 0 && (
              <Text size="xs" c="#94A3B8">{(c.tags ?? []).map(t => `#${t}`).join(' ')}</Text>
            )}
          </Stack>
        </Stack>
      </Paper>
    )
  }

  const allTags = [...new Set(items.flatMap(c => c.tags ?? []))].sort((a, b) => a.localeCompare(b))
  const taggedItems = selectedTag ? items.filter(c => (c.tags ?? []).includes(selectedTag)) : []

  return (
    <Stack maw={800} mx="auto" gap="md">
      <Group justify="flex-start">
        <SegmentedControl
          size="sm" value={tab} onChange={(v) => { setTab(v); if (v !== 'register') resetForm() }}
          data={[{ label: '등록', value: 'register' }, { label: '리스트', value: 'list' }, { label: '태그', value: 'tag' }]}
        />
      </Group>

      {/* 등록 / 수정 */}
      {tab === 'register' && (
        <Paper radius={14} shadow="sm" p="lg" style={{ background: 'white' }}>
          <Stack gap="sm">
            {/* 이미지 */}
            <Stack gap="xs">
              {(keptExisting.length > 0 || pending.length > 0) && (
                <Group gap="xs" wrap="wrap" align="center">
                  {keptExisting.map(id => (
                    <Box key={id} style={{ position: 'relative', width: 72, flexShrink: 0 }}>
                      <StoredImage id={id} variant="thumb" height={72} radius={10} />
                      <ActionIcon size={18} radius="xl" color="dark" variant="filled"
                        style={{ position: 'absolute', top: -6, right: -6, opacity: 0.9 }}
                        onClick={() => removeExisting(id)}>
                        <IconX size={11} />
                      </ActionIcon>
                    </Box>
                  ))}
                  {pending.map(p => (
                    <Box key={p.key} style={{ position: 'relative', width: 72, flexShrink: 0 }}>
                      <img src={previews[p.key]} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
                      <ActionIcon size={18} radius="xl" color="dark" variant="filled"
                        style={{ position: 'absolute', top: -6, right: -6, opacity: 0.9 }}
                        onClick={() => removePending(p.key)}>
                        <IconX size={11} />
                      </ActionIcon>
                    </Box>
                  ))}
                </Group>
              )}
              <FileButton onChange={handleFiles} accept="image/*" multiple>
                {(props) => (
                  <Button {...props} size="xs" variant="light" color="indigo" radius="md"
                    leftSection={<IconPhoto size={15} />} style={{ flexShrink: 0, alignSelf: 'flex-start' }}>
                    이미지 추가
                  </Button>
                )}
              </FileButton>
            </Stack>

            <TextInput label="이름" value={name} onChange={e => setName(e.currentTarget.value)} />
            <TextInput label="전화번호" value={phone} onChange={e => setPhone(e.currentTarget.value)} />
            <TextInput label="팩스" value={fax} onChange={e => setFax(e.currentTarget.value)} />
            <TextInput label="이메일" value={email} onChange={e => setEmail(e.currentTarget.value)} />
            <TextInput label="SNS" value={sns} onChange={e => setSns(e.currentTarget.value)} />
            <TextInput label="비고" value={note} onChange={e => setNote(e.currentTarget.value)} />
            <TextInput label="태그" value={tagsInput} onChange={e => setTagsInput(e.currentTarget.value)} />

            <Group justify="flex-end">
              {editingId && (
                <Button variant="subtle" color="gray" onClick={() => { resetForm(); setTab('list') }}>취소</Button>
              )}
              <Button leftSection={<IconPlus size={14} />} onClick={handleSubmit} loading={saving} disabled={!hasContent}>
                {editingId ? '수정 완료' : '추가'}
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
