import { UnstyledButton, Stack, Text, Box, Center, Group } from '@mantine/core'
import { IconBook2, IconCalendar, IconRepeat, IconChevronRight } from '@tabler/icons-react'

const apps = [
  { id: 'diary',    label: '일기',  icon: IconBook2,    color: '#4F46E5' },
  { id: 'schedule', label: '일정',  icon: IconCalendar, color: '#7C3AED' },
  { id: 'routine',  label: '루틴',  icon: IconRepeat,   color: '#0EA5E9' },
]

export default function HomeScreen({ onOpen }) {
  return (
    <Center p="xl">
      <Stack gap="md" w="100%" maw={480}>
        {apps.map(app => (
          <AppRow key={app.id} {...app} onClick={() => onOpen(app.id)} />
        ))}
      </Stack>
    </Center>
  )
}

function AppRow({ label, icon: Icon, color = '#4F46E5', onClick }) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{ transition: 'transform 0.15s ease' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '16px 20px',
          borderRadius: 20,
          backgroundColor: '#ffffff',
          boxShadow: `0 2px 12px ${color}12, 0 1px 4px rgba(15,23,42,0.05)`,
          border: `1px solid ${color}18`,
        }}
      >
        <Box
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: `linear-gradient(135deg, ${color}22, ${color}10)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={24} color={color} stroke={2} />
        </Box>
        <Text fw={700} size="md" c="#1E293B" style={{ flex: 1 }}>{label}</Text>
        <IconChevronRight size={16} color="#94A3B8" />
      </Box>
    </UnstyledButton>
  )
}
