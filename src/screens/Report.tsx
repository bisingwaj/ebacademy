import { useMemo } from 'react'
import type { AnswerValue, ExamDefinition, ExamResult, Question } from '../types'
import { StarLogo } from '../components/Brand'
import { Icon } from '../components/Icon'
import { formatDuration } from '../hooks/useCountdown'

function fmtDate(ms: number) {
  try {
    return new Date(ms).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
  } catch {
    return new Date(ms).toISOString()
  }
}

// ---- Rendu lisible des réponses ------------------------------------------
function answerToText(q: Question, v: AnswerValue): string {
  if (v === undefined || v === '' || (Array.isArray(v) && v.length === 0)) return '—'
  switch (q.type) {
    case 'mcq':
      return q.options?.find((o) => o.id === v)?.label || String(v)
    case 'truefalse':
      return v === true ? 'Vrai' : v === false ? 'Faux' : '—'
    case 'multi':
      return (v as string[]).map((id) => q.options?.find((o) => o.id === id)?.label || id).join(' · ')
    case 'short':
    case 'long':
      return String(v)
    case 'order':
      return (v as string[]).map((id, i) => `${i + 1}. ${q.items?.find((it) => it.id === id)?.label || id}`).join('  →  ')
    case 'match':
      return Object.entries(v as Record<string, string>)
        .map(
          ([l, r]) =>
            `${q.lefts?.find((x) => x.id === l)?.label || '—'} → ${q.rights?.find((x) => x.id === r)?.label || '—'}`,
        )
        .join('   |   ')
    case 'hotspot':
      return q.spots?.find((s) => s.id === v)?.label || String(v)
    default:
      return String(v)
  }
}

function correctToText(q: Question): string {
  switch (q.type) {
    case 'mcq':
      return q.options?.find((o) => o.id === q.correctOption)?.label || '—'
    case 'truefalse':
      return q.correctBool ? 'Vrai' : 'Faux'
    case 'multi':
      return (q.correctOptions || []).map((id) => q.options?.find((o) => o.id === id)?.label || id).join(' · ')
    case 'order':
      return (q.correctOrder || []).map((id, i) => `${i + 1}. ${q.items?.find((it) => it.id === id)?.label || id}`).join('  →  ')
    case 'match':
      return Object.entries(q.correctMatch || {})
        .map(
          ([l, r]) =>
            `${q.lefts?.find((x) => x.id === l)?.label || '—'} → ${q.rights?.find((x) => x.id === r)?.label || '—'}`,
        )
        .join('   |   ')
    case 'hotspot':
      return q.spots?.find((s) => s.id === q.correctSpot)?.label || '—'
    case 'short':
    case 'long':
      return q.sample || '—'
    default:
      return '—'
  }
}

type Status = 'correct' | 'partial' | 'incorrect' | 'review' | 'empty'
function statusOf(r: ExamResult['perQuestion'][number]): Status {
  if (!r.answered) return 'empty'
  if (r.needsReview) return 'review'
  if (r.correct) return 'correct'
  if (r.partial) return 'partial'
  return 'incorrect'
}
const STATUS_META: Record<Status, { label: string; cls: string; dot: string }> = {
  correct: { label: 'Correct', cls: 'bg-eb-ok/12 text-eb-ok', dot: 'bg-eb-ok' },
  partial: { label: 'Partiel', cls: 'bg-eb-warn/15 text-eb-warn', dot: 'bg-eb-warn' },
  incorrect: { label: 'Incorrect', cls: 'bg-eb-red/12 text-eb-red-strong', dot: 'bg-eb-red' },
  review: { label: 'À corriger', cls: 'bg-navy/10 text-navy', dot: 'bg-navy' },
  empty: { label: 'Non répondu', cls: 'bg-eb-muted/15 text-eb-muted', dot: 'bg-eb-muted' },
}

export default function Report({
  exam,
  result,
  onRestart,
}: {
  exam: ExamDefinition
  result: ExamResult
  onRestart: () => void
}) {
  const verdict = result.passed
    ? { label: 'ADMIS', tone: 'text-eb-ok', bg: 'bg-eb-ok' }
    : result.pct >= exam.meta.passMark - 10
      ? { label: 'À REVOIR', tone: 'text-eb-warn', bg: 'bg-eb-warn' }
      : { label: 'AJOURNÉ', tone: 'text-eb-red', bg: 'bg-eb-red' }

  const totalAway = result.focusEvents.reduce((a, e) => a + e.durationMs, 0)
  const sectionsById = useMemo(() => new Map(exam.sections.map((s) => [s.id, s])), [exam])

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const safe = result.candidate.fullName.replace(/[^\p{L}\p{N}]+/gu, '_')
    a.href = url
    a.download = `Rapport_EtoileBleue_${safe}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-eb-cream pb-20">
      {/* barre d'actions (non imprimée) */}
      <div className="no-print sticky top-0 z-20 border-b border-eb-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2 text-[13px] font-medium text-navy">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-navy">
              <StarLogo size={16} />
            </span>
            Rapport d'examen
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadJson}
              className="inline-flex h-9 items-center gap-1.5 border border-eb-line-strong bg-white px-3 text-[13px] font-medium text-navy transition-colors hover:bg-gray-10"
            >
              <Icon name="download" size={16} /> Télécharger
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex h-9 items-center gap-1.5 border border-eb-blue bg-eb-blue px-3 text-[13px] font-medium text-white transition-colors hover:bg-eb-blue-strong"
            >
              <Icon name="printer" size={16} /> Imprimer / PDF
            </button>
            <button
              onClick={onRestart}
              className="inline-flex h-9 items-center gap-1.5 border border-eb-line-strong bg-white px-3 text-[13px] font-medium text-navy transition-colors hover:bg-gray-10"
            >
              <Icon name="renew" size={16} /> Nouveau
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-7">
        {/* En-tête rapport */}
        <div className="print-block eb-card mb-5 overflow-hidden">
          <div className="bg-navy px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white/10">
                  <StarLogo size={22} />
                </span>
                <div>
                  <div className="text-[12px] uppercase tracking-[0.2em] text-white/60">Étoile Bleue · 199</div>
                  <div className="text-[20px] font-semibold leading-tight tracking-tight">Rapport de certification — formateur</div>
                </div>
              </div>
              <div className={`hidden rounded-lg px-3 py-1.5 text-[13px] font-bold sm:block ${verdict.bg} text-white`}>
                {verdict.label}
              </div>
            </div>
          </div>
          <div className="grid gap-x-6 gap-y-2 px-6 py-4 text-[14px] sm:grid-cols-2">
            <Info label="Candidat" value={result.candidate.fullName} />
            <Info label="E-mail" value={result.candidate.email} />
            <Info label="Profil" value={result.candidate.profile} />
            <Info label="Structure / Centre" value={result.candidate.org || '—'} />
            <Info label="Date" value={fmtDate(result.submittedAt)} />
            <Info label="Édition" value={exam.meta.edition} />
          </div>
        </div>

        {/* Verdict + score */}
        <div className="print-block eb-card mb-5 grid items-center gap-6 p-6 sm:grid-cols-[auto_1fr]">
          <ScoreRing pct={result.pct} pass={result.passed} />
          <div>
            <div className={`text-[15px] font-bold uppercase tracking-wide ${verdict.tone}`}>{verdict.label}</div>
            <div className="mt-1 font-mono text-[28px] font-medium text-navy">
              {result.pct}% <span className="text-[16px] text-eb-muted">· {result.totalAwarded}/{result.totalMax} pts</span>
            </div>
            <p className="mt-2 max-w-lg text-[14px] text-eb-muted">
              Seuil de réussite : {exam.meta.passMark}%.{' '}
              {result.reviewPending && (
                <span className="text-eb-warn">
                  Score provisoire — {result.perQuestion.filter((r) => r.needsReview).length} réponse(s) rédigée(s) à
                  valider par le correcteur.
                </span>
              )}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill label="Durée" value={formatDuration(result.durationMs)} />
              <Pill
                label="Répondues"
                value={`${result.perQuestion.filter((r) => r.answered).length}/${result.perQuestion.length}`}
              />
              <Pill
                label="Intégrité Focus"
                value={result.focusEvents.length === 0 ? 'Aucune sortie' : `${result.focusEvents.length} sortie(s)`}
                tone={result.focusEvents.length === 0 ? 'ok' : 'red'}
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="print-block eb-card mb-5 p-6">
          <h3 className="mb-4 text-[15px] font-semibold text-navy">Résultats par section</h3>
          <div className="grid gap-4">
            {result.sections.map((s) => {
              const sec = sectionsById.get(s.sectionId)
              return (
                <div key={s.sectionId}>
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="font-medium text-navy">
                      {sec?.index}. {sec?.title}
                    </span>
                    <span className="font-mono text-eb-muted">
                      {s.awarded}/{s.max} · {s.pct}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-eb-cream-2">
                    <div
                      className={`h-full rounded-full ${s.pct >= exam.meta.passMark ? 'bg-eb-ok' : s.pct >= 50 ? 'bg-eb-warn' : 'bg-eb-red'}`}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Intégrité */}
        <div className="print-block eb-card mb-5 p-6">
          <h3 className="mb-1 text-[15px] font-semibold text-navy">Intégrité — Mode Focus</h3>
          <p className="mb-3 text-[13px] text-eb-muted">
            Sorties de la page d'examen détectées (changement d'onglet, fenêtre minimisée…).
          </p>
          {result.focusEvents.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl bg-eb-ok/10 px-4 py-3 text-[14px] text-eb-ok">
              <span className="h-2 w-2 rounded-full bg-eb-ok" /> Aucune sortie détectée — examen passé sans interruption.
            </div>
          ) : (
            <div>
              <div className="mb-3 flex flex-wrap gap-2">
                <Pill label="Nombre de sorties" value={`${result.focusEvents.length}`} tone="red" />
                <Pill label="Temps total hors page" value={formatDuration(totalAway)} tone="red" />
              </div>
              <div className="overflow-hidden rounded-xl border border-eb-line">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-eb-cream/60 text-eb-muted">
                    <tr>
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium">Heure</th>
                      <th className="px-3 py-2 font-medium">Durée</th>
                      <th className="px-3 py-2 font-medium">Motif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.focusEvents.map((e, i) => (
                      <tr key={i} className="border-t border-eb-line">
                        <td className="px-3 py-2 font-mono">{i + 1}</td>
                        <td className="px-3 py-2">{new Date(e.at).toLocaleTimeString('fr-FR')}</td>
                        <td className="px-3 py-2">{formatDuration(e.durationMs)}</td>
                        <td className="px-3 py-2">{e.reason === 'blur' ? 'Fenêtre quittée' : 'Onglet masqué'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Revue détaillée */}
        <div className="print-page-break">
          <h3 className="mb-3 mt-2 px-1 text-[15px] font-semibold text-navy">Revue détaillée des réponses</h3>
          <div className="grid gap-3">
            {exam.questions.map((q, i) => {
              const r = result.perQuestion.find((x) => x.questionId === q.id)!
              const st = statusOf(r)
              const meta = STATUS_META[st]
              const sec = sectionsById.get(q.sectionId)
              const candText = answerToText(q, result.answers[q.id])
              const showCorrect = st !== 'correct'
              const writeType = q.type === 'long' || q.type === 'short'
              return (
                <div key={q.id} className="print-block eb-card overflow-hidden">
                  <div className="flex items-center justify-between gap-2 border-b border-eb-line bg-eb-cream/40 px-4 py-2.5">
                    <div className="flex items-center gap-2 text-[12px] text-eb-muted">
                      <span className="grid h-6 w-6 place-items-center rounded bg-eb-blue text-[11px] font-bold text-white">
                        {i + 1}
                      </span>
                      <span>{sec?.index}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[12px] text-eb-muted">
                        {r.awarded}/{r.max} pt{r.max > 1 ? 's' : ''}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium ${meta.cls}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                        {meta.label}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-3.5">
                    <p className="text-[14px] font-medium text-navy">{q.prompt}</p>
                    <div className="mt-2.5 grid gap-2 text-[13.5px]">
                      <Line tone={st === 'correct' ? 'ok' : st === 'empty' ? 'muted' : 'red'} label="Réponse du candidat">
                        {candText}
                      </Line>
                      {showCorrect && !writeType && (
                        <Line tone="ok" label="Réponse attendue">
                          {correctToText(q)}
                        </Line>
                      )}
                      {writeType && (
                        <Line tone="muted" label="Référence / barème">
                          {q.sample}
                        </Line>
                      )}
                    </div>
                    {q.explanation && (
                      <p className="mt-2.5 rounded-lg bg-eb-cream/60 px-3 py-2 text-[12.5px] text-eb-ink/75">
                        <span className="font-semibold text-navy">Note : </span>
                        {q.explanation}
                      </p>
                    )}
                    {writeType && (
                      <div className="mt-2 flex items-center gap-2 text-[12px] text-eb-warn">
                        <span className="h-1.5 w-1.5 rounded-full bg-eb-warn" />
                        Réponse rédigée — à valider manuellement par le correcteur (score affiché : indicatif).
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Validation correcteur */}
        <div className="print-block eb-card mt-6 p-6">
          <h3 className="text-[15px] font-semibold text-navy">Validation du correcteur</h3>
          <p className="mt-1 text-[13px] text-eb-muted">
            À compléter après vérification des réponses rédigées (marquées « À corriger »).
          </p>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            <SignLine label="Score final validé (%)" />
            <SignLine label="Décision (Admis / Ajourné)" />
            <SignLine label="Nom du correcteur" />
            <SignLine label="Date & signature" />
          </div>
        </div>

        <p className="no-print mt-6 text-center text-[12px] text-eb-muted">
          Étoile Bleue — Service National d'Urgence Médicale 199 · Coordination Nationale Spécialisée
        </p>
      </div>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-dashed border-eb-line/70 py-1 sm:border-none sm:py-0">
      <span className="text-eb-muted">{label}</span>
      <span className="text-right font-medium text-navy">{value}</span>
    </div>
  )
}

function Pill({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'red' }) {
  const cls = tone === 'ok' ? 'border-eb-ok/30 bg-eb-ok/8 text-eb-ok' : tone === 'red' ? 'border-eb-red/30 bg-eb-red/8 text-eb-red-strong' : 'border-eb-line bg-white text-navy'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] ${cls}`}>
      <span className="text-eb-muted">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  )
}

function Line({ label, tone, children }: { label: string; tone: 'ok' | 'red' | 'muted'; children: React.ReactNode }) {
  const bar = tone === 'ok' ? 'bg-eb-ok' : tone === 'red' ? 'bg-eb-red' : 'bg-eb-muted'
  return (
    <div className="flex gap-2.5">
      <span className={`mt-0.5 w-1 shrink-0 rounded ${bar}`} />
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-eb-muted">{label}</div>
        <div className="text-eb-ink">{children}</div>
      </div>
    </div>
  )
}

function SignLine({ label }: { label: string }) {
  return (
    <div>
      <div className="text-[12px] text-eb-muted">{label}</div>
      <div className="mt-5 border-b border-eb-ink/30" />
    </div>
  )
}

function ScoreRing({ pct, pass }: { pct: number; pass: boolean }) {
  const r = 52
  const c = 2 * Math.PI * r
  const off = c - (Math.min(100, pct) / 100) * c
  const col = pass ? '#198038' : pct >= 50 ? '#8a6d00' : '#e63946'
  return (
    <div className="relative mx-auto h-[140px] w-[140px]">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e0e0e0" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={col}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.22,1,.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-mono text-[28px] font-medium leading-none text-navy">{pct}%</div>
          <div className="mt-1 text-[11px] uppercase tracking-wide text-eb-muted">score</div>
        </div>
      </div>
    </div>
  )
}
