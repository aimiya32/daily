const CACHE = {}

export async function fetchHolidays(year, month) {
  const key = `${year}-${String(month).padStart(2, '0')}`
  if (CACHE[key] !== undefined) return CACHE[key]

  const apiKey = import.meta.env.VITE_HOLIDAY_API_KEY
  if (!apiKey) return {}

  const url =
    `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo` +
    `?solYear=${year}&solMonth=${String(month).padStart(2, '0')}` +
    `&ServiceKey=${encodeURIComponent(apiKey)}&_type=json&numOfRows=50`

  try {
    const res = await fetch(url)
    const data = await res.json()
    console.log('[holidays]', year, month, data)
    const raw = data?.response?.body?.items?.item
    const list = raw ? (Array.isArray(raw) ? raw : [raw]) : []

    const result = {}
    for (const item of list) {
      if (item.isHoliday !== 'Y') continue
      const d = String(item.locdate)
      const dateStr = `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`
      result[dateStr] = item.dateName
    }

    CACHE[key] = result
    return result
  } catch {
    return {}
  }
}
