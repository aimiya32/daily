import { useState, useEffect } from 'react'
import { Box } from '@mantine/core'
import { getImage, putImage } from '../lib/imageStore'
import { downloadImageBlob } from '../lib/driveImages'

// IndexedDB에 저장된 이미지를 표시. 로컬에 없으면 Drive에서 받아 캐시한다.
// variant: 'thumb' | 'original'
export default function StoredImage({ id, variant = 'thumb', radius = 8, height, style, onClick }) {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    let active = true
    let objUrl = null

    async function resolveBlob() {
      const rec = await getImage(id)
      const wantOriginal = variant === 'original'

      // 1) 로컬에 있으면 사용
      if (rec) {
        const local = wantOriginal ? (rec.original || rec.thumb) : rec.thumb
        if (local) return local
      }

      // 2) Drive에서 다운로드 후 캐시
      const kind = wantOriginal ? 'orig' : 'thumb'
      let blob = await downloadImageBlob(id, kind)
      if (!blob && wantOriginal) {
        // 원본이 없으면 썸네일로 대체
        blob = (rec && rec.thumb) || await downloadImageBlob(id, 'thumb')
      }
      if (blob) {
        const base = rec ?? { id, createdAt: new Date().toISOString() }
        const merged = kind === 'orig'
          ? { ...base, original: blob, originalType: blob.type }
          : { ...base, thumb: blob, type: blob.type }
        putImage(merged)
      }
      return blob
    }

    resolveBlob().then((blob) => {
      if (active && blob) {
        objUrl = URL.createObjectURL(blob)
        setUrl(objUrl)
      }
    })

    return () => { active = false; if (objUrl) URL.revokeObjectURL(objUrl) }
  }, [id, variant])

  if (!url) {
    return (
      <Box style={{ width: '100%', height: height ?? 96, borderRadius: radius, background: 'var(--mantine-color-gray-1)' }} />
    )
  }

  return (
    <img
      src={url}
      onClick={onClick}
      style={{
        width: '100%',
        height: height ?? 96,
        objectFit: 'cover',
        borderRadius: radius,
        display: 'block',
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    />
  )
}
