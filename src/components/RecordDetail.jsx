import { useState } from 'react'
import { Stack, Text, Group, Badge, ActionIcon, Divider, Box, Modal } from '@mantine/core'
import { IconPencil, IconTrash } from '@tabler/icons-react'
import StoredImage from './StoredImage'
import ContentCard from './ContentCard'
import dayjs from 'dayjs'
import styles from './RecordDetail.module.scss'

export default function RecordDetail({ record, categories, onEdit, onDelete }) {
  const cat = categories.find(c => c.id === record.categoryId)
  const [viewer, setViewer] = useState(null) // 크게 볼 이미지 id
  const images = record.images ?? []

  return (
    <ContentCard>
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <Stack gap={6} style={{ minWidth: 0 }} align="flex-start">
            {cat && (
              <Badge size="lg" variant="light" radius="xl" color="indigo">{cat.name}</Badge>
            )}
            {record.title && (
              <Text fw={800} size="xl" c="#1E293B" className={styles.titleText}>
                {record.title}
              </Text>
            )}
            <Group gap={8} wrap="wrap" align="center">
              <Text fw={700} size="sm" c="#1E293B">{dayjs(record.date).format('YYYY년 M월 D일')}</Text>
              <Text fw={700} size="sm" c="#1E293B">{dayjs(record.date).format('dddd')}</Text>
            </Group>
            {(record.tags ?? []).length > 0 && (
              <Text size="xs" c="#94A3B8">
                {(record.tags ?? []).map(t => `#${t}`).join(' ')}
              </Text>
            )}
          </Stack>
          <Group gap="xs">
            <ActionIcon variant="subtle" color="gray" radius="xl" size="lg" onClick={onEdit} className={styles.editBtn}>
              <IconPencil size={16} />
            </ActionIcon>
            <ActionIcon variant="light" color="red" radius="xl" size="lg"
              onClick={() => { if (confirm('삭제할까요?')) onDelete() }}>
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
        </Group>

        <Divider color="gray.1" />

        {images.length > 0 && (
          <Group justify="center" gap="xs">
            {images.map(id => (
              <Box key={id} className={styles.imageWrap}>
                <StoredImage id={id} variant="thumb" height="auto" onClick={() => setViewer(id)} style={{ height: 'auto', objectFit: 'contain' }} />
              </Box>
            ))}
          </Group>
        )}

        <Text size="md" lh={2} className={styles.contentText} c="#334155">
          {record.content}
        </Text>
      </Stack>

      <Modal opened={!!viewer} onClose={() => setViewer(null)} size="lg" centered withCloseButton padding="sm">
        {viewer && <StoredImage id={viewer} variant="original" height="auto" radius={8} style={{ height: 'auto', maxHeight: '80vh', objectFit: 'contain' }} />}
      </Modal>
    </ContentCard>
  )
}
