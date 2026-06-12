import { useCollection } from './useCollection'

// 연락처 항목: { id, name, phone, fax, email, sns, note, tags: [], images: [imageId], imageMeta, updatedAt }
export function useContacts() {
  return useCollection('contacts', (a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''))
}
