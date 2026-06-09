import { UnstyledButton, Stack, Text, Box, Center, ActionIcon } from '@mantine/core'
import {
  IconBook2, IconCalendar, IconRepeat, IconChartBar, IconWallet, IconAddressBook, IconChevronRight,
  IconEye, IconEyeOff, IconChevronUp, IconChevronDown,
} from '@tabler/icons-react'
import { useHomeMenu } from '../hooks/useHomeMenu'

const APP_DEFS = {
  schedule: { label: '일정',   icon: IconCalendar,    color: '#7C3AED' },
  tracker:  { label: '목표',   icon: IconChartBar,    color: '#059669' },
  routine:  { label: '루틴',   icon: IconRepeat,      color: '#0EA5E9' },
  record:   { label: '기록',   icon: IconBook2,       color: '#4F46E5' },
  ledger:   { label: '가계부', icon: IconWallet,      color: '#DB2777' },
  contacts: { label: '연락처', icon: IconAddressBook, color: '#EA580C' },
}
const ALL_IDS = ['schedule', 'tracker', 'routine', 'record', 'ledger', 'contacts']

export default function HomeScreen({ onOpen, editing = false }) {
  const { menu, toggleVisible, move } = useHomeMenu(ALL_IDS)

  const visibleMenu = menu.filter(m => m.visible)

  return (
    <Center py="xl" px="md">
      <Stack gap="md" w="100%" maw={480}>
        {editing ? (
          menu.map((m, idx) => (
            <EditRow
              key={m.id}
              {...APP_DEFS[m.id]}
              visible={m.visible}
              isFirst={idx === 0}
              isLast={idx === menu.length - 1}
              onToggle={() => toggleVisible(m.id)}
              onUp={() => move(m.id, -1)}
              onDown={() => move(m.id, +1)}
            />
          ))
        ) : (
          visibleMenu.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="xl">표시할 메뉴가 없어요. ‘편집’에서 켜보세요.</Text>
          ) : (
            visibleMenu.map(m => (
              <AppRow key={m.id} {...APP_DEFS[m.id]} onClick={() => onOpen(m.id)} />
            ))
          )
        )}
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
          boxShadow: `0 1px 2px rgba(15,23,42,0.04)`,
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

function EditRow({ label, icon: Icon, color = '#4F46E5', visible, isFirst, isLast, onToggle, onUp, onDown }) {
  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 20,
        backgroundColor: '#ffffff',
        boxShadow: `0 1px 2px rgba(15,23,42,0.04)`,
        border: `1px solid ${color}18`,
        opacity: visible ? 1 : 0.5,
      }}
    >
      <Box
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: `linear-gradient(135deg, ${color}22, ${color}10)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={color} stroke={2} />
      </Box>
      <Text fw={700} size="md" c="#1E293B" style={{ flex: 1 }}>{label}</Text>
      <ActionIcon variant="subtle" color="gray" onClick={onToggle}>
        {visible ? <IconEye size={18} /> : <IconEyeOff size={18} />}
      </ActionIcon>
      <Stack gap={0}>
        <ActionIcon variant="subtle" color="gray" size="sm" disabled={isFirst} onClick={onUp}>
          <IconChevronUp size={16} />
        </ActionIcon>
        <ActionIcon variant="subtle" color="gray" size="sm" disabled={isLast} onClick={onDown}>
          <IconChevronDown size={16} />
        </ActionIcon>
      </Stack>
    </Box>
  )
}
