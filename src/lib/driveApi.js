// Google Drive(appDataFolder) REST 호출 공통 헬퍼

const API = 'https://www.googleapis.com/drive/v3'
const UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'

function authHeader(token) {
  return { Authorization: `Bearer ${token}` }
}

export async function findFileId(token, name) {
  const res = await fetch(
    `${API}/files?spaces=appDataFolder&q=${encodeURIComponent(`name='${name}'`)}&fields=files(id)`,
    { headers: authHeader(token) },
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.files?.[0]?.id ?? null
}

export async function downloadJson(token, fileId) {
  const res = await fetch(`${API}/files/${fileId}?alt=media`, { headers: authHeader(token) })
  return res.json()
}

export async function downloadBlob(token, fileId) {
  const res = await fetch(`${API}/files/${fileId}?alt=media`, { headers: authHeader(token) })
  if (!res.ok) return null
  return res.blob()
}

// existingId가 있으면 갱신(PATCH), 없으면 appDataFolder에 생성(POST)
export async function uploadFile(token, name, blob, existingId = null) {
  const meta = existingId ? { name } : { name, parents: ['appDataFolder'] }
  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
  form.append('file', blob)
  await fetch(
    `${UPLOAD_API}/files${existingId ? `/${existingId}` : ''}?uploadType=multipart`,
    { method: existingId ? 'PATCH' : 'POST', headers: authHeader(token), body: form },
  )
}
