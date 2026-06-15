import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { AnswerValue, Question } from '../types'
import { countWords } from '../lib/scoring'
import { isDarkMockup, MockupScreen, PhoneFrame } from './Mockups'
import { Icon } from './Icon'

interface Props {
  question: Question
  answer: AnswerValue
  onChange: (v: AnswerValue) => void
  seed: string // graine de mélange propre à la tentative (positions imprévisibles)
}

const LETTERS = 'ABCDEFGH'.split('')

// Étiquette de type affichée en surtitre (clarté : on sait comment répondre).
const CONSIGNE_LABEL: Record<string, string> = {
  mcq: 'Choix unique',
  multi: 'Choix multiples',
  truefalse: 'Vrai ou faux',
  short: 'Réponse écrite',
  long: 'Rédaction',
  order: 'Mise en ordre',
  match: 'Association',
  hotspot: 'Question visuelle',
}

// Consigne d'interaction par défaut (clarté) si la question n'en précise pas.
const CONSIGNE: Record<string, string> = {
  mcq: 'Une seule réponse.',
  multi: 'Plusieurs réponses possibles.',
  truefalse: 'Indiquez si l’affirmation est vraie ou fausse.',
  short: 'Réponse écrite courte.',
  long: 'Réponse rédigée — évaluée par le correcteur.',
  order: 'Glissez ou utilisez les flèches pour ordonner.',
  match: 'Reliez chaque élément à sa correspondance.',
  hotspot: 'Touchez la bonne zone sur l’écran.',
}

// Mélange déterministe et bien distribué (seedé) — stable entre rendus.
// PRNG : xmur3 (hash de graine) → mulberry32, puis Fisher-Yates avec les bits
// de poids fort (évite le biais de position des générateurs naïfs).
function seededShuffle<T>(arr: T[], seed: string): T[] {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  let s = (h ^= h >>> 16) >>> 0
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Dérange l'ordre : aucun élément ne doit être à sa position correcte, afin
// qu'une question d'ordre laissée intacte ne rapporte aucun point.
function derange(ids: string[], correct: string[], seed: string): string[] {
  const a = seededShuffle(ids, seed)
  for (let i = 0; i < a.length; i++) {
    if (a[i] === correct[i]) {
      const j = (i + 1) % a.length
      ;[a[i], a[j]] = [a[j], a[i]]
    }
  }
  // Deuxième passe au cas où le swap aurait recréé un point fixe
  for (let i = 0; i < a.length; i++) {
    if (a[i] === correct[i]) {
      const j = i === 0 ? a.length - 1 : i - 1
      ;[a[i], a[j]] = [a[j], a[i]]
    }
  }
  // Garantie : si un point fixe subsiste (cas pathologique de très petite taille),
  // on renvoie un décalage cyclique du corrigé — dérangement sans point fixe.
  if (a.length > 1 && a.some((v, i) => v === correct[i])) {
    return correct.map((_, i) => correct[(i + 1) % correct.length])
  }
  return a
}

export default function QuestionView({ question: q, answer, onChange, seed }: Props) {
  return (
    <div className="grid items-start gap-6 md:grid-cols-[1fr_auto] md:gap-8">
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-eb-muted">
            {CONSIGNE_LABEL[q.type] || 'Question'}
          </span>
        </div>
        <h2 className="text-pretty text-[19px] font-semibold leading-snug text-navy md:text-[21px]">{q.prompt}</h2>
        <p className="mt-2 text-[14px] text-eb-muted">{q.help || CONSIGNE[q.type]}</p>
        <div className="mt-5">
          <Renderer q={q} answer={answer} onChange={onChange} seed={seed} />
        </div>
      </div>

      {q.mockup && (
        <div className="mx-auto w-full max-w-[280px] md:w-[260px]">
          {q.type === 'hotspot' ? (
            <Hotspot q={q} answer={answer} onChange={onChange} />
          ) : (
            <PhoneFrame dark={isDarkMockup(q.mockup)}>
              <MockupScreen id={q.mockup} />
            </PhoneFrame>
          )}
          <p className="mt-2 text-center text-[11px] uppercase tracking-[0.16em] text-eb-muted">
            Aperçu de l'application
          </p>
        </div>
      )}
    </div>
  )
}

function Renderer({
  q,
  answer,
  onChange,
  seed,
}: {
  q: Question
  answer: AnswerValue
  onChange: (v: AnswerValue) => void
  seed: string
}) {
  switch (q.type) {
    case 'mcq':
      return <Mcq q={q} answer={answer as string} onChange={onChange} seed={seed} />
    case 'truefalse':
      return <TrueFalse answer={answer as boolean | undefined} onChange={onChange} />
    case 'multi':
      return <Multi q={q} answer={(answer as string[]) || []} onChange={onChange} seed={seed} />
    case 'short':
      return <ShortText answer={(answer as string) || ''} onChange={onChange} />
    case 'long':
      return <LongText q={q} answer={(answer as string) || ''} onChange={onChange} />
    case 'order':
      return <Ordering q={q} answer={answer as string[] | undefined} onChange={onChange} seed={seed} />
    case 'match':
      return <Matching q={q} answer={(answer as Record<string, string>) || {}} onChange={onChange} seed={seed} />
    case 'hotspot':
      return <p className="text-[13px] text-eb-muted">Touchez la bonne zone sur l'écran ci-contre.</p>
    default:
      return null
  }
}

function OptionRow({
  selected,
  onClick,
  letter,
  children,
  type = 'radio',
}: {
  selected: boolean
  onClick: () => void
  letter?: string
  children: React.ReactNode
  type?: 'radio' | 'check'
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.995 }}
      className={`group flex w-full items-center gap-3 border px-4 py-3.5 text-left transition-colors ${
        selected ? 'border-eb-blue bg-eb-blue/[0.06]' : 'border-eb-line bg-white hover:bg-gray-10'
      }`}
    >
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center border text-[13px] font-semibold transition-colors ${
          type === 'check' ? '' : 'rounded-full'
        } ${selected ? 'border-eb-blue bg-eb-blue text-white' : 'border-eb-line-strong text-eb-muted'}`}
      >
        {type === 'check' && selected ? <Icon name="check" size={16} /> : letter}
      </span>
      <span className="text-[15px] leading-snug text-eb-ink">{children}</span>
    </motion.button>
  )
}

function Mcq({ q, answer, onChange, seed }: { q: Question; answer: string; onChange: (v: AnswerValue) => void; seed: string }) {
  const options = useMemo(() => seededShuffle(q.options || [], q.id + seed), [q.options, q.id, seed])
  return (
    <div className="grid gap-2.5">
      {options.map((o, i) => (
        <OptionRow key={o.id} letter={LETTERS[i]} selected={answer === o.id} onClick={() => onChange(o.id)}>
          {o.label}
        </OptionRow>
      ))}
    </div>
  )
}

function Multi({ q, answer, onChange, seed }: { q: Question; answer: string[]; onChange: (v: AnswerValue) => void; seed: string }) {
  const options = useMemo(() => seededShuffle(q.options || [], q.id + seed), [q.options, q.id, seed])
  const toggle = (id: string) => {
    const set = new Set(answer)
    set.has(id) ? set.delete(id) : set.add(id)
    onChange([...set])
  }
  return (
    <div className="grid gap-2.5">
      {options.map((o, i) => (
        <OptionRow key={o.id} type="check" letter={LETTERS[i]} selected={answer.includes(o.id)} onClick={() => toggle(o.id)}>
          {o.label}
        </OptionRow>
      ))}
    </div>
  )
}

function TrueFalse({ answer, onChange }: { answer: boolean | undefined; onChange: (v: AnswerValue) => void }) {
  const Btn = ({ val, label, tone }: { val: boolean; label: string; tone: string }) => (
    <motion.button
      type="button"
      whileTap={{ scale: 0.99 }}
      onClick={() => onChange(val)}
      className={`flex flex-1 items-center justify-center gap-2.5 border-2 px-4 py-5 text-[16px] font-semibold transition-colors ${
        answer === val ? `${tone} text-white` : 'border-eb-line-strong bg-white text-navy hover:bg-gray-10'
      }`}
    >
      <Icon name={val ? 'check' : 'close'} size={20} /> {label}
    </motion.button>
  )
  return (
    <div className="flex gap-3">
      <Btn val={true} label="Vrai" tone="border-eb-ok bg-eb-ok" />
      <Btn val={false} label="Faux" tone="border-eb-red bg-eb-red" />
    </div>
  )
}

function ShortText({ answer, onChange }: { answer: string; onChange: (v: AnswerValue) => void }) {
  return (
    <input
      className="eb-field"
      placeholder="Saisissez votre réponse…"
      value={answer}
      onChange={(e) => onChange(e.target.value)}
      autoComplete="off"
    />
  )
}

function LongText({ q, answer, onChange }: { q: Question; answer: string; onChange: (v: AnswerValue) => void }) {
  const words = countWords(answer)
  const min = q.minWords || 0
  return (
    <div>
      <textarea
        className="eb-field min-h-[140px] resize-y eb-scroll"
        placeholder="Rédigez votre réponse…"
        value={answer}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="mt-1.5 flex items-center justify-between text-[12px]">
        <span className="text-eb-muted">Réponse rédigée — évaluée par le correcteur.</span>
        <span className={words >= min ? 'text-eb-ok' : 'text-eb-muted'}>
          {words} mot{words > 1 ? 's' : ''}
          {min ? ` · minimum ${min}` : ''}
        </span>
      </div>
    </div>
  )
}

function Ordering({
  q,
  answer,
  onChange,
  seed,
}: {
  q: Question
  answer: string[] | undefined
  onChange: (v: AnswerValue) => void
  seed: string
}) {
  const items = q.items || []
  const byId = useMemo(() => new Map(items.map((it) => [it.id, it.label])), [items])

  const initial = useMemo(
    () => derange(items.map((i) => i.id), q.correctOrder || [], q.id + seed),
    [items, q.id, q.correctOrder, seed],
  )

  // Enregistre l'ordre initial une seule fois (la question compte comme traitée).
  useEffect(() => {
    if (!answer) onChange(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const order = answer && answer.length ? answer : initial

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= order.length) return
    const next = [...order]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <ol className="grid gap-2.5">
      {order.map((id, i) => (
        <motion.li
          layout
          key={id}
          transition={{ type: 'spring', stiffness: 500, damping: 38 }}
          className="flex items-center gap-3 border border-eb-line bg-white px-3 py-3"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy text-[13px] font-semibold text-white">
            {i + 1}
          </span>
          <span className="flex-1 text-[15px] text-eb-ink">{byId.get(id)}</span>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className="grid h-6 w-7 place-items-center border border-eb-line-strong text-eb-muted transition-colors hover:bg-gray-10 disabled:opacity-30"
              aria-label="Monter"
            >
              <Icon name="caret-up" size={14} />
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === order.length - 1}
              className="grid h-6 w-7 place-items-center border border-eb-line-strong text-eb-muted transition-colors hover:bg-gray-10 disabled:opacity-30"
              aria-label="Descendre"
            >
              <Icon name="caret-down" size={14} />
            </button>
          </div>
        </motion.li>
      ))}
    </ol>
  )
}

function Matching({
  q,
  answer,
  onChange,
  seed,
}: {
  q: Question
  answer: Record<string, string>
  onChange: (v: AnswerValue) => void
  seed: string
}) {
  const set = (leftId: string, rightId: string) => onChange({ ...answer, [leftId]: rightId })
  const rights = useMemo(() => seededShuffle(q.rights || [], q.id + seed + 'r'), [q.rights, q.id, seed])
  return (
    <div className="grid gap-3">
      {(q.lefts || []).map((l) => (
        <div key={l.id} className="grid items-center gap-2 border border-eb-line bg-white p-3 sm:grid-cols-[1fr_auto]">
          <span className="text-[15px] font-medium text-navy">{l.label}</span>
          <div className="relative">
            <select
              value={answer[l.id] || ''}
              onChange={(e) => set(l.id, e.target.value)}
              className={`h-11 w-full appearance-none border-0 border-b border-eb-line-strong bg-gray-10 px-3 pr-9 text-[14px] outline-none transition-colors hover:bg-[#e8e8e8] focus:bg-white focus:shadow-focusring sm:w-72 ${
                answer[l.id] ? 'text-eb-ink' : 'text-eb-muted'
              }`}
            >
              <option value="">— Choisir —</option>
              {rights.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-eb-muted">
              <Icon name="chevron-down" size={16} />
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

function Hotspot({ q, answer, onChange }: { q: Question; answer: AnswerValue; onChange: (v: AnswerValue) => void }) {
  if (!q.mockup) return null
  return (
    <PhoneFrame dark={isDarkMockup(q.mockup)}>
      <MockupScreen id={q.mockup} />
      <div className="absolute inset-0">
        {(q.spots || []).map((sp) => {
          const selected = answer === sp.id
          return (
            <button
              key={sp.id}
              type="button"
              onClick={() => onChange(sp.id)}
              title={sp.label}
              aria-label={sp.label}
              className="absolute"
              style={{ left: `${sp.x}%`, top: `${sp.y}%`, width: `${sp.w}%`, height: `${sp.h}%` }}
            >
              <span
                className={`block h-full w-full rounded-xl transition ${
                  selected ? 'ring-[3px] ring-eb-blue ring-offset-1' : 'ring-1 ring-white/0 hover:ring-eb-blue/50'
                }`}
              />
              {selected && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-eb-blue text-white shadow"
                >
                  <Icon name="check" size={12} strokeWidth={2.5} />
                </motion.span>
              )}
            </button>
          )
        })}
      </div>
    </PhoneFrame>
  )
}
