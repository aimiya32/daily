import { Stack, Text, Box, UnstyledButton, Center } from '@mantine/core'
import { IconFileText } from '@tabler/icons-react'

const APPS = [
  { id: 'engineer', label: '정보처리기사 필기', icon: IconFileText, color: '#F59E0B' },
]

export default function ApplicationView({ onOpen }) {
  return (
    <Center py="xl" px="md">
      <Stack gap="md" w="100%" maw={600}>
        {APPS.map(({ id, label, icon: Icon, color }) => (
          <UnstyledButton
            key={id}
            onClick={() => onOpen?.(id)}
            style={{ width: '100%', transition: 'transform 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Box
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                width: '100%',
                padding: '18px 22px',
                borderRadius: 20,
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                border: `1px solid ${color}18`,
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
                <Icon size={20} color={color} stroke={1.8} />
              </Box>
              <Text fw={600} size="md" c="#475569">{label}</Text>
            </Box>
          </UnstyledButton>
        ))}
      </Stack>
    </Center>
  )
}
