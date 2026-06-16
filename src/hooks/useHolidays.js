import { useState, useEffect } from 'react'
import { fetchHolidays } from '../lib/holidays'

export function useHolidays(year, month) {
  const [holidays, setHolidays] = useState({})

  useEffect(() => {
    fetchHolidays(year, month).then(setHolidays).catch(() => {})
  }, [year, month])

  return holidays
}
