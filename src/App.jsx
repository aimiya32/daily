import { useState, useRef, useEffect } from 'react'
import { AppShell, Group, Text, Button, ActionIcon, SegmentedControl } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import { IconCategory, IconHome, IconList, IconCalendar, IconChartBar, IconPencil, IconCheck, IconArrowsHorizontal } from '@tabler/icons-react'
import dayjs from 'dayjs'
import RecordEditor from './components/RecordEditor'
import RecordList from './components/RecordList'
import RecordDetail from './components/RecordDetail'
import ScheduleCalendar from './components/ScheduleCalendar'
import ScheduleDayDrawer from './components/ScheduleDayDrawer'
import ScheduleEditor from './components/ScheduleEditor'
import ScheduleDetail from './components/ScheduleDetail'
import ScheduleCategoryManager from './components/ScheduleCategoryManager'
import RoutineView from './components/RoutineView'
import TrackerView from './components/TrackerView'
import LedgerView from './components/LedgerView'
import LedgerCategoryManager from './components/LedgerCategoryManager'
import ContactsView from './components/ContactsView'
import TrackerCategoryManager from './components/TrackerCategoryManager'
import HomeScreen from './components/HomeScreen'
import ApplicationView from './components/ApplicationView'
import EngineerExamView from './components/EngineerExamView'
import LoginScreen from './components/LoginScreen'
import DriveSync from './components/DriveSync'
import CategoryManager from './components/CategoryManager'
import WorkDashboard from './components/WorkDashboard'
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
import { useContacts } from './hooks/useContacts'
import { useExamResults } from './hooks/useExamResults'
import { useGoogleDrive } from './hooks/useGoogleDrive'
import { useWorkTodos } from './hooks/useWorkTodos'
import { useWorkEvents } from './hooks/useWorkEvents'
import { useWorkWeekly } from './hooks/useWorkWeekly'
import { setAccountPrefix, isInitialized, markInitialized, nk } from './lib/accountStorage'
import { solarFromLunar } from './lib/lunar'
import { deleteImages, getImage, putImage } from './lib/imageStore'
import { setImageTokenProvider, uploadImageRecord } from './lib/driveImages'
import { mergeById } from './lib/mergeById'

// ── 로그인 게이트 ─────────────────────────────────────────
// 로그인 전에는 데이터 훅을 마운트하지 않고, 로그인 후 계정별 네임스페이스를
// 설정한 뒤 계정 키로 Workspace를 마운트한다. 계정이 바뀌면 remount되어
// 그 계정의 데이터로 새로 뜬다.
export default function App() {
  const drive = useGoogleDrive()

  if (!drive.isSignedIn) {
    return <LoginScreen onLogin={() => drive.pull()} />
  }

  // 아래 두 호출은 Workspace의 훅들이 첫 렌더에서 nk()로 localStorage를 읽고
  // 자식 effect가 이미지 다운로드를 시작하기 전에 끝나야 하므로
  // useEffect로 옮기면 안 된다. (둘 다 멱등)
  const accountKey = drive.user?.email || drive.user?.name || 'user'
  setAccountPrefix(accountKey)
  // 이미지 Drive 업/다운로드용 토큰 공급자 등록 (조용한 토큰)
  setImageTokenProvider(() => drive.getToken({ silent: true }))

  return <Workspace key={accountKey} drive={drive} />
}

// 홈 메뉴 id → 뷰 이름
const HOME_VIEW_BY_ID = {
  record: 'list',
  schedule: 'schedule',
  routine: 'routine',
  tracker: 'tracker',
  ledger: 'ledger',
  contacts: 'contacts',
}

// ── 실제 앱 (로그인된 계정 기준) ──────────────────────────
function Workspace({ drive }) {
  const { status: driveStatus, pull, push, signOut } = drive

  const [view, setView] = useState('home')
  const [editingHome, setEditingHome] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [scheduleInitialDate, setScheduleInitialDate] = useState(null)
  const [catModalOpened, { open: openCatModal, close: closeCatModal }] = useDisclosure(false)
  const [scatModalOpened, { open: openScatModal, close: closeScatModal }] = useDisclosure(false)
  const [tcatModalOpened, { open: openTcatModal, close: closeTcatModal }] = useDisclosure(false)
  const [lcatModalOpened, { open: openLcatModal, close: closeLcatModal }] = useDisclosure(false)
  // 대시보드에서 여는 날짜별 일정 드로어
  const [workDayDrawerOpened, { open: openWorkDayDrawer, close: closeWorkDayDrawer }] = useDisclosure(false)
  const openRoutineDrawerRef = useRef(null)

  // 업무 모드
  const [mode, setMode] = useState('work')
  const [workDateStr, setWorkDateStr] = useState(dayjs().format('YYYY-MM-DD'))

  const { records, allRecords, saveRecord, deleteRecord, mergeRecords } = useRecords()
  const { categories, addCategory, updateCategory, deleteCategory, setAll: setAllCategories } = useCategories()
  const { schedules, allSchedules, saveSchedule, deleteSchedule, deleteByRecurrenceId, updateByRecurrenceId, mergeSchedules } = useSchedules()
  const { categories: scheduleCategories, addCategory: addScatCategory, deleteCategory: deleteScatCategory, setAll: setAllScatCategories } = useScheduleCategories()
  const { routines, addRoutine, updateRoutine, toggleVisible, setAll: setAllRoutines } = useRoutines()
  const { allChecks: allRoutineChecks, isChecked, toggle: toggleCheck, getCheckedRoutineIds, mergeChecks } = useRoutineChecks()
  const { categories: trackerCategories, addCategory: addTrackerCategory, deleteCategory: deleteTrackerCategory, setAll: setAllTrackerCategories } = useTrackerCategories()
  const { logs: trackerLogs, allLogs: allTrackerLogs, getLog: getTrackerLog, setLog: setTrackerLog, deleteLogsByCategory: deleteTrackerLogsByCategory, bulkSetPlanned: bulkSetTrackerPlanned, mergeLogs: mergeTrackerLogs } = useTrackerLogs()
  const { items: ledgerItems, allItems: allLedgerItems, addItem: addLedgerItem, updateItem: updateLedgerItem, deleteItem: deleteLedgerItem, mergeItems: mergeLedgerItems } = useLedger()
  const { categories: ledgerCategories, addCategory: addLedgerCategory, deleteCategory: deleteLedgerCategory, setAll: setAllLedgerCategories } = useLedgerCategories()
  const { items: contactItems, allItems: allContactItems, addItem: addContactItem, updateItem: updateContactItem, deleteItem: deleteContactItem, mergeItems: mergeContactItems } = useContacts()
  const { items: examResults, allItems: allExamResults, addItem: addExamResult, mergeItems: mergeExamResults } = useExamResults()
  const { items: workTodos, allItems: allWorkTodos, addItem: addTodoRaw, updateItem: updateTodo, deleteItem: deleteTodo, mergeItems: mergeWorkTodos } = useWorkTodos()
  const { items: workEvents, allItems: allWorkEvents, updateItem: updateEvent, deleteItem: deleteEvent, mergeItems: mergeWorkEvents } = useWorkEvents()
  const { items: workWeekly, allItems: allWorkWeekly, updateItem: updateWeekly, deleteItem: deleteWeekly, mergeItems: mergeWorkWeekly } = useWorkWeekly()

  function applyDriveData(data) {
    if (!data) return
    if (data.records) mergeRecords(data.records)
    // 카테고리류는 여러 기기에서 불러오기를 반복해도 로컬 고유 항목이 사라지지
    // 않도록 통째 교체 대신 id 기준 병합(mergeById)을 쓴다. updatedAt이 없는
    // 항목은 LWW 비교(remote > local)가 항상 false가 되어 로컬이 유지된다.
    if (data.categories) setAllCategories(mergeById(categories, data.categories))
    if (data.schedules) mergeSchedules(data.schedules)
    if (data.scheduleCategories) setAllScatCategories(mergeById(scheduleCategories, data.scheduleCategories))
    if (data.routines) setAllRoutines(mergeById(routines, data.routines))
    if (data.routineChecks) mergeChecks(data.routineChecks)
    if (data.trackerCategories) setAllTrackerCategories(mergeById(trackerCategories, data.trackerCategories))
    if (data.trackerLogs) mergeTrackerLogs(data.trackerLogs)
    if (data.ledger) mergeLedgerItems(data.ledger)
    if (data.ledgerCategories) setAllLedgerCategories(mergeById(ledgerCategories, data.ledgerCategories))
    if (data.contacts) mergeContactItems(data.contacts)
    if (data.examResults) mergeExamResults(data.examResults)
    if (data.workTodos) mergeWorkTodos(data.workTodos)
    if (data.workEvents) mergeWorkEvents(data.workEvents)
    if (data.workWeekly) mergeWorkWeekly(data.workWeekly)
  }

  async function handleDrivePull() {
    applyDriveData(await pull())
  }

  // 아직 Drive에 안 올라간 이미지들을 업로드 (백그라운드 업로드 실패분 보완)
  async function syncImagesToDrive() {
    const ids = [...new Set([...records, ...contactItems].flatMap(e => e.images ?? []))]
    for (const id of ids) {
      const rec = await getImage(id)
      if (rec && !rec.uploaded) {
        const ok = await uploadImageRecord(id, rec)
        if (ok) await putImage({ ...rec, uploaded: true })
      }
    }
  }

  async function handleDrivePush() {
    await push({ records: allRecords, categories, schedules: allSchedules, scheduleCategories, routines, routineChecks: allRoutineChecks, trackerCategories, trackerLogs: allTrackerLogs, ledger: allLedgerItems, ledgerCategories, contacts: allContactItems, examResults: allExamResults, workTodos: allWorkTodos, workEvents: allWorkEvents, workWeekly: allWorkWeekly })
    await syncImagesToDrive()
  }

  async function handleSaveExamResult(entry) {
    addExamResult(entry)
    await push({ records: allRecords, categories, schedules: allSchedules, scheduleCategories, routines, routineChecks: allRoutineChecks, trackerCategories, trackerLogs: allTrackerLogs, ledger: allLedgerItems, ledgerCategories, contacts: allContactItems, examResults: [entry, ...allExamResults], workTodos: allWorkTodos, workEvents: allWorkEvents, workWeekly: allWorkWeekly })
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
    const next = HOME_VIEW_BY_ID[id]
    if (next) setView(next)
  }

  function handleDeleteTrackerCategory(id) {
    deleteTrackerCategory(id)
    deleteTrackerLogsByCategory(id)
  }

  function handleModeChange(next) {
    setMode(next)
    setView('home')
    setSelectedRecord(null)
    setSelectedSchedule(null)
  }

  // ── 업무: 투두 ──
  function addTodo(dateStr, text) {
    const t = (text || '').trim()
    if (!t) return
    addTodoRaw({ id: crypto.randomUUID(), date: dateStr, text: t, done: false, updatedAt: new Date().toISOString() })
  }

  function toggleTodo(item) {
    updateTodo({ ...item, done: !item.done, updatedAt: new Date().toISOString() })
  }

  function editTodo(item, text) {
    const t = (text || '').trim()
    if (!t || t === item.text) return
    updateTodo({ ...item, text: t, updatedAt: new Date().toISOString() })
  }

  // ── 업무: 시간별 일정 ──
  function editEvent(item, text) {
    const t = (text || '').trim()
    if (!t || t === item.text) return
    updateEvent({ ...item, text: t, updatedAt: new Date().toISOString() })
  }

  // ── 업무: 주간 일정 ──
  function editWeekly(item, text) {
    const t = (text || '').trim()
    if (!t || t === item.text) return
    updateWeekly({ ...item, text: t, updatedAt: new Date().toISOString() })
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

  function handleDeleteContact(id) {
    const target = contactItems.find(e => e.id === id)
    if (target?.images?.length) deleteImages(target.images)
    deleteContactItem(id)
  }

  // 일정 저장 로직(뷰 전환 제외) — 개인 메뉴와 대시보드 모달이 공용으로 쓴다
  function persistSchedule(schedule) {
    const { yearlyRepeat, repeatMode, repeatCount, lunarRecurrence, ...base } = schedule
    if (yearlyRepeat) {
      const recurrenceId = crypto.randomUUID()
      const startYear = parseInt(base.date.slice(0, 4))
      const endYear = repeatMode === 'count' ? startYear + (repeatCount ?? 10) - 1 : 2050
      const totalYears = endYear - startYear + 1
      for (let i = 0; i < totalYears; i++) {
        const year = startYear + i
        let date
        if (lunarRecurrence) {
          const solar = solarFromLunar(year, lunarRecurrence.month, lunarRecurrence.day)
          if (!solar) continue
          date = `${solar.year}-${String(solar.month).padStart(2, '0')}-${String(solar.day).padStart(2, '0')}`
        } else {
          date = `${year}${base.date.slice(4)}`
        }
        saveSchedule({ ...base, id: crypto.randomUUID(), date, recurrenceId, updatedAt: new Date().toISOString() })
      }
    } else {
      saveSchedule(base)
    }
  }

  function handleSaveSchedule(schedule) {
    const { applyToAll, ...base } = schedule
    if (applyToAll && base.recurrenceId) {
      // 반복 일정 전체 수정: 날짜 외 필드만 병합(현재 항목의 날짜 변경은 무시)
      updateByRecurrenceId(base.recurrenceId, {
        title: base.title,
        time: base.time,
        description: base.description,
        categoryId: base.categoryId,
      })
    } else {
      persistSchedule(base)
    }
    setView(mode === 'work' ? 'home' : 'schedule')
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
    contacts: '연락처',
    application: 'Etc.',
    engineer: '정보처리기사 필기',
  }[view] ?? ''

  const isNarrow = useMediaQuery('(max-width: 500px)')
  // 모바일(<690px) 대시보드를 태블릿처럼 3열 가로스크롤로 강제 표시하는 토글
  const isMobileDash = useMediaQuery('(max-width: 689px)')
  const [wideDashboard, setWideDashboard] = useState(false)

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
          // Mantine 기본값은 min-height:100dvh. standalone PWA에선 dvh가 실제 창 높이보다 커서
          // 콘텐츠가 짧아도 그 차이만큼 세로 스크롤이 생긴다 → 높이는 콘텐츠가 정하게 둔다(배경은 body가 칠함).
          main: { backgroundColor: '#F4F6FB', minHeight: 'auto' },
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
              {view === 'home' && mode === 'personal' && (
                <ActionIcon variant={editingHome ? 'light' : 'subtle'} color={editingHome ? 'indigo' : 'gray'}
                  radius="xl" onClick={() => setEditingHome(e => !e)}>
                  {editingHome ? <IconCheck size={18} /> : <IconPencil size={18} />}
                </ActionIcon>
              )}
              {view === 'list' && (
                <ActionIcon variant="subtle" color="gray" radius="xl" onClick={openCatModal}>
                  <IconCategory size={18} />
                </ActionIcon>
              )}
              {view === 'home' && mode === 'work' && isMobileDash && (
                <ActionIcon
                  variant={wideDashboard ? 'light' : 'subtle'}
                  color={wideDashboard ? 'indigo' : 'gray'}
                  radius="xl"
                  onClick={() => setWideDashboard(w => !w)}
                >
                  <IconArrowsHorizontal size={18} />
                </ActionIcon>
              )}
              {(view === 'schedule' || (view === 'home' && mode === 'work')) && (
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
                status={driveStatus}
                onPull={handleDrivePull}
                onPush={handleDrivePush}
                onSignOut={signOut}
              />
              <SegmentedControl
                size="xs"
                radius="xl"
                value={mode}
                onChange={handleModeChange}
                data={[{ label: 'Dashboard', value: 'work' }, { label: 'Apps', value: 'personal' }]}
              />
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          {view === 'home' && mode === 'personal' && <HomeScreen onOpen={handleHomeOpen} editing={editingHome} onOpenApplication={() => setView('application')} />}

          {view === 'home' && mode === 'work' && (
            <WorkDashboard
              todos={workTodos}
              events={workEvents}
              schedules={schedules}
              scheduleCategories={scheduleCategories}
              weekly={workWeekly}
              dateStr={workDateStr}
              onChangeDate={setWorkDateStr}
              onAddTodo={addTodo}
              onToggleTodo={toggleTodo}
              onEditTodo={editTodo}
              onDeleteTodo={deleteTodo}
              onEditEvent={editEvent}
              onDeleteEvent={deleteEvent}
              onEditWeekly={editWeekly}
              onDeleteWeekly={deleteWeekly}
              onAddSchedule={openWorkDayDrawer}
              forceWide={wideDashboard}
            />
          )}

          {view === 'application' && <ApplicationView onOpen={(id) => setView(id)} />}

          {view === 'engineer' && <EngineerExamView onSaveResult={handleSaveExamResult} examResults={examResults} />}

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
              onDelete={() => { deleteSchedule(selectedSchedule.id); setView(mode === 'work' ? 'home' : 'schedule'); setSelectedSchedule(null) }}
              onDeleteAll={() => { deleteByRecurrenceId(selectedSchedule.recurrenceId); setView(mode === 'work' ? 'home' : 'schedule'); setSelectedSchedule(null) }}
            />
          )}
          {view === 'schedule-editor' && (
            <ScheduleEditor
              schedule={selectedSchedule}
              categories={scheduleCategories}
              initialDate={scheduleInitialDate}
              onSave={handleSaveSchedule}
              onCancel={() => setView(selectedSchedule ? 'schedule-detail' : (mode === 'work' ? 'home' : 'schedule'))}
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
              onUpdate={updateLedgerItem}
              onDelete={deleteLedgerItem}
            />
          )}

          {/* 연락처 */}
          {view === 'contacts' && (
            <ContactsView
              items={contactItems}
              onAdd={addContactItem}
              onUpdate={updateContactItem}
              onDelete={handleDeleteContact}
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

      {/* 대시보드 날짜별 일정 드로어: 개인 '일정' 화면과 동일한 드로어 재사용 */}
      <ScheduleDayDrawer
        opened={workDayDrawerOpened}
        onClose={closeWorkDayDrawer}
        date={workDateStr}
        schedules={schedules}
        categories={scheduleCategories}
        onView={s => { setSelectedSchedule(s); setView('schedule-detail') }}
        onAdd={date => { setSelectedSchedule(null); setScheduleInitialDate(date); setView('schedule-editor') }}
      />
    </>
  )
}
