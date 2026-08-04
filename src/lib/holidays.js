const CACHE = {}

export async function fetchHolidays(year, month) {
  const key = `${year}-${String(month).padStart(2, '0')}`
  if (CACHE[key] !== undefined) return CACHE[key]

  const apiKey = import.meta.env.VITE_HOLIDAY_API_KEY
  if (!apiKey) return {}

  // getHoliDeInfo가 아니라 getRestDeInfo(국경일 및 공휴일)를 쓴다. 발급받은 키에
  // 등록된 오퍼레이션이 이쪽이며, getHoliDeInfo는 SERVICE_KEY_IS_NOT_REGISTERED로 거부된다.
  // 국경일도 함께 오지만 아래에서 isHoliday === 'Y'로 걸러 공휴일만 남긴다.
  const url =
    `https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo` +
    `?solYear=${year}&solMonth=${String(month).padStart(2, '0')}` +
    `&ServiceKey=${encodeURIComponent(apiKey)}&_type=json&numOfRows=50`

  try {
    const res = await fetch(url)
    const data = await res.json()

    // 공공데이터포털은 인증 실패 등을 200 응답 + OpenAPI_ServiceResponse 봉투로 돌려준다.
    // 이 경우 결과를 캐시하면 키를 고쳐도 같은 세션에서 재조회되지 않으므로 캐시하지 않는다.
    const fault = data?.OpenAPI_ServiceResponse?.cmmMsgHeader
    if (fault) {
      console.warn(`[holidays] ${key} 조회 실패: ${fault.errMsg} (${fault.returnAuthMsg})`)
      return {}
    }

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
  } catch (err) {
    console.warn(`[holidays] ${key} 조회 실패:`, err)
    return {}
  }
}
