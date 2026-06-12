// 이미지를 Google Drive(appDataFolder)에 개별 파일로 업로드/다운로드한다.
// 파일명 규칙: img_<id>_thumb , img_<id>_orig
// 토큰은 앱에서 setImageTokenProvider로 주입한다(조용한 토큰 사용).
import { findFileId, downloadBlob, uploadFile } from './driveApi'

let tokenProvider = null

export function setImageTokenProvider(fn) {
  tokenProvider = fn
}

async function getTok() {
  if (!tokenProvider) return null
  try { return await tokenProvider() } catch { return null }
}

function fileName(id, kind) {
  return `img_${id}_${kind}`
}

async function uploadOne(token, name, blob) {
  const existing = await findFileId(token, name)
  await uploadFile(token, name, blob, existing)
}

// 로컬 이미지 레코드를 Drive에 업로드. 성공 시 true.
export async function uploadImageRecord(id, rec) {
  const token = await getTok()
  if (!token || !rec) return false
  try {
    if (rec.thumb) await uploadOne(token, fileName(id, 'thumb'), rec.thumb)
    if (rec.original) await uploadOne(token, fileName(id, 'orig'), rec.original)
    return true
  } catch {
    return false
  }
}

// Drive에서 이미지 blob 다운로드. kind: 'thumb' | 'orig'
export async function downloadImageBlob(id, kind) {
  const token = await getTok()
  if (!token) return null
  try {
    const fid = await findFileId(token, fileName(id, kind))
    if (!fid) return null
    return await downloadBlob(token, fid)
  } catch {
    return null
  }
}
