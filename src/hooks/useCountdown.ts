import { useEffect, useRef, useState } from 'react'

/**
 * Compte à rebours basé sur l'horloge (robuste aux onglets en arrière-plan).
 * @param startedAt  timestamp de départ (ms). null = non démarré.
 * @param durationMs durée totale autorisée.
 * @param onExpire   appelé une fois lorsque le temps est écoulé.
 */
export function useCountdown(startedAt: number | null, durationMs: number, onExpire?: () => void) {
  const [remaining, setRemaining] = useState(durationMs)
  const firedRef = useRef(false)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (startedAt == null) {
      setRemaining(durationMs)
      firedRef.current = false
      return
    }
    const tick = () => {
      const left = Math.max(0, startedAt + durationMs - Date.now())
      setRemaining(left)
      if (left <= 0 && !firedRef.current) {
        firedRef.current = true
        onExpireRef.current?.()
      }
    }
    tick()
    const id = window.setInterval(tick, 500)
    return () => window.clearInterval(id)
  }, [startedAt, durationMs])

  return remaining
}

export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  if (m === 0) return `${s} s`
  return `${m} min ${String(s).padStart(2, '0')} s`
}
