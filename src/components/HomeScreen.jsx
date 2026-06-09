import { UnstyledButton, Stack, Text, Box, Center, ActionIcon, SimpleGrid } from '@mantine/core'
import {
  IconBook2, IconCalendar, IconRepeat, IconChartBar, IconWallet, IconAddressBook,
  IconEye, IconEyeOff,
} from '@tabler/icons-react'
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useHomeMenu } from '../hooks/useHomeMenu'

const APP_DEFS = {
  schedule: { label: '일정',   icon: IconCalendar,    color: '#A78BFA' },
  tracker:  { label: '목표',   icon: IconChartBar,    color: '#34D399' },
  routine:  { label: '루틴',   icon: IconRepeat,      color: '#38BDF8' },
  record:   { label: '기록',   icon: IconBook2,       color: '#818CF8' },
  ledger:   { label: '가계부', icon: IconWallet,      color: '#F472B6' },
  contacts: { label: '연락처', icon: IconAddressBook, color: '#FB923C' },
}
const ALL_IDS = ['schedule', 'tracker', 'routine', 'record', 'ledger', 'contacts']

export default function HomeScreen({ onOpen, editing = false }) {
  const { menu, toggleVisible, reorder } = useHomeMenu(ALL_IDS)
  const sensors = useSensors(
    // 데스크톱: 5px 이상 끌면 즉시 드래그
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // 모바일: 200ms 꾹 누른 뒤 드래그(짧게 누르면 스크롤/탭)
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  )

  const visibleMenu = menu.filter(m => m.visible)

  function handleDragEnd(event) {
    const { active, over } = event
    if (over && active.id !== over.id) reorder(active.id, over.id)
  }

  return (
    <Center py="xl" px="md">
      <Stack gap="md" w="100%" maw={600}>
        {editing ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={menu.map(m => m.id)} strategy={rectSortingStrategy}>
              <SimpleGrid cols={2} spacing="md">
                {menu.map(m => (
                  <SortableMenuCard
                    key={m.id}
                    id={m.id}
                    def={APP_DEFS[m.id]}
                    visible={m.visible}
                    onToggle={() => toggleVisible(m.id)}
                  />
                ))}
              </SimpleGrid>
            </SortableContext>
          </DndContext>
        ) : (
          visibleMenu.length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="xl">표시할 메뉴가 없어요. ‘편집’에서 켜보세요.</Text>
          ) : (
            <SimpleGrid cols={2} spacing="md">
              {visibleMenu.map(m => (
                <AppRow key={m.id} {...APP_DEFS[m.id]} onClick={() => onOpen(m.id)} />
              ))}
            </SimpleGrid>
          )
        )}
      </Stack>
    </Center>
  )
}

function CardFace({ label, icon: Icon, color = '#4F46E5', dim = false }) {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        width: '100%',
        aspectRatio: '1 / 1',
        padding: '20px 16px',
        borderRadius: 20,
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
        border: `1px solid ${color}18`,
        opacity: dim ? 0.45 : 1,
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
      <Text fw={700} size="lg" c="#475569" ta="center">{label}</Text>
    </Box>
  )
}

function AppRow({ onClick, ...def }) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{ width: '100%', transition: 'transform 0.15s ease' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      <CardFace {...def} />
    </UnstyledButton>
  )
}

function SortableMenuCard({ id, def, visible, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 2 : 1,
    position: 'relative',
    cursor: 'grab',
    touchAction: 'manipulation',
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ActionIcon
        variant="subtle" color="gray" radius="xl" size="md"
        style={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onToggle}
      >
        {visible ? <IconEye size={18} color="#94A3B8" /> : <IconEyeOff size={18} color="#94A3B8" />}
      </ActionIcon>
      <CardFace {...def} dim={!visible} />
    </div>
  )
}
