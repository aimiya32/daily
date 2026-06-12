import { useState, useEffect } from 'react'

// localStorage에 JSON으로 영속되는 useState.
// normalize를 주면 로드된 값(또는 initial)을 한 번 가공해서 초기값으로 쓴다.
export function useLocalStorageState(key, initial = [], normalize) {
  const [value, setValue] = useState(() => {
    let loaded = initial
    try {
      const raw = localStorage.getItem(key)
      if (raw) loaded = JSON.parse(raw)
    } catch {
      loaded = initial
    }
    return normalize ? normalize(loaded) : loaded
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  return [value, setValue]
}
