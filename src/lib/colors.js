// 카테고리 색상 팔레트 (일정/목표 공용)
export const CATEGORY_COLORS = [
  { name: 'indigo', hex: '#4F46E5' },
  { name: 'blue',   hex: '#339af0' },
  { name: 'teal',   hex: '#20c997' },
  { name: 'green',  hex: '#51cf66' },
  { name: 'yellow', hex: '#fcc419' },
  { name: 'orange', hex: '#ff922b' },
  { name: 'red',    hex: '#ff6b6b' },
  { name: 'grape',  hex: '#cc5de8' },
  { name: 'pink',   hex: '#f06595' },
]

export const DEFAULT_HEX = '#4F46E5'

export function hexOf(colorName) {
  return CATEGORY_COLORS.find(c => c.name === colorName)?.hex ?? DEFAULT_HEX
}
