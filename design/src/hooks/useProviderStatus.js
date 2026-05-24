import { useEffect, useState } from 'react'
import { API_BASE } from '../config.js'

const POLL_INTERVAL_MS = 5000

/**
 * Опрашивает /health и возвращает список зарегистрированных провайдеров
 * с их остатками лимитов.
 */
export function useProviderStatus() {
  const [providers, setProviders] = useState([])
  const [online, setOnline] = useState(false)

  useEffect(() => {
    let cancelled = false

    const tick = async () => {
      try {
        const r = await fetch(`${API_BASE}/health`)
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const data = await r.json()
        if (!cancelled) {
          setProviders(data.providers || [])
          setOnline(true)
        }
      } catch {
        if (!cancelled) setOnline(false)
      }
    }

    tick()
    const id = setInterval(tick, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  return { providers, online }
}
