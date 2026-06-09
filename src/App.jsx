import { useState, useRef, useEffect } from 'react'
import { AppShell, Group, Text, Button, ActionIcon } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { IconCategory, IconHome, IconList, IconCalendar, IconChartBar } from '@tabler/icons-react'
import RecordEditor from './components/RecordEditor'
import RecordList from './components/RecordList'
import RecordDetail from './components/RecordDetail'
import ScheduleCalendar from './components/ScheduleCalendar'
import ScheduleEditor from './components/ScheduleEditor'
import ScheduleDetail from './components/ScheduleDetail'
import ScheduleCategoryManager from './components/ScheduleCategoryManager'
import RoutineView from './components/RoutineView'
import TrackerView from './components/TrackerView'
import LedgerView from './components/LedgerView'
import LedgerCategoryManager from './components/LedgerCategoryManager'
import TrackerCategoryManager from './components/TrackerCategoryManager'
import HomeScreen from './components/HomeScreen'
import LoginScreen from './components/LoginScreen'
import DriveSync from './components/DriveSync'
import CategoryManager from './components/CategoryManager'
import { useRecords } from './hooks/useRecords'
import { useCategories } from './hooks/useCategories'
import { useSchedules } from './hooks/useSchedules'
import { useScheduleCategories } from './hooks/useScheduleCategories'
import { useRoutines } from './hooks/useRoutines'
import { useRoutineChecks } from './hooks/useRoutineChecks'
import { useTrackerCategories } from './hooks/useTrackerCategories'
import { useTrackerLogs } from './hooks/useTrackerLogs'
import { useLedger } from './hooks/useLedger'
import { useLedgerCategories } from './hooks/useLedgerCategories'
import { useGoogleDrive } from './hooks/useGoogleDrive'
import { setAccountPrefix, isInitialized, markInitialized } from './lib/accountStorage'
import { deleteImages, getImage, putImage } from './lib/imageStore'
import { setImageTokenProvider, uploadImageRecord } from './lib/driveImages'

// ── 로그인 게이트 ─────────────────────────────────────────
// 로그인 전에는 데이터 훅을 마운트하지 않고, 로그인 후 계정별 네임스페이스를
// 설정한 뒤 계정 키로 Workspace를 마운트한다. 계정이 바뀌면 remount되어
// 그 계정의 데이터로 새로 뜬다.
export default function App() {
  const drive = useGoogleDrive()

  if (!drive.isSignedIn) {
    return <LoginScreen onLogin={() => drive.pull()} />
  }

  const accountKey = drive.user?.email || drive.user?.name || 'user'
  setAccountPrefix(accountKey)
  // 이미지 Drive 업/다운로드용 토큰 공급자 등록 (조용한 토큰)
  setImageTokenProvider(() => drive.getToken({ silent: true }))

  return <Workspace key={accountKey} drive={drive} />
}

// ── 실제 앱 (로그인된 계정 기준) ──────────────────────────
function Workspace({ drive }) {
  const { status: driveStatus, pull, push, signOut } = drive

  const [view, setView] = useState('home')
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [scheduleInitialDate, setScheduleInitialDate] = useState(null)
  const [catModalOpened, { open: openCatModal, close: closeCatModal }] = useDisclosure(false)
  const [scatModalOpened, { open: openScatModal, close: closeScatModal }] = useDisclosure(false)
  const [tcatModalOpened, { open: openTcatModal, close: closeTcatModal }] = useDisclosure(false)
  const [lcatModalOpened, { open: openLcatModal, close: closeLcatModal }] = useDisclosure(false)
  const openRoutineDrawerRef = useRef(null)

  const { records, saveRecord, deleteRecord, mergeRecords } = useRecords()
  const { categories, addCategory, updateCategory, deleteCategory, setAll: setAllCategories } = useCategories()
  const { schedules, saveSchedule, deleteSchedule, mergeSchedules } = useSchedules()
  const { categories: scheduleCategories, addCategory: addScatCategory, deleteCategory: deleteScatCategory, setAll: setAllScatCategories } = useScheduleCategories()
  const { routines, addRoutine, updateRoutine, toggleVisible, setAll: setAllRoutines } = useRoutines()
  const { checks: routineChecks, isChecked, toggle: toggleCheck, getCheckedRoutineIds, mergeChecks } = useRoutineChecks()
  const { categories: trackerCategories, addCategory: addTrackerCategory, deleteCategory: deleteTrackerCategory, setAll: setAllTrackerCategories } = useTrackerCategories()
  const { logs: trackerLogs, getLog: getTrackerLog, setLog: setTrackerLog, deleteLogsByCategory: deleteTrackerLogsByCategory, bulkSetPlanned: bulkSetTrackerPlanned, mergeLogs: mergeTrackerLogs } = useTrackerLogs()
  const { items: ledgerItems, addItem: addLedgerItem, deleteItem: deleteLedgerItem, mergeItems: mergeLedgerItems } = useLedger()
  const { categories: ledgerCategories, addCategory: addLedgerCategory, deleteCategory: deleteLedgerCategory, setAll: setAllLedgerCategories } = useLedgerCategories()

  function applyDriveData(data) {
    if (!data) return
    if (data.records) mergeRecords(data.records)
    if (data.categories) setAllCategories(data.categories)
    if (data.schedules) mergeSchedules(data.schedules)
    if (data.scheduleCategories) setAllScatCategories(data.scheduleCategories)
    if (data.routines) setAllRoutines(data.routines)
    if (data.routineChecks) mergeChecks(data.routineChecks)
    if (data.trackerCategories) setAllTrackerCategories(data.trackerCategories)
    if (data.trackerLogs) mergeTrackerLogs(data.trackerLogs)
    if (data.ledger) mergeLedgerItems(data.ledger)
    if (data.ledgerCategories) setAllLedgerCategories(data.ledgerCategories)
  }

  async function handleDrivePull() {
    applyDriveData(await pull())
  }

  // 아직 Drive에 안 올라간 이미지들을 업로드 (백그라운드 업로드 실패분 보완)
  async function syncImagesToDrive() {
    const ids = [...new Set(records.flatMap(e => e.images ?? []))]
    for (const id of ids) {
      const rec = await getImage(id)
      if (rec && !rec.uploaded) {
        const ok = await uploadImageRecord(id, rec)
        if (ok) await putImage({ ...rec, uploaded: true })
      }
    }
  }

  async function handleDrivePush() {
    await push({ records, categories, schedules, scheduleCategories, routines, routineChecks, trackerCategories, trackerLogs, ledger: ledgerItems, ledgerCategories })
    await syncImagesToDrive()
  }

  // 이 계정/브라우저에서 처음이면 Drive에서 1회 자동 로드
  const initRef = useRef(false)
  useEffect(() => {
    if (initRef.current || isInitialized()) return
    initRef.current = true
    ;(async () => {
      await handleDrivePull()
      markInitialized()
    })()
  }, [])

  function handleHomeOpen(id) {
    if (id === 'record') setView('list')
    if (id === 'schedule') setView('schedule')
    if (id === 'routine') setView('routine')
    if (id === 'tracker') setView('tracker')
    if (id === 'ledger') setView('ledger')
  }

  function handleDeleteTrackerCategory(id) {
    deleteTrackerCategory(id)
    deleteTrackerLogsByCategory(id)
  }

  function handleSaveRecord(record) {
    saveRecord(record)
    setView('list')
    setSelectedRecord(null)
  }

  function handleDeleteRecord(id) {
    const target = records.find(e => e.id === id)
    if (target?.images?.length) deleteImages(target.images)
    deleteRecord(id)
  }

  function handleSaveSchedule(schedule) {
    saveSchedule(schedule)
    setView('schedule')
    setSelectedSchedule(null)
  }

  const isRecord = ['list', 'detail', 'editor'].includes(view)
  const isSchedule = ['schedule', 'schedule-detail', 'schedule-editor'].includes(view)

  const headerTitle = {
    home: '',
    list: '기록',
    detail: '기록',
    editor: selectedRecord ? '기록 수정' : '새 기록',
    schedule: '일정',
    'schedule-detail': '일정',
    'schedule-editor': selectedSchedule ? '일정 수정' : '새 일정',
    routine: '루틴',
    tracker: '목표',
    ledger: '가계부',
  }[view] ?? ''

  const isNarrow = useMediaQuery('(max-width: 500px)')

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        padding={isNarrow ? 10 : 'md'}
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
                    onClick={() => { setView('home'); setSelectedRecord(null); setSelectedSchedule(null) }}>
                    <IconHome size={18} />
                  </ActionIcon>
                  {(isRecord && view !== 'list') && (
                    <ActionIcon variant="subtle" color="gray" radius="xl"
                      onClick={() => { setView('list'); setSelectedRecord(null) }}>
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
                <ActionIcon variant="subtle" color="gray" radius="xl" onClick={openCatModal}>
                  <IconCategory size={18} />
                </ActionIcon>
              )}
              {view === 'schedule' && (
                <ActionIcon variant="subtle" color="gray" radius="xl" onClick={openScatModal}>
                  <IconCategory size={18} />
                </ActionIcon>
              )}
              {view === 'routine' && (
                <ActionIcon variant="light" color="indigo" radius="xl"
                  onClick={() => openRoutineDrawerRef.current?.()}>
                  <IconList size={18} />
                </ActionIcon>
              )}
              {view === 'tracker' && (
                <ActionIcon variant="subtle" color="gray" radius="xl" onClick={openTcatModal}>
                  <IconCategory size={18} />
                </ActionIcon>
              )}
              {view === 'ledger' && (
                <ActionIcon variant="subtle" color="gray" radius="xl" onClick={openLcatModal}>
                  <IconCategory size={18} />
                </ActionIcon>
              )}
              <DriveSync
                isSignedIn
                status={driveStatus}
                onPull={handleDrivePull}
                onPush={handleDrivePush}
                onSignOut={signOut}
                compact
              />
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          {view === 'home' && <HomeScreen onOpen={handleHomeOpen} />}

          {/* 기록 */}
          {view === 'list' && (
            <RecordList
              records={records}
              categories={categories}
              onView={record => { setSelectedRecord(record); setView('detail') }}
              onEdit={record => { setSelectedRecord(record); setView('editor') }}
              onDelete={handleDeleteRecord}
              onNew={() => { setSelectedRecord(null); setView('editor') }}
            />
          )}
          {view === 'detail' && selectedRecord && (
            <RecordDetail
              record={selectedRecord}
              categories={categories}
              onEdit={() => setView('editor')}
              onDelete={() => { handleDeleteRecord(selectedRecord.id); setView('list'); setSelectedRecord(null) }}
            />
          )}
          {view === 'editor' && (
            <RecordEditor
              record={selectedRecord}
              categories={categories}
              onSave={handleSaveRecord}
              onCancel={() => setView(selectedRecord ? 'detail' : 'list')}
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

          {/* 트래커 */}
          {view === 'tracker' && (
            <TrackerView
              categories={trackerCategories}
              logs={trackerLogs}
              getLog={getTrackerLog}
              setLog={setTrackerLog}
              bulkSetPlanned={bulkSetTrackerPlanned}
            />
          )}

          {/* 가계부 */}
          {view === 'ledger' && (
            <LedgerView
              items={ledgerItems}
              categories={ledgerCategories}
              onAdd={addLedgerItem}
              onDelete={deleteLedgerItem}
            />
          )}
        </AppShell.Main>
      </AppShell>

      <CategoryManager
        opened={catModalOpened}
        onClose={closeCatModal}
        categories={categories}
        onAdd={addCategory}
        onUpdate={updateCategory}
        onDelete={deleteCategory}
      />
      <ScheduleCategoryManager
        opened={scatModalOpened}
        onClose={closeScatModal}
        categories={scheduleCategories}
        onAdd={addScatCategory}
        onDelete={deleteScatCategory}
      />
      <TrackerCategoryManager
        opened={tcatModalOpened}
        onClose={closeTcatModal}
        categories={trackerCategories}
        onAdd={addTrackerCategory}
        onDelete={handleDeleteTrackerCategory}
      />
      <LedgerCategoryManager
        opened={lcatModalOpened}
        onClose={closeLcatModal}
        categories={ledgerCategories}
        onAdd={addLedgerCategory}
        onDelete={deleteLedgerCategory}
      />
    </>
  )
}
