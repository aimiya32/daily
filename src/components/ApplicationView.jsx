import { Stack, Text, Box, UnstyledButton, Center } from '@mantine/core'
import { IconFileText, IconNotebook } from '@tabler/icons-react'
import styles from './ApplicationView.module.scss'

const APPS = [
  { id: 'engineer', label: '정보처리기사 필기 모의시험', icon: IconFileText, color: '#F59E0B' },
  { id: 'engineer-summary', label: '정보처리기사 요약정리', icon: IconNotebook, color: '#6366F1' },
]

export default function ApplicationView({ onOpen }) {
  return (
    <Center py="xl" px="md">
      <Stack gap="md" w="100%" maw={600}>
        {APPS.map(({ id, label, icon: Icon, color }) => (
          <UnstyledButton
            key={id}
            onClick={() => onOpen?.(id)}
            className={styles.appBtn}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Box
              className={styles.appCard}
              style={{ border: `1px solid ${color}18` }}
            >
              <Box
                className={styles.iconBox}
                style={{ background: `linear-gradient(135deg, ${color}22, ${color}10)` }}
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
