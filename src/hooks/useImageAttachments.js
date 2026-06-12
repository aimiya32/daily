import { useState } from 'react'
import { storeImageFile, deleteImage, getImage, putImage } from '../lib/imageStore'
import { uploadImageRecord } from '../lib/driveImages'

// 편집 화면의 이미지 첨부 상태.
// 새 첨부는 저장(commit) 시점에야 IndexedDB에 쓰고, 기존 이미지 삭제도 그때 반영한다.
export function useImageAttachments(initialIds = []) {
  const [existingIds, setExistingIds] = useState(initialIds)
  const [removedIds, setRemovedIds] = useState([])
  const [pending, setPending] = useState([]) // [{ key, file }]

  const keptExisting = existingIds.filter(id => !removedIds.includes(id))

  function addFiles(files) {
    const list = Array.isArray(files) ? files : files ? [files] : []
    const items = list
      .filter(f => f.type?.startsWith('image/'))
      .map(f => ({ key: crypto.randomUUID(), file: f }))
    if (items.length) setPending(prev => [...prev, ...items])
  }

  function removePending(key) {
    setPending(prev => prev.filter(p => p.key !== key))
  }

  function removeExisting(id) {
    setRemovedIds(prev => [...prev, id])
  }

  function reset(ids = []) {
    setExistingIds(ids)
    setRemovedIds([])
    setPending([])
  }

  // 새 첨부를 저장하고 Drive에 백그라운드 업로드, 제거된 기존 이미지는 삭제.
  // 저장된 [{ id, file }] 배열을 반환한다.
  async function commit({ keepOriginal = false } = {}) {
    const added = []
    for (const p of pending) {
      const id = await storeImageFile(p.file, keepOriginal)
      added.push({ id, file: p.file })
      const rec = await getImage(id)
      if (rec) uploadImageRecord(id, rec).then(ok => { if (ok) putImage({ ...rec, uploaded: true }) })
    }
    for (const id of removedIds) await deleteImage(id)
    return added
  }

  return { pending, keptExisting, addFiles, removePending, removeExisting, reset, commit }
}
