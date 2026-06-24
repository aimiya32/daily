import { useState } from 'react'
import { useLocalStorageState } from '../hooks/useLocalStorageState'
import {
  Stack, Paper, Group, Text, Button, NumberInput, TextInput,
  SegmentedControl, ActionIcon, Center, Divider, Select, Chip, Progress, Box,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import CalendarNav from './CalendarNav'
import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import styles from './LedgerView.module.scss'

dayjs.locale('ko')

const won = n => `${Number(n || 0).toLocaleString()}원`

function parseTags(str) {
  const seen = new Set()
  const out = []
  for (const t of str.split(',')) {
    const tag = t.trim()
    if (tag && !seen.has(tag)) { seen.add(tag); out.push(tag) }
  }
  return out
}

export default function LedgerView({ items, categories = [], onAdd, onUpdate, onDelete }) {
  const [_monthStr, _setMonthStr] = useLocalStorageState('ui_ledger_month', dayjs().format('YYYY-MM'))
  const month = dayjs(_monthStr).startOf('month')
  const setMonth = (d) => _setMonthStr(d.format('YYYY-MM'))
  const [tab, setTab] = useState('list') // list | tag | stat
  const [editingId, setEditingId] = useState(null)
  const [type, setType] = useState('expense')
  const [date, setDate] = useState(new Date())
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [selectedTag, setSelectedTag] = useState(null)

  const catMap = Object.fromEntries(categories.map(c => [c.id, c.name]))
  const typeCatOptions = categories
    .filter(c => c.type === type)
    .map(c => ({ value: c.id, label: c.name }))

  const monthKey = month.format('YYYY-MM')
  const monthItems = items
    .filter(i => i.date.startsWith(monthKey))
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  const income = monthItems.filter(i => i.type === 'income').reduce((s, i) => s + Number(i.amount || 0), 0)
  const expense = monthItems.filter(i => i.type === 'expense').reduce((s, i) => s + Number(i.amount || 0), 0)
  const balance = income - expense

  function resetForm() {
    setEditingId(null)
    setType('expense')
    setDate(new Date())
    setAmount('')
    setMemo('')
    setTagsInput('')
    setCategoryId(null)
  }

  function startEdit(i) {
    setEditingId(i.id)
    setType(i.type)
    setDate(dayjs(i.date).toDate())
    setAmount(i.amount)
    setMemo(i.memo ?? '')
    setTagsInput((i.tags ?? []).join(', '))
    setCategoryId(i.categoryId ?? null)
    setTab('list')
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSubmit() {
    if (amount === '' || Number(amount) <= 0) return
    const payload = {
      id: editingId ?? crypto.randomUUID(),
      date: dayjs(date).format('YYYY-MM-DD'),
      type,
      amount: Number(amount),
      categoryId: categoryId ?? null,
      memo: memo.trim(),
      tags: parseTags(tagsInput),
      updatedAt: new Date().toISOString(),
    }
    if (editingId) onUpdate(payload)
    else onAdd(payload)
    setAmount('')
    setMemo('')
    setTagsInput('')
    setEditingId(null)
  }

  function renderRow(i) {
    return (
      <Paper key={i.id} radius="md" p="sm" shadow="xs"
        style={{ background: 'white', cursor: 'pointer', outline: editingId === i.id ? '2px solid var(--mantine-color-indigo-3)' : 'none' }}
        onClick={() => startEdit(i)}>
        <Group justify="space-between" wrap="nowrap" align="center">
          <Group gap="sm" wrap="nowrap" align="center" style={{ minWidth: 0 }}>
            <Text fw={700} size="md" c="#1E293B" style={{ flexShrink: 0, width: 50, textAlign: 'center' }}>{dayjs(i.date).format('D')}</Text>
            <Stack gap={6} style={{ minWidth: 0 }} align="flex-start">
              {i.categoryId && catMap[i.categoryId] && (
                <Box className={styles.categoryTag}>
                  <Text size="xs" c="#1E293B">{catMap[i.categoryId]}</Text>
                </Box>
              )}
              <Text size="sm" c="#1E293B" truncate>{i.memo || (i.type === 'income' ? '수입' : '지출')}</Text>
              {(i.tags ?? []).length > 0 && (
                <Text size="xs" c="#94A3B8">{(i.tags ?? []).map(t => `#${t}`).join(' ')}</Text>
              )}
            </Stack>
          </Group>
          <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
            <Text fw={700} size="sm" c={i.type === 'income' ? '#2563EB' : '#DC2626'}>
              {i.type === 'income' ? '+' : '-'}{won(i.amount)}
            </Text>
            <ActionIcon variant="subtle" color="red" size="sm"
              onClick={(e) => { e.stopPropagation(); if (confirm('삭제할까요?')) onDelete(i.id) }}>
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        </Group>
      </Paper>
    )
  }

  // 통계: 타입별 카테고리 합계
  function categoryStats(t) {
    const total = t === 'income' ? income : expense
    const map = new Map()
    for (const i of monthItems) {
      if (i.type !== t) continue
      const key = i.categoryId && catMap[i.categoryId] ? i.categoryId : '__none'
      map.set(key, (map.get(key) || 0) + Number(i.amount || 0))
    }
    return { total, rows: [...map.entries()].map(([k, v]) => ({ name: k === '__none' ? '미분류' : catMap[k], amount: v })).sort((a, b) => b.amount - a.amount) }
  }

  const allTags = [...new Set(monthItems.flatMap(i => i.tags ?? []))].sort((a, b) => a.localeCompare(b))
  const taggedItems = selectedTag ? monthItems.filter(i => (i.tags ?? []).includes(selectedTag)) : []

  return (
    <Stack maw={800} mx="auto" gap="md">
      <Group justify="flex-start">
        <SegmentedControl
          size="sm" value={tab} onChange={setTab}
          data={[{ label: '리스트', value: 'list' }, { label: '태그', value: 'tag' }, { label: '통계', value: 'stat' }]}
        />
      </Group>

      <Stack gap={0}>
        <CalendarNav
          title={month.format('YYYY년 M월')}
          monthValue={month.toDate()}
          onMonthSelect={(v) => setMonth(dayjs(v).startOf('month'))}
          onToday={() => setMonth(dayjs().startOf('month'))}
          standalone
        />
      </Stack>

      {/* 리스트 */}
      {tab === 'list' && (
        <>
          <Paper radius={14} shadow="sm" p="lg" style={{ background: 'white' }}>
            <Stack gap="sm">
              <SegmentedControl
                value={type} onChange={(v) => { setType(v); setCategoryId(null) }} fullWidth
                data={[{ label: '지출', value: 'expense' }, { label: '수입', value: 'income' }]}
              />
              <Group gap="sm" grow>
                <DatePickerInput
                  label="날짜" value={date} onChange={setDate}
                  valueFormat="YYYY.MM.DD" firstDayOfWeek={0}
                />
                <NumberInput
                  label="금액" value={amount} onChange={setAmount}
                  min={0} thousandSeparator="," hideControls placeholder="0" suffix="원"
                />
              </Group>
              <Select
                label="카테고리"
                placeholder={typeCatOptions.length ? '선택 안함' : '카테고리를 먼저 추가하세요'}
                data={typeCatOptions}
                value={categoryId}
                onChange={setCategoryId}
                disabled={typeCatOptions.length === 0}
                clearable
              />
              <TextInput
                label="메모" value={memo} onChange={e => setMemo(e.currentTarget.value)}
              />
              <TextInput
                label="태그" value={tagsInput} onChange={e => setTagsInput(e.currentTarget.value)}
              />
              <Group justify="flex-end">
                {editingId && (
                  <Button variant="subtle" color="gray" onClick={resetForm}>취소</Button>
                )}
                <Button leftSection={<IconPlus size={14} />} onClick={handleSubmit}
                  disabled={amount === '' || Number(amount) <= 0}>
                  {editingId ? '수정 완료' : '추가'}
                </Button>
              </Group>
            </Stack>
          </Paper>

          {monthItems.length === 0 ? (
            <Center mt="md"><Text c="dimmed" size="sm">이 달의 내역이 없어요.</Text></Center>
          ) : (
            <Stack gap="xs">{monthItems.map(renderRow)}</Stack>
          )}
        </>
      )}

      {/* 태그 */}
      {tab === 'tag' && (
        <Stack gap="md">
          {allTags.length === 0 ? (
            <Center mt="md"><Text c="dimmed" size="sm">이 달에 사용된 태그가 없어요.</Text></Center>
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
              ? <Center mt="md"><Text c="dimmed" size="sm">해당 태그의 내역이 없어요.</Text></Center>
              : <Stack gap="xs">{taggedItems.map(renderRow)}</Stack>
          )}
        </Stack>
      )}

      {/* 통계 */}
      {tab === 'stat' && (
        <Stack gap="md">
          <Paper radius={14} shadow="sm" p="lg" style={{ background: 'white' }}>
            <Group justify="space-between" wrap="nowrap">
              <Stack gap={2} align="center" style={{ flex: 1 }}>
                <Text size="xs" c="dimmed">수입</Text>
                <Text fw={700} c="#2563EB">{won(income)}</Text>
              </Stack>
              <Divider orientation="vertical" />
              <Stack gap={2} align="center" style={{ flex: 1 }}>
                <Text size="xs" c="dimmed">지출</Text>
                <Text fw={700} c="#DC2626">{won(expense)}</Text>
              </Stack>
              <Divider orientation="vertical" />
              <Stack gap={2} align="center" style={{ flex: 1 }}>
                <Text size="xs" c="dimmed">잔액</Text>
                <Text fw={800} c={balance < 0 ? '#DC2626' : '#1E293B'}>{won(balance)}</Text>
              </Stack>
            </Group>
          </Paper>

          {['expense', 'income'].map(t => {
            const { total, rows } = categoryStats(t)
            if (rows.length === 0) return null
            const color = t === 'income' ? '#2563EB' : '#DC2626'
            return (
              <Paper key={t} radius={14} shadow="sm" p="lg" style={{ background: 'white' }}>
                <Stack gap="sm">
                  <Text fw={700} size="sm" c={color}>{t === 'income' ? '수입' : '지출'}</Text>
                  {rows.map(r => (
                    <Stack key={r.name} gap={4}>
                      <Group justify="space-between">
                        <Text size="sm" c="#334155">{r.name}</Text>
                        <Text size="sm" fw={600} c="#1E293B">{won(r.amount)}</Text>
                      </Group>
                      <Progress value={total > 0 ? (r.amount / total) * 100 : 0} color={t === 'income' ? 'blue' : 'red'} radius="xl" size="sm" />
                    </Stack>
                  ))}
                </Stack>
              </Paper>
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}
