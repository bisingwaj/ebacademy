// ============================================================================
// Alarme du Mode Focus — sirène générée via la Web Audio API (aucun fichier).
// Émet un son bi-tonal modulé tant que le candidat est hors de l'examen.
// ============================================================================

let ctx: AudioContext | null = null
let osc1: OscillatorNode | null = null
let osc2: OscillatorNode | null = null
let gain: GainNode | null = null
let lfo: OscillatorNode | null = null
let lfoGain: GainNode | null = null
let running = false

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

// À appeler une fois sur un geste utilisateur (déverrouille l'audio mobile/Safari)
export function primeAudio(): void {
  const c = getCtx()
  if (c && c.state === 'suspended') void c.resume()
}

export function startAlarm(): void {
  if (running) return
  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') void c.resume()

  running = true

  gain = c.createGain()
  gain.gain.setValueAtTime(0.0001, c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.16, c.currentTime + 0.08)
  gain.connect(c.destination)

  osc1 = c.createOscillator()
  osc1.type = 'sawtooth'
  osc1.frequency.value = 660

  osc2 = c.createOscillator()
  osc2.type = 'square'
  osc2.frequency.value = 988

  // LFO : balaie la hauteur pour l'effet « sirène »
  lfo = c.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.value = 4 // Hz
  lfoGain = c.createGain()
  lfoGain.gain.value = 180
  lfo.connect(lfoGain)
  lfoGain.connect(osc1.frequency)
  lfoGain.connect(osc2.frequency)

  osc1.connect(gain)
  osc2.connect(gain)

  const t = c.currentTime
  osc1.start(t)
  osc2.start(t)
  lfo.start(t)
}

export function stopAlarm(): void {
  if (!running) return
  running = false
  const c = ctx
  if (!c) return
  const t = c.currentTime
  try {
    if (gain) {
      gain.gain.cancelScheduledValues(t)
      gain.gain.setValueAtTime(gain.gain.value, t)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
    }
    const stopAt = t + 0.16
    osc1?.stop(stopAt)
    osc2?.stop(stopAt)
    lfo?.stop(stopAt)
  } catch {
    /* noop */
  }
  osc1 = osc2 = lfo = null
  lfoGain = gain = null
}

export function isAlarmRunning(): boolean {
  return running
}

// Petit bip de confirmation (ex. retour sur la page)
export function beep(freq = 880, durMs = 120): void {
  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') void c.resume()
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, c.currentTime)
  g.gain.exponentialRampToValueAtTime(0.08, c.currentTime + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + durMs / 1000)
  const o = c.createOscillator()
  o.type = 'sine'
  o.frequency.value = freq
  o.connect(g)
  g.connect(c.destination)
  o.start()
  o.stop(c.currentTime + durMs / 1000 + 0.02)
}
