import { useState, useRef, useCallback, useEffect } from 'react'
import { findFileId, downloadJson, uploadFile } from '../lib/driveApi'

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const FILE_NAME = 'record.json'
const USER_KEY = 'record_guser'

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
      const fileId = await findFileId(token, FILE_NAME)
      if (!fileId) { setStatus('synced'); return null }
      const data = await downloadJson(token, fileId)
      setStatus('synced')
      if (Array.isArray(data)) return { records: data, categories: null }
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
      const fileId = await findFileId(token, FILE_NAME)
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      await uploadFile(token, FILE_NAME, blob, fileId)
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

  return { isSignedIn: !!user, user, status, pull, push, signOut, getToken }
}
