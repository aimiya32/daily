import { useState, useRef, useCallback, useEffect } from 'react'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const FILE_NAME = 'diary.json'
const USER_KEY = 'diary_guser'

let gisLoaded = false
function loadGIS() {
  if (gisLoaded) return Promise.resolve()
  return new Promise(resolve => {
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.onload = () => { gisLoaded = true; resolve() }
    document.head.appendChild(s)
  })
}

function loadStoredUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
}

async function fetchUser(token) {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

async function driveGet(token, path) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

async function findFileId(token) {
  const data = await driveGet(token, `files?spaces=appDataFolder&q=name%3D'${FILE_NAME}'&fields=files(id)`)
  return data.files?.[0]?.id ?? null
}

async function downloadFile(token, fileId) {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.json()
}

async function uploadFile(token, payload, fileId) {
  const meta = { name: FILE_NAME, ...(!fileId && { parents: ['appDataFolder'] }) }
  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }))
  form.append('file', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
  await fetch(
    `https://www.googleapis.com/upload/drive/v3/files${fileId ? `/${fileId}` : ''}?uploadType=multipart`,
    { method: fileId ? 'PATCH' : 'POST', headers: { Authorization: `Bearer ${token}` }, body: form }
  )
}

export function useGoogleDrive() {
  const tokenRef = useRef(null)
  const [user, setUser] = useState(loadStoredUser)
  const [status, setStatus] = useState('idle')
  const clientRef = useRef(null)
  const pendingRef = useRef(null)

  const initClient = useCallback(async () => {
    await loadGIS()
    if (clientRef.current) return
    await new Promise(resolve => {
      clientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPE,
        callback: async (resp) => {
          if (resp.error) {
            pendingRef.current?.reject(new Error(resp.error))
          } else {
            tokenRef.current = resp.access_token
            try {
              const u = await fetchUser(resp.access_token)
              const info = { email: u.email, name: u.name, picture: u.picture }
              localStorage.setItem(USER_KEY, JSON.stringify(info))
              setUser(info)
            } catch {}
            pendingRef.current?.resolve(resp.access_token)
          }
          pendingRef.current = null
        },
        error_callback: (err) => {
          pendingRef.current?.reject(new Error(err.type))
          pendingRef.current = null
        },
      })
      resolve()
    })
  }, [])

  const getToken = useCallback(async ({ silent = false } = {}) => {
    if (tokenRef.current) return tokenRef.current
    await initClient()
    return new Promise((resolve, reject) => {
      pendingRef.current = { resolve, reject }
      clientRef.current.requestAccessToken({ prompt: silent ? '' : undefined })
    })
  }, [initClient])

  // 앱 시작 시 이전 로그인 정보가 있으면 토큰 자동 갱신 시도
  useEffect(() => {
    if (!loadStoredUser()) return
    getToken({ silent: true }).catch(() => {})
  }, [getToken])

  const pull = useCallback(async () => {
    setStatus('loading')
    try {
      const token = await getToken()
      const fileId = await findFileId(token)
      if (!fileId) { setStatus('synced'); return null }
      const data = await downloadFile(token, fileId)
      setStatus('synced')
      if (Array.isArray(data)) return { entries: data, categories: null }
      return data
    } catch {
      setStatus('error')
      return null
    }
  }, [getToken])

  const push = useCallback(async (payload) => {
    setStatus('loading')
    try {
      const token = await getToken()
      const fileId = await findFileId(token)
      await uploadFile(token, payload, fileId)
      setStatus('synced')
    } catch {
      setStatus('error')
    }
  }, [getToken])

  const signOut = useCallback(() => {
    if (tokenRef.current) window.google?.accounts?.oauth2?.revoke(tokenRef.current)
    tokenRef.current = null
    localStorage.removeItem(USER_KEY)
    setUser(null)
    setStatus('idle')
  }, [])

  return { isSignedIn: !!user, user, status, pull, push, signOut }
}
