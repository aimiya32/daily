import { Group, Chip, Center, Text } from '@mantine/core'
import './TagFilter.module.scss'

// 태그 칩 목록 + 토글 선택. 태그가 없으면 안내 문구를 보여준다.
export default function TagFilter({ tags, selected, onSelect, emptyText = '사용된 태그가 없어요.' }) {
  if (tags.length === 0) {
    return <Center mt="md"><Text c="dimmed" size="sm">{emptyText}</Text></Center>
  }
  return (
    <Group gap="xs" wrap="wrap">
      {tags.map(tag => (
        <Chip key={tag} checked={selected === tag}
          onChange={() => onSelect(selected === tag ? null : tag)}
          variant="light" color="grape" size="sm" radius="sm">
          #{tag}
        </Chip>
      ))}
    </Group>
  )
}
