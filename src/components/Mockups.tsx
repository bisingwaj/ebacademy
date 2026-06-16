import type { CSSProperties, ReactNode } from 'react'
import type { MockupId } from '../types'
import { Icon } from './Icon'

// ============================================================================
// Maquettes d'écran (citoyen / urgentiste) pour les questions visuelles.
// Positionné en % d'une zone d'écran à ratio fixe : les zones cliquables
// (hotspots, mêmes coordonnées) tombent pile sur les éléments.
// ============================================================================

function box(x: number, y: number, w: number, h: number, extra: CSSProperties = {}): CSSProperties {
  return { position: 'absolute', left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, ...extra }
}

export function PhoneFrame({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <div
      className={`relative mx-auto w-full max-w-[280px] rounded-[2.2rem] p-2 shadow-card-lg ${
        dark ? 'bg-[#05080f]' : 'bg-navy'
      }`}
      style={{ aspectRatio: '9 / 18.5' }}
    >
      <div className="absolute left-1/2 top-2 z-20 h-4 w-20 -translate-x-1/2 rounded-full bg-black/70" />
      <div
        className={`relative h-full w-full overflow-hidden rounded-[1.7rem] ${
          dark ? 'bg-[#0a1020] text-white' : 'bg-white text-navy'
        }`}
      >
        {children}
      </div>
    </div>
  )
}

function CitizenHome() {
  const bottom = [
    { ic: 'mic', l: 'Audio' },
    { ic: 'video', l: 'Vidéo' },
    { ic: 'location', l: 'Suivi' },
    { ic: 'heart', l: 'Données' },
  ]
  return (
    <div className="absolute inset-0" style={{ fontSize: 'clamp(8px,2.4vw,11px)' }}>
      <div style={box(6, 3, 88, 5)} className="flex items-center justify-between">
        <span className="font-semibold uppercase tracking-[0.12em] text-navy">Étoile Bleue</span>
        <span className="font-mono text-eb-red">199</span>
      </div>
      <div style={box(6, 8.5, 58, 6)} className="flex items-center gap-1.5 rounded-[6px] bg-eb-ok/12 px-2 font-medium text-eb-ok">
        <Icon name="location" size={12} /> Position GPS activée
      </div>

      <div style={box(6, 22, 88, 5)} className="text-center font-medium text-gray-60">
        Appuyez en cas d'urgence
      </div>

      <div style={box(27, 30, 46, 0)}>
        <div className="relative aspect-square w-full">
          <span className="absolute inset-0 animate-pulse-ring rounded-full" />
          <div className="absolute inset-0 grid place-items-center rounded-full bg-eb-red text-white">
            <div className="text-center leading-none">
              <div className="text-[1.9em] font-bold tracking-wide">SOS</div>
              <div className="mt-1 text-[0.8em] opacity-90">Alerte immédiate</div>
            </div>
          </div>
        </div>
      </div>

      <div style={box(8, 67, 84, 6)} className="text-center text-gray-60">
        Envoi automatique de votre position
      </div>

      <div style={box(3, 84, 94, 13)} className="flex items-stretch justify-between gap-1.5">
        {bottom.map((b) => (
          <div key={b.l} className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[8px] bg-gray-10 text-navy">
            <Icon name={b.ic} size={15} />
            <span className="text-[0.8em]">{b.l}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CitizenType() {
  const cards = [
    { x: 6, y: 24, ic: 'activity', l: 'Médicale' },
    { x: 52, y: 24, ic: 'warning', l: 'Traumatique' },
    { x: 6, y: 54, ic: 'heart', l: 'Obstétricale' },
    { x: 52, y: 54, ic: 'user', l: 'Pédiatrique' },
  ]
  return (
    <div className="absolute inset-0" style={{ fontSize: 'clamp(8px,2.4vw,11px)' }}>
      <div style={box(6, 4, 88, 6)} className="flex items-center gap-1.5 font-semibold text-navy">
        <Icon name="arrow-left" size={13} className="text-eb-red" /> Type d'urgence
      </div>
      <div style={box(6, 12, 88, 8)} className="text-gray-60">
        Sélectionnez la nature de l'urgence pour orienter la prise en charge.
      </div>
      {cards.map((c) => (
        <div
          key={c.l}
          style={box(c.x, c.y, 42, 24)}
          className="flex flex-col items-center justify-center gap-1.5 rounded-[10px] border border-eb-line bg-white text-navy"
        >
          <Icon name={c.ic} size={20} className="text-navy" />
          <span className="text-[1em] font-medium">{c.l}</span>
        </div>
      ))}
    </div>
  )
}

function UrgMission() {
  const steps = ['En route', 'Arrivé', 'Pris en charge', 'Transport']
  const actions = [
    { x: 5, ic: 'navigation', l: 'Navigation' },
    { x: 28, ic: 'clipboard', l: 'Bilan' },
    { x: 51, ic: 'phone', l: 'Victime' },
    { x: 74, ic: 'hospital', l: 'Préadm.' },
  ]
  return (
    <div className="absolute inset-0 text-white" style={{ fontSize: 'clamp(8px,2.4vw,11px)' }}>
      <div style={box(3, 3, 94, 10)} className="flex items-center justify-between rounded-[8px] bg-eb-red px-3">
        <div className="leading-tight">
          <div className="text-[0.78em] uppercase tracking-wider opacity-90">Mission active</div>
          <div className="text-[1.05em] font-semibold">Malaise · voie publique</div>
        </div>
        <div className="font-mono text-[1.2em]">04:12</div>
      </div>

      <div style={box(3, 15, 94, 44)} className="overflow-hidden rounded-[8px]">
        <div className="relative h-full w-full bg-[#10182b]">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'linear-gradient(#1c2740 1px, transparent 1px), linear-gradient(90deg, #1c2740 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 60" preserveAspectRatio="none">
            <path d="M14 46 C 34 40, 40 22, 64 18 S 86 14, 88 12" stroke="#e63946" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          </svg>
          <div className="absolute left-[12%] top-[72%] grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-navy">
            <Icon name="navigation" size={11} />
          </div>
          <div className="absolute left-[86%] top-[18%] grid h-5 w-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-eb-red text-white">
            <Icon name="location" size={11} />
          </div>
        </div>
      </div>

      <div style={box(3, 61, 94, 16)} className="flex items-center gap-1">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`flex flex-1 flex-col items-center gap-1 rounded-[6px] px-1 py-1.5 text-center ${
              i <= 1 ? 'bg-eb-ok/20 text-eb-ok' : 'bg-white/5 text-white/55'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${i <= 1 ? 'bg-eb-ok' : 'bg-white/30'}`} />
            <span className="text-[0.82em] leading-tight">{s}</span>
          </div>
        ))}
      </div>

      {actions.map((a) => (
        <div key={a.l} style={box(a.x, 82, 22, 14)} className="flex flex-col items-center justify-center gap-1 rounded-[8px] bg-white/8 text-white">
          <Icon name={a.ic} size={16} />
          <span className="text-[0.8em]">{a.l}</span>
        </div>
      ))}
    </div>
  )
}

function UrgBilan() {
  const Row = ({ y, label, children }: { y: number; label: string; children: ReactNode }) => (
    <div style={box(5, y, 90, 11)} className="flex items-center justify-between rounded-[8px] bg-white/6 px-3">
      <span className="text-[1em] text-white/80">{label}</span>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  )
  const Pill = ({ on, children, danger }: { on?: boolean; children: ReactNode; danger?: boolean }) => (
    <span
      className={`rounded-full px-2 py-0.5 text-[0.85em] font-medium ${
        on ? (danger ? 'bg-eb-red text-white' : 'bg-eb-ok text-white') : 'bg-white/10 text-white/45'
      }`}
    >
      {children}
    </span>
  )
  return (
    <div className="absolute inset-0 text-white" style={{ fontSize: 'clamp(8px,2.4vw,11px)' }}>
      <div style={box(5, 4, 90, 7)} className="flex items-center gap-1.5 font-semibold">
        <Icon name="clipboard" size={14} className="text-eb-red" /> Bilan préhospitalier
      </div>
      <Row y={13} label="État de conscience">
        <Pill on>Oui</Pill>
        <Pill>Non</Pill>
      </Row>
      <Row y={26} label="Respiration">
        <Pill on>Oui</Pill>
        <Pill>Non</Pill>
      </Row>
      <Row y={39} label="Score GCS">
        <span className="font-mono text-[1.3em] text-white">15</span>
        <span className="text-white/40">/15</span>
      </Row>
      <Row y={52} label="Hémorragie">
        <Pill>Aucune</Pill>
        <Pill on danger>
          Sévère
        </Pill>
      </Row>
      <Row y={65} label="Gravité">
        <Pill on danger>
          Vitale
        </Pill>
      </Row>
      <div style={box(5, 80, 90, 12)} className="flex items-center justify-center gap-1.5 rounded-[8px] bg-eb-red font-semibold text-white">
        Valider le bilan <Icon name="arrow-right" size={14} />
      </div>
    </div>
  )
}

function UrgHome() {
  const tabs = [
    { ic: 'navigation', l: 'Accueil' },
    { ic: 'map', l: 'Carte' },
    { ic: 'list', l: 'Historique' },
    { ic: 'user', l: 'Profil' },
  ]
  return (
    <div className="absolute inset-0 text-white" style={{ fontSize: 'clamp(8px,2.4vw,11px)' }}>
      <div style={box(6, 4, 88, 6)} className="flex items-center justify-between">
        <span className="font-semibold uppercase tracking-[0.12em]">Secouriste</span>
        <span className="font-mono text-eb-red">199</span>
      </div>

      {/* Carte de disponibilité avec interrupteur */}
      <div style={box(5, 14, 90, 18)} className="flex items-center justify-between rounded-[10px] bg-white/8 px-3">
        <div className="leading-tight">
          <div className="text-[0.8em] uppercase tracking-wider text-white/55">Disponibilité</div>
          <div className="text-[1.1em] font-semibold text-eb-ok">En service</div>
        </div>
        <div className="relative h-5 w-10 rounded-full bg-eb-ok">
          <span className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white" />
        </div>
      </div>

      <div style={box(5, 36, 90, 16)} className="grid place-items-center rounded-[10px] border border-white/10 text-center text-white/55">
        Aucune mission active
      </div>

      {/* onglets */}
      {tabs.map((t, i) => (
        <div key={t.l} style={box(2 + i * 24.5, 88, 23, 10)} className="flex flex-col items-center justify-center gap-0.5 text-white/70">
          <Icon name={t.ic} size={14} />
          <span className="text-[0.78em]">{t.l}</span>
        </div>
      ))}
    </div>
  )
}

function HopitalPreadmission() {
  return (
    <div className="absolute inset-0 text-white" style={{ fontSize: 'clamp(8px,2.4vw,11px)' }}>
      <div style={box(5, 4, 90, 6)} className="flex items-center gap-1.5 font-semibold">
        <Icon name="hospital" size={14} className="text-eb-red" /> Préadmissions
      </div>

      <div style={box(5, 12, 90, 40)} className="rounded-[10px] bg-white/8 p-2">
        <div className="rounded-[6px] bg-eb-red/85 px-2 py-1 text-[0.85em] font-semibold">Préadmission entrante</div>
        <div className="mt-2 space-y-1 px-1 text-[0.95em] text-white/85">
          <div className="flex justify-between">
            <span className="text-white/55">Gravité</span>
            <span className="font-medium text-eb-red">Vitale</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/55">Type</span>
            <span>Traumatique</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/55">Arrivée estimée</span>
            <span className="font-mono">6 min</span>
          </div>
        </div>
      </div>
      {/* boutons décision (coordonnées écran pour aligner les zones cliquables) */}
      <div style={box(8, 41, 40, 8)} className="grid place-items-center rounded-[6px] border border-white/25 text-white/80">
        Refuser
      </div>
      <div style={box(52, 41, 42, 8)} className="grid place-items-center rounded-[6px] bg-eb-ok font-semibold text-white">
        Accepter
      </div>

      <div style={box(5, 66, 90, 12)} className="flex items-center justify-between rounded-[10px] bg-white/6 px-3">
        <span className="text-white/55">Lits disponibles</span>
        <span className="font-mono">Urgences 4 · Réa 1</span>
      </div>
    </div>
  )
}

function Regulation199() {
  const calls = [
    { l: 'Douleur thoracique · H. 58 ans', tag: 'NOUVEAU', hot: true, y: 17 },
    { l: 'Chute à domicile · F. 74 ans', tag: 'EN COURS', hot: false, y: 27 },
    { l: 'Malaise · voie publique', tag: 'EN COURS', hot: false, y: 37 },
  ]
  const grav = ['Vitale', 'Urgente', 'Relative']
  return (
    <div className="absolute inset-0 text-white" style={{ fontSize: 'clamp(8px,2.4vw,11px)' }}>
      <div style={box(6, 4, 88, 6)} className="flex items-center justify-between font-semibold">
        <span className="uppercase tracking-[0.12em]">Régulation</span>
        <span className="font-mono text-eb-red">199</span>
      </div>
      <div style={box(5, 12, 90, 3)} className="text-[0.78em] uppercase tracking-wider text-white/55">
        File d'appels
      </div>
      {calls.map((c) => (
        <div
          key={c.l}
          style={box(5, c.y, 90, 8.5)}
          className={`flex items-center justify-between rounded-[8px] px-2 ${c.hot ? 'bg-eb-red/85' : 'bg-white/8'}`}
        >
          <span className="text-[0.92em]">{c.l}</span>
          <span className="text-[0.7em] uppercase tracking-wide text-white/80">{c.tag}</span>
        </div>
      ))}
      <div style={box(5, 49, 90, 3)} className="text-[0.78em] uppercase tracking-wider text-white/55">
        Niveau de gravité
      </div>
      <div style={box(5, 53, 90, 10)} className="flex items-center gap-1.5">
        {grav.map((g, i) => (
          <div
            key={g}
            className={`flex flex-1 items-center justify-center rounded-[6px] py-1.5 text-[0.9em] font-medium ${
              i === 0 ? 'bg-eb-red text-white' : 'bg-white/8 text-white/55'
            }`}
          >
            {g}
          </div>
        ))}
      </div>
      <div style={box(5, 66, 90, 11)} className="flex items-center justify-between rounded-[8px] bg-white/6 px-3">
        <span className="text-white/55">Secouriste le + proche</span>
        <span className="font-mono">2,1 km · 4 min</span>
      </div>
      <div style={box(5, 82, 90, 12)} className="flex items-center justify-center gap-1.5 rounded-[8px] bg-eb-ok font-semibold text-white">
        Dispatcher <Icon name="navigation" size={14} />
      </div>
    </div>
  )
}

function HopitalCapacite() {
  const rows = [
    { l: 'Réanimation', v: '1 lit', danger: false, y: 15 },
    { l: 'Urgences', v: 'Saturé', danger: true, y: 28 },
    { l: 'Bloc opératoire', v: 'Disponible', danger: false, y: 41 },
    { l: 'Obstétrique', v: '2 lits', danger: false, y: 54 },
  ]
  return (
    <div className="absolute inset-0 text-white" style={{ fontSize: 'clamp(8px,2.4vw,11px)' }}>
      <div style={box(5, 4, 90, 7)} className="flex items-center gap-1.5 font-semibold">
        <Icon name="hospital" size={14} className="text-eb-red" /> Capacité du service
      </div>
      {rows.map((r) => (
        <div
          key={r.l}
          style={box(5, r.y, 90, 11)}
          className="flex items-center justify-between rounded-[8px] bg-white/6 px-3"
        >
          <span className="text-[1em] text-white/85">{r.l}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[0.85em] font-medium ${
              r.danger ? 'bg-eb-red text-white' : 'bg-eb-ok text-white'
            }`}
          >
            {r.v}
          </span>
        </div>
      ))}
      <div style={box(5, 80, 90, 12)} className="flex items-center justify-between rounded-[10px] bg-white/8 px-3">
        <span className="text-white/55">Statut accueil</span>
        <span className="font-medium text-eb-ok">Préadmissions ouvertes</span>
      </div>
    </div>
  )
}

function CitizenData() {
  const rows = [
    { l: 'Antécédents', v: 'Diabète · HTA', y: 24 },
    { l: 'Allergies', v: 'Pénicilline', y: 39 },
    { l: 'Traitements', v: 'Metformine', y: 54 },
    { l: 'Personne à prévenir', v: '+243 …', y: 69 },
  ]
  return (
    <div className="absolute inset-0" style={{ fontSize: 'clamp(8px,2.4vw,11px)' }}>
      <div style={box(6, 4, 88, 6)} className="flex items-center gap-1.5 font-semibold text-navy">
        <Icon name="arrow-left" size={13} className="text-eb-red" /> Données médicales
      </div>
      <div style={box(6, 12, 88, 8)} className="text-gray-60">
        Renseignées à l'avance, transmises automatiquement avec l'alerte.
      </div>
      {rows.map((r) => (
        <div
          key={r.l}
          style={box(6, r.y, 88, 11)}
          className="flex items-center justify-between rounded-[10px] border border-eb-line bg-white px-3 text-navy"
        >
          <span className="text-[0.95em] text-gray-60">{r.l}</span>
          <span className="text-[1em] font-medium">{r.v}</span>
        </div>
      ))}
      <div style={box(6, 85, 88, 10)} className="flex items-center justify-center gap-1.5 rounded-[10px] bg-navy font-semibold text-white">
        Enregistrer <Icon name="check" size={14} />
      </div>
    </div>
  )
}

function UrgIncident() {
  const opts = [
    { ic: 'navigation', l: 'Panne véhicule', x: 5, y: 26 },
    { ic: 'warning', l: 'Panne matériel', x: 51, y: 26 },
    { ic: 'map', l: 'Voie bloquée', x: 5, y: 50 },
    { ic: 'user', l: 'Renfort requis', x: 51, y: 50 },
  ]
  return (
    <div className="absolute inset-0 text-white" style={{ fontSize: 'clamp(8px,2.4vw,11px)' }}>
      <div style={box(5, 4, 90, 7)} className="flex items-center gap-1.5 font-semibold">
        <Icon name="warning" size={14} className="text-eb-red" /> Signaler un incident
      </div>
      <div style={box(5, 13, 90, 9)} className="text-white/60">
        Sélectionnez la nature de l'incident logistique sans interrompre la mission.
      </div>
      {opts.map((o) => (
        <div
          key={o.l}
          style={box(o.x, o.y, 44, 19)}
          className="flex flex-col items-center justify-center gap-1.5 rounded-[10px] border border-white/10 bg-white/8"
        >
          <Icon name={o.ic} size={18} className="text-white" />
          <span className="text-[0.95em] font-medium">{o.l}</span>
        </div>
      ))}
      <div style={box(5, 80, 90, 12)} className="flex items-center justify-center gap-1.5 rounded-[8px] bg-eb-red font-semibold text-white">
        Transmettre au 199 <Icon name="arrow-right" size={14} />
      </div>
    </div>
  )
}

export function MockupScreen({ id }: { id: MockupId }) {
  switch (id) {
    case 'citizen-home':
      return <CitizenHome />
    case 'citizen-type':
      return <CitizenType />
    case 'urgentiste-mission':
      return <UrgMission />
    case 'urgentiste-bilan':
      return <UrgBilan />
    case 'urgentiste-home':
      return <UrgHome />
    case 'hopital-preadmission':
      return <HopitalPreadmission />
    case 'regulation-199':
      return <Regulation199 />
    case 'hopital-capacite':
      return <HopitalCapacite />
    case 'citizen-data':
      return <CitizenData />
    case 'urgentiste-incident':
      return <UrgIncident />
    default:
      return null
  }
}

export function isDarkMockup(id: MockupId): boolean {
  return id !== 'citizen-home' && id !== 'citizen-type' && id !== 'citizen-data'
}

export function MockupView({ id }: { id: MockupId }) {
  return (
    <PhoneFrame dark={isDarkMockup(id)}>
      <MockupScreen id={id} />
    </PhoneFrame>
  )
}
