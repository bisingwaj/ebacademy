// Éléments d'identité visuelle Étoile Bleue

export function StarLogo({ size = 28, color = '#3461c9' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M32 6l6.6 16.6L56 24.1l-13.1 11.1L46.9 58 32 49 17.1 58l4-22.8L8 24.1l17.4-1.5z"
        fill={color}
      />
    </svg>
  )
}

export function Wordmark({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const main = tone === 'light' ? 'text-white' : 'text-navy'
  const sub = tone === 'light' ? 'text-white/55' : 'text-eb-muted'
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-navy">
        <StarLogo size={20} />
      </span>
      <div className="leading-tight">
        <div className={`text-[13px] font-semibold uppercase tracking-[0.2em] ${main}`}>Étoile Bleue</div>
        <div className={`text-[11px] ${sub}`}>Service national d'urgence médicale · 199</div>
      </div>
    </div>
  )
}

/** Bandeau supérieur fin, comme sur la présentation officielle. */
export function TopBand({ tone = 'dark' }: { tone?: 'light' | 'dark' }) {
  const isDark = tone === 'dark'
  return (
    <div className={isDark ? 'bg-navy' : 'bg-white'}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Wordmark tone={isDark ? 'light' : 'dark'} />
        <div className={`hidden items-center gap-2 sm:flex ${isDark ? 'text-white/70' : 'text-eb-muted'}`}>
          <span className="text-[11px] uppercase tracking-[0.18em]">Examen officiel des formateurs</span>
        </div>
      </div>
      <div className="h-[3px] w-full bg-eb-red" />
    </div>
  )
}

export function FooterBand() {
  return (
    <div className="mt-auto border-t border-eb-line bg-eb-cream/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-1 px-5 py-4 text-[11px] text-eb-muted sm:flex-row">
        <span>Coordination Nationale Spécialisée — Étoile Bleue</span>
        <span>République Démocratique du Congo · Ministère de la Santé Publique</span>
      </div>
    </div>
  )
}
