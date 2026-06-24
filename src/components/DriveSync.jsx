import { Menu, ActionIcon } from '@mantine/core'
import { IconCloudDownload, IconCloudUpload, IconLogout, IconCloud } from '@tabler/icons-react'
import './DriveSync.module.scss'

const statusColor = { idle: 'gray', loading: 'blue', synced: 'teal', error: 'red' }

export default function DriveSync({ status, onPull, onPush, onSignOut }) {
  return (
    <Menu shadow="md" width={160}>
      <Menu.Target>
        <ActionIcon
          variant="subtle"
          color={statusColor[status]}
          loading={status === 'loading'}
          title="Drive 동기화"
        >
          <IconCloud size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
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
      </Menu.Dropdown>
    </Menu>
  )
}
