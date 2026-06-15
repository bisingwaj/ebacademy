import { useCallback, useEffect, useRef, useState } from 'react'
import type { FocusEvent } from '../types'
import { beep, startAlarm, stopAlarm } from '../lib/audio'

interface FocusGuardState {
  away: boolean
  reason: 'hidden' | 'blur' | null
  count: number
}

/**
 * Surveille la présence du candidat sur la page d'examen.
 * - Détecte le changement d'onglet / fenêtre minimisée (visibilitychange)
 *   et la perte de focus de la fenêtre (blur).
 * - Déclenche une alarme sonore tant que le candidat est hors de l'examen.
 * - Journalise chaque sortie (horodatage, durée, motif) pour le rapport.
 * - `flush()` finalise une sortie en cours, coupe l'alarme et renvoie la liste
 *   complète des sorties (à appeler au moment de la soumission).
 *
 * @param active  n'arme la surveillance que pendant l'examen.
 */
export function useFocusGuard(active: boolean): FocusGuardState & {
  events: FocusEvent[]
  flush: () => FocusEvent[]
} {
  const [state, setState] = useState<FocusGuardState>({ away: false, reason: null, count: 0 })
  const eventsRef = useRef<FocusEvent[]>([])
  const awayStart = useRef<number | null>(null)
  const reasonRef = useRef<'hidden' | 'blur' | null>(null)
  const activeRef = useRef(active)
  activeRef.current = active

  const isPresent = useCallback(() => {
    const visible = typeof document === 'undefined' || document.visibilityState === 'visible'
    const focused = typeof document === 'undefined' || (document.hasFocus ? document.hasFocus() : true)
    return visible && focused
  }, [])

  const leave = useCallback((reason: 'hidden' | 'blur') => {
    if (!activeRef.current) return
    if (awayStart.current != null) {
      // Déjà parti : un changement d'onglet (hidden) prime sur un simple blur de fenêtre.
      if (reason === 'hidden' && reasonRef.current !== 'hidden') {
        reasonRef.current = 'hidden'
        setState((s) => ({ ...s, reason: 'hidden' }))
      }
      return
    }
    awayStart.current = Date.now()
    reasonRef.current = reason
    startAlarm()
    setState((s) => ({ ...s, away: true, reason }))
  }, [])

  const finalize = useCallback((withBeep: boolean) => {
    if (awayStart.current == null) return
    const start = awayStart.current
    const reason = reasonRef.current || 'hidden'
    const durationMs = Date.now() - start
    awayStart.current = null
    reasonRef.current = null
    stopAlarm()
    eventsRef.current = [...eventsRef.current, { at: start, durationMs, reason }]
    setState({ away: false, reason: null, count: eventsRef.current.length })
    if (withBeep && durationMs > 250) beep(760, 90)
  }, [])

  const ret = useCallback(() => {
    if (awayStart.current != null && isPresent()) finalize(true)
  }, [finalize, isPresent])

  useEffect(() => {
    if (!active) return
    const onVisibility = () => (document.visibilityState === 'hidden' ? leave('hidden') : ret())
    const onBlur = () => leave('blur')
    const onFocus = () => ret()

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('blur', onBlur)
    window.addEventListener('focus', onFocus)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('focus', onFocus)
      // Ne jamais laisser l'alarme tourner après le démontage du composant.
      stopAlarm()
    }
  }, [active, leave, ret])

  // Finalise sans bip, coupe l'alarme, et renvoie la liste complète des sorties.
  const flush = useCallback((): FocusEvent[] => {
    if (awayStart.current != null) {
      const start = awayStart.current
      const reason = reasonRef.current || 'hidden'
      eventsRef.current = [...eventsRef.current, { at: start, durationMs: Date.now() - start, reason }]
      awayStart.current = null
      reasonRef.current = null
    }
    stopAlarm()
    return [...eventsRef.current]
  }, [])

  return { ...state, events: eventsRef.current, flush }
}
