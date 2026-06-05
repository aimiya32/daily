// IndexedDB 기반 이미지 저장소.
// 레코드: { id, thumb: Blob, original: Blob|null, type, originalType, createdAt }
// 큰 이미지(원본)는 localStorage 한계를 넘기므로 IndexedDB에 보관한다.

const DB_NAME = 'diary-images'
const STORE = 'images'
const THUMB_MAX = 480       // 썸네일 최대 변 길이(px)
const THUMB_QUALITY = 0.8

let dbPromise = null

function openDB() {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
  return dbPromise
}

export async function putImage(record) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(record)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getImage(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(id)
    req.onsuccess = () => resolve(req.result || null)
    req.onerror = () => reject(req.error)
  })
}

export async function deleteImage(id) {
  const db = await openDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => resolve() // 실패해도 앱 흐름 막지 않음
  })
}

export async function deleteImages(ids) {
  for (const id of ids ?? []) await deleteImage(id)
}

// 파일 → 썸네일(+선택적 원본) 레코드 생성 후 저장. 저장된 id 반환.
export async function storeImageFile(file, keepOriginal) {
  const thumb = await resizeToBlob(file, THUMB_MAX, THUMB_QUALITY)
  const record = {
    id: crypto.randomUUID(),
    thumb,
    type: 'image/jpeg',
    original: keepOriginal ? file : null,
    originalType: keepOriginal ? file.type : null,
    createdAt: new Date().toISOString(),
  }
  await putImage(record)
  return record.id
}

function resizeToBlob(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      const scale = Math.min(1, maxSize / Math.max(width, height))
      width = Math.max(1, Math.round(width * scale))
      height = Math.max(1, Math.round(height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('thumbnail 생성 실패'))),
        'image/jpeg',
        quality,
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('이미지 로드 실패')) }
    img.src = url
  })
}
