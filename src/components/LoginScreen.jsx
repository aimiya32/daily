import { Center, Paper, Stack, Text, Button, ThemeIcon, Box } from '@mantine/core'
import { IconBrandGoogle, IconBook2 } from '@tabler/icons-react'

export default function LoginScreen({ onLogin }) {
  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #EEF2FF 0%, #F4F6FB 50%, #E0E7FF 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper radius="2rem" shadow="xl" p={48} w={360} style={{ background: 'white' }}>
        <Stack align="center" gap="xl">
          <Stack align="center" gap="md">
            <ThemeIcon size={72} radius="xl" variant="gradient" gradient={{ from: 'indigo.5', to: 'violet.4', deg: 135 }}>
              <IconBook2 size={36} />
            </ThemeIcon>
            <Stack align="center" gap={4}>
              <Text size="sm" c="#94A3B8" ta="center" lh={1.6}>
                Google 계정으로 로그인하여<br />나만의 기록을 시작하세요.
              </Text>
            </Stack>
          </Stack>

          <Button
            variant="default"
            size="md"
            leftSection={<IconBrandGoogle size={18} />}
            onClick={onLogin}
            fullWidth
            styles={{
              root: {
                fontWeight: 600,
                border: '1.5px solid #E2E8F0',
                color: '#1E293B',
                height: 48,
              }
            }}
          >
            Google로 계속하기
          </Button>
        </Stack>
      </Paper>
    </Box>
  )
}
