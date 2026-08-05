import { useMediaQuery } from '@mantine/hooks'

// 화면 폭 기준점. CSS 미디어쿼리와 짝이 맞아야 하므로 여기서 한 곳으로 관리한다.
export const BP = { NARROW: 500, MOBILE: 689 }

export function useIsNarrow() { return useMediaQuery(`(max-width: ${BP.NARROW}px)`) }
export function useIsMobile() { return useMediaQuery(`(max-width: ${BP.MOBILE}px)`) }
