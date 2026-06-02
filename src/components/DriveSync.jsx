import { Stack, Button, Text, Divider, Menu, ActionIcon } from '@mantine/core'
import { IconBrandGoogle, IconCloudDownload, IconCloudUpload, IconLogout, IconCloud } from '@tabler/icons-react'

const statusColor = { idle: 'gray', loading: 'blue', synced: 'teal', error: 'red' }

export default function DriveSync({ isSignedIn, status, onPull, onPush, onSignOut, compact }) {
  const busy = status === 'loading'

  if (compact) {
    return (
      <Menu shadow="md" width={160}>
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            color={statusColor[status]}
            loading={busy}
            title="Drive 동기화"
          >
            <IconCloud size={18} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          {isSignedIn ? (
            <>
              <Menu.Item leftSection={<IconCloudDownload size={14} />} onClick={onPull}>
                불러오기
              </Menu.Item>
              <Menu.Item leftSection={<IconCloudUpload size={14} />} onClick={onPush}>
                저장하기
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<IconLogout size={14} />} color="red" onClick={onSignOut}>
                로그아웃
              </Menu.Item>
            </>
          ) : (
            <Menu.Item leftSection={<IconBrandGoogle size={14} />} onClick={onPull}>
              Google 로그인
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
    )
  }

  return (
    <Stack gap="xs">
      <Divider label="Google Drive" labelPosition="center" />
      {isSignedIn ? (
        <>
          {status !== 'idle' && (
            <Text size="xs" c={statusColor[status]} ta="center">
              {{ loading: '처리 중...', synced: '동기화 완료', error: '오류 발생' }[status]}
            </Text>
          )}
          <Button variant="light" size="xs" fullWidth loading={busy} leftSection={<IconCloudDownload size={14} />} onClick={onPull}>
            불러오기
          </Button>
          <Button variant="light" size="xs" fullWidth loading={busy} leftSection={<IconCloudUpload size={14} />} onClick={onPush}>
            저장하기
          </Button>
          <Button variant="subtle" size="xs" fullWidth color="gray" leftSection={<IconLogout size={14} />} onClick={onSignOut}>
            로그아웃
          </Button>
        </>
      ) : (
        <Button variant="light" size="xs" fullWidth color="indigo" leftSection={<IconBrandGoogle size={14} />} onClick={onPull}>
          Google 로그인
        </Button>
      )}
    </Stack>
  )
}
