import { useState, useRef } from 'react'
import { AppShell, Group, Text, Button, ActionIcon } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { IconPencilPlus, IconCategory, IconHome, IconList, IconCalendar, IconPlus } from '@tabler/icons-react'
import EntryEditor from './components/EntryEditor'
import EntryList from './components/EntryList'
import EntryDetail from './components/EntryDetail'
import ScheduleCalendar from './components/ScheduleCalendar'
import ScheduleEditor from './components/ScheduleEditor'
import ScheduleDetail from './components/ScheduleDetail'
import ScheduleCategoryManager from './components/ScheduleCategoryManager'
import RoutineView from './components/RoutineView'
import HomeScreen from './components/HomeScreen'
import LoginScreen from './components/LoginScreen'
import DriveSync from './components/DriveSync'
import CategoryManager from './components/CategoryManager'
import { useEntries } from './hooks/useEntries'
import { useCategories } from './hooks/useCategories'
import { useSchedules } from './hooks/useSchedules'
import { useScheduleCategories } from './hooks/useScheduleCategories'
import { useRoutines } from './hooks/useRoutines'
import { useRoutineChecks } from './hooks/useRoutineChecks'
import { useGoogleDrive } from './hooks/useGoogleDrive'

export default function App() {
  const [view, setView] = useState('home')
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [scheduleInitialDate, setScheduleInitialDate] = useState(null)
  const [catModalOpened, { open: openCatModal, close: closeCatModal }] = useDisclosure(false)
  const [scatModalOpened, { open: openScatModal, close: closeScatModal }] = useDisclosure(false)
  const openRoutineDrawerRef = useRef(null)

  const { entries, saveEntry, deleteEntry, mergeEntries } = useEntries()
  const { categories, addCategory, deleteCategory, setAll: setAllCategories } = useCategories()
  const { schedules, saveSchedule, deleteSchedule, mergeSchedules } = useSchedules()
  const { categories: scheduleCategories, addCategory: addScatCategory, deleteCategory: deleteScatCategory, setAll: setAllScatCategories } = useScheduleCategories()
  const { routines, addRoutine, updateRoutine, toggleVisible, setAll: setAllRoutines } = useRoutines()
  const { checks: routineChecks, isChecked, toggle: toggleCheck, getCheckedRoutineIds, mergeChecks } = useRoutineChecks()
  const { isSignedIn, status: driveStatus, pull, push, signOut } = useGoogleDrive()

  async function handleLogin() {
    const data = await pull()
    if (data?.entries) mergeEntries(data.entries)
    if (data?.categories) setAllCategories(data.categories)
    if (data?.schedules) mergeSchedules(data.schedules)
    if (data?.scheduleCategories) setAllScatCategories(data.scheduleCategories)
    if (data?.routines) setAllRoutines(data.routines)
    if (data?.routineChecks) mergeChecks(data.routineChecks)
  }

  if (!isSignedIn) return <LoginScreen onLogin={handleLogin} />

  function handleHomeOpen(id) {
    if (id === 'diary') setView('list')
    if (id === 'schedule') setView('schedule')
    if (id === 'routine') setView('routine')
  }

  function handleSaveEntry(entry) {
    saveEntry(entry)
    setView('list')
    setSelectedEntry(null)
  }

  function handleSaveSchedule(schedule) {
    saveSchedule(schedule)
    setView('schedule')
    setSelectedSchedule(null)
  }

  async function handleDrivePull() {
    const data = await pull()
    if (data?.entries) mergeEntries(data.entries)
    if (data?.categories) setAllCategories(data.categories)
    if (data?.schedules) mergeSchedules(data.schedules)
    if (data?.scheduleCategories) setAllScatCategories(data.scheduleCategories)
  }

  const isDiary = ['list', 'detail', 'editor'].includes(view)
  const isSchedule = ['schedule', 'schedule-detail', 'schedule-editor'].includes(view)
  const isRoutine = view === 'routine'

  const headerTitle = {
    home: '',
    list: '일기',
    detail: '일기',
    editor: selectedEntry ? '일기 수정' : '새 일기',
    schedule: '일정',
    'schedule-detail': '일정',
    'schedule-editor': selectedSchedule ? '일정 수정' : '새 일정',
    routine: '루틴',
  }[view] ?? ''

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        padding="md"
        styles={{
          header: {
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #E2E8F0',
            boxShadow: '0 2px 12px rgba(99,102,241,0.06)',
          },
          main: { backgroundColor: '#F4F6FB' },
        }}
      >
        <AppShell.Header>
          <Group h="100%" px="lg" justify="space-between">
            <Group gap="xs">
              {view !== 'home' && (
                <>
                  <ActionIcon variant="subtle" color="gray" radius="xl"
                    onClick={() => { setView('home'); setSelectedEntry(null); setSelectedSchedule(null) }}>
                    <IconHome size={18} />
                  </ActionIcon>
                  {(isDiary && view !== 'list') && (
                    <ActionIcon variant="subtle" color="gray" radius="xl"
                      onClick={() => { setView('list'); setSelectedEntry(null) }}>
                      <IconList size={18} />
                    </ActionIcon>
                  )}
                  {(isSchedule && view !== 'schedule') && (
                    <ActionIcon variant="subtle" color="gray" radius="xl"
                      onClick={() => { setView('schedule'); setSelectedSchedule(null) }}>
                      <IconCalendar size={18} />
                    </ActionIcon>
                  )}
                </>
              )}
              <Text fw={700} size="lg" c="gray.8" style={{ letterSpacing: '-0.3px' }}>{headerTitle}</Text>
            </Group>

            <Group gap="xs">
              {view === 'list' && (
                <>
                  <ActionIcon variant="subtle" color="gray" radius="xl" onClick={openCatModal}>
                    <IconCategory size={18} />
                  </ActionIcon>
                  <Button size="xs" variant="gradient" gradient={{ from: 'indigo', to: 'violet' }} radius="xl"
                    leftSection={<IconPencilPlus size={13} />}
                    onClick={() => { setSelectedEntry(null); setView('editor') }}>
                    새 일기
                  </Button>
                </>
              )}
              {view === 'schedule' && (
                <>
                  <ActionIcon variant="subtle" color="gray" radius="xl" onClick={openScatModal}>
                    <IconCategory size={18} />
                  </ActionIcon>
                  <Button size="xs" variant="gradient" gradient={{ from: 'violet', to: 'grape' }} radius="xl"
                    leftSection={<IconPlus size={13} />}
                    onClick={() => { setSelectedSchedule(null); setScheduleInitialDate(null); setView('schedule-editor') }}>
                    일정 추가
                  </Button>
                </>
              )}
              {view === 'routine' && (
                <ActionIcon variant="light" color="indigo" radius="xl"
                  onClick={() => openRoutineDrawerRef.current?.()}>
                  <IconList size={18} />
                </ActionIcon>
              )}
              <DriveSync
                isSignedIn={isSignedIn}
                status={driveStatus}
                onPull={handleDrivePull}
                onPush={() => push({ entries, categories, schedules, scheduleCategories, routines, routineChecks })}
                onSignOut={signOut}
                compact
              />
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          {view === 'home' && <HomeScreen onOpen={handleHomeOpen} />}

          {/* 일기 */}
          {view === 'list' && (
            <EntryList
              entries={entries}
              categories={categories}
              onView={entry => { setSelectedEntry(entry); setView('detail') }}
              onEdit={entry => { setSelectedEntry(entry); setView('editor') }}
              onDelete={deleteEntry}
            />
          )}
          {view === 'detail' && selectedEntry && (
            <EntryDetail
              entry={selectedEntry}
              categories={categories}
              onEdit={() => setView('editor')}
            />
          )}
          {view === 'editor' && (
            <EntryEditor
              entry={selectedEntry}
              categories={categories}
              onSave={handleSaveEntry}
              onCancel={() => setView(selectedEntry ? 'detail' : 'list')}
            />
          )}

          {/* 일정 */}
          {view === 'schedule' && (
            <ScheduleCalendar
              schedules={schedules}
              categories={scheduleCategories}
              onView={s => { setSelectedSchedule(s); setView('schedule-detail') }}
              onAdd={date => { setSelectedSchedule(null); setScheduleInitialDate(date); setView('schedule-editor') }}
              onManageCategories={openScatModal}
            />
          )}
          {view === 'schedule-detail' && selectedSchedule && (
            <ScheduleDetail
              schedule={selectedSchedule}
              categories={scheduleCategories}
              onEdit={() => setView('schedule-editor')}
              onDelete={() => { deleteSchedule(selectedSchedule.id); setView('schedule'); setSelectedSchedule(null) }}
            />
          )}
          {view === 'schedule-editor' && (
            <ScheduleEditor
              schedule={selectedSchedule}
              categories={scheduleCategories}
              initialDate={scheduleInitialDate}
              onSave={handleSaveSchedule}
              onCancel={() => setView(selectedSchedule ? 'schedule-detail' : 'schedule')}
            />
          )}

          {/* 루틴 */}
          {view === 'routine' && (
            <RoutineView
              routines={routines}
              isChecked={isChecked}
              toggle={toggleCheck}
              getCheckedRoutineIds={getCheckedRoutineIds}
              addRoutine={addRoutine}
              updateRoutine={updateRoutine}
              toggleVisible={toggleVisible}
              onExposeOpen={fn => { openRoutineDrawerRef.current = fn }}
            />
          )}
        </AppShell.Main>
      </AppShell>

      <CategoryManager
        opened={catModalOpened}
        onClose={closeCatModal}
        categories={categories}
        onAdd={addCategory}
        onDelete={deleteCategory}
      />
      <ScheduleCategoryManager
        opened={scatModalOpened}
        onClose={closeScatModal}
        categories={scheduleCategories}
        onAdd={addScatCategory}
        onDelete={deleteScatCategory}
      />
    </>
  )
}
