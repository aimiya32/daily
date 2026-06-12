import { useMediaQuery } from '@mantine/hooks'

export function useCalendarMaxItems() {
  const isUnder550  = useMediaQuery('(max-width: 549px)')
  const isUnder700  = useMediaQuery('(max-width: 699px)')
  const isUnder890  = useMediaQuery('(max-width: 889px)')
  const isUnder1024 = useMediaQuery('(max-width: 1023px)')
  return isUnder550 ? 0 : isUnder700 ? 1 : isUnder890 ? 2 : isUnder1024 ? 3 : 4
}
