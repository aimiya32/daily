// 이미지를 Google Drive(appDataFolder)에 개별 파일로 업로드/다운로드한다.
// 파일명 규칙: img_<id>_thumb , img_<id>_orig
// 토큰은 앱에서 setImageTokenProvider로 주입한다(조용한 토큰 사용).

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

async function findFileId(token, name) {
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${encodeURIComponent(`name='${name}'`)}&fields=files(id)`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.files?.[0]?.id ?? null
}

async function uploadBlob(token, name, blob) {
  const existing = await findFileId(token, name)
  const meta = existing ? { name } : { name, parents: ['appDataFolder'] }
  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
  form.append('file', blob)
  await fetch(
    `https://www.googleapis.com/upload/drive/v3/files${existing ? `/${existing}` : ''}?uploadType=multipart`,
    { method: existing ? 'PATCH' : 'POST', headers: { Authorization: `Bearer ${token}` }, body: form },
  )
}

// 로컬 이미지 레코드를 Drive에 업로드. 성공 시 true.
export async function uploadImageRecord(id, rec) {
  const token = await getTok()
  if (!token || !rec) return false
  try {
    if (rec.thumb) await uploadBlob(token, fileName(id, 'thumb'), rec.thumb)
    if (rec.original) await uploadBlob(token, fileName(id, 'orig'), rec.original)
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
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fid}?alt=media`,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    if (!res.ok) return null
    return await res.blob()
  } catch {
    return null
  }
}
