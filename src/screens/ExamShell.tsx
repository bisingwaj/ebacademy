import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { AnswerMap, AnswerValue, Candidate, ExamDefinition, FocusEvent } from '../types'
import { StarLogo } from '../components/Brand'
import { Icon } from '../components/Icon'
import QuestionView from '../components/QuestionView'
import { useCountdown, formatClock } from '../hooks/useCountdown'
import { useFocusGuard } from '../hooks/useFocusGuard'

interface SubmitPayload {
  answers: AnswerMap
  startedAt: number
  submittedAt: number
  focusEvents: FocusEvent[]
}

const storeKey = (email: string) => `eb-exam:${email.toLowerCase()}`

export default function ExamShell({
  exam,
  candidate,
  onSubmit,
}: {
  exam: ExamDefinition
  candidate: Candidate
  onSubmit: (p: SubmitPayload) => void
}) {
  const totalMs = exam.meta.durationMin * 60_000
  const questions = exam.questions

  // Restauration éventuelle (rafraîchissement de page) — uniquement si la
  // session précédente n'a pas dépassé la durée autorisée.
  const restored = useMemo(() => {
    try {
      const raw = localStorage.getItem(storeKey(candidate.email))
      if (raw) {
        const data = JSON.parse(raw) as { answers: AnswerMap; startedAt: number; salt?: string }
        if (data?.startedAt && Date.now() - data.startedAt < totalMs) return data
      }
    } catch {
      /* noop */
    }
    return null
  }, [candidate.email, totalMs])

  const [answers, setAnswers] = useState<AnswerMap>(restored?.answers || {})
  const [index, setIndex] = useState(0)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const startedAt = useRef<number>(restored?.startedAt || Date.now())
  // Graine de mélange des options, propre à cette tentative (et stable au refresh).
  const seedRef = useRef<string>(restored?.salt || Math.random().toString(36).slice(2, 10))
  const submittedRef = useRef(false)
  const reduceMotion = useReducedMotion()

  const focus = useFocusGuard(true)

  const finish = useCallback(() => {
    if (submittedRef.current) return
    submittedRef.current = true
    try {
      localStorage.removeItem(storeKey(candidate.email))
    } catch {
      /* noop */
    }
    onSubmit({
      answers,
      startedAt: startedAt.current,
      submittedAt: Date.now(),
      focusEvents: focus.flush(), // finalise une sortie en cours + coupe l'alarme
    })
  }, [answers, candidate.email, focus, onSubmit])

  const remaining = useCountdown(startedAt.current, totalMs, finish)
  const lowTime = remaining <= 5 * 60_000

  // Autosauvegarde locale (réponses + heure de départ)
  useEffect(() => {
    try {
      localStorage.setItem(
        storeKey(candidate.email),
        JSON.stringify({ answers, startedAt: startedAt.current, salt: seedRef.current }),
      )
    } catch {
      /* noop */
    }
  }, [answers, candidate.email])

  // Empêche la fermeture accidentelle
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (submittedRef.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [])

  // Échap ferme la confirmation de fin
  useEffect(() => {
    if (!confirmOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setConfirmOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmOpen])

  const setAnswer = (qid: string, v: AnswerValue) => setAnswers((p) => ({ ...p, [qid]: v }))

  const answeredCount = questions.filter((q) => {
    const a = answers[q.id]
    return a !== undefined && a !== '' && !(Array.isArray(a) && a.length === 0)
  }).length

  const q = questions[index]
  const section = exam.sections.find((s) => s.id === q.sectionId)
  const isAnswered = (qid: string) => {
    const a = answers[qid]
    return a !== undefined && a !== '' && !(Array.isArray(a) && a.length === 0)
  }

  const go = (i: number) => setIndex(Math.max(0, Math.min(questions.length - 1, i)))

  return (
    <div className="flex min-h-screen flex-col bg-eb-cream">
      {/* En-tête fixe */}
      <header className="sticky top-0 z-30 border-b border-eb-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-navy">
            <StarLogo size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[12px] text-eb-muted">
              <span className="truncate font-medium text-navy">{candidate.fullName}</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden truncate sm:inline">{candidate.profile}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden bg-eb-cream-2">
              <motion.div
                className="h-full bg-eb-blue"
                animate={{ width: `${(answeredCount / questions.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
              />
            </div>
          </div>

          {/* Indicateur Focus */}
          <div
            className={`hidden items-center gap-1.5 border px-2.5 py-1.5 text-[12px] font-medium sm:flex ${
              focus.count > 0 ? 'border-eb-red/30 bg-eb-red/8 text-eb-red-strong' : 'border-eb-ok/30 bg-eb-ok/8 text-eb-ok'
            }`}
            title="Mode Focus — sorties détectées"
          >
            <span className={`h-2 w-2 rounded-full ${focus.count > 0 ? 'bg-eb-red' : 'bg-eb-ok'}`} />
            Focus {focus.count > 0 ? `· ${focus.count}` : 'OK'}
          </div>

          {/* Minuteur */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 font-mono text-[15px] font-semibold tabular-nums text-white ${
              lowTime ? 'animate-pulse bg-eb-red' : 'bg-navy'
            }`}
          >
            <Icon name="time" size={16} /> {formatClock(remaining)}
          </div>
        </div>
      </header>

      {/* Corps */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {/* navigateur de questions */}
        <div className="mb-5 flex flex-wrap items-center gap-1.5">
          {questions.map((qq, i) => {
            const cur = i === index
            const done = isAnswered(qq.id)
            return (
              <button
                key={qq.id}
                onClick={() => go(i)}
                className={`grid h-7 w-7 place-items-center rounded-md text-[12px] font-semibold transition ${
                  cur
                    ? 'bg-eb-blue text-white ring-2 ring-eb-blue/30'
                    : done
                      ? 'bg-navy text-white'
                      : 'border border-eb-line bg-white text-eb-muted hover:border-navy/40'
                }`}
                title={`Question ${i + 1}`}
              >
                {i + 1}
              </button>
            )
          })}
        </div>

        <motion.div layout className="eb-card overflow-hidden">
          {/* bandeau de section */}
          <div className="flex items-center justify-between gap-3 border-b border-eb-line bg-eb-cream/50 px-5 py-3 md:px-7">
            <div className="flex items-center gap-2">
              <span className="grid h-6 min-w-6 place-items-center rounded bg-eb-blue px-1.5 text-[11px] font-bold text-white">
                {section?.index}
              </span>
              <span className="text-[13px] font-medium text-navy">{section?.title}</span>
            </div>
            <span className="text-[12px] text-eb-muted">
              Question {index + 1} / {questions.length} · {q.points} pt{q.points > 1 ? 's' : ''}
            </span>
          </div>

          <div className="px-5 py-7 md:px-7 md:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <QuestionView question={q} answer={answers[q.id]} onChange={(v) => setAnswer(q.id, v)} seed={seedRef.current} />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* navigation bas */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button onClick={() => go(index - 1)} disabled={index === 0} className="eb-btn-ghost">
            <Icon name="arrow-left" size={18} /> Précédent
          </button>
          <span className="text-[13px] text-eb-muted">
            {answeredCount} / {questions.length} répondues
          </span>
          {index < questions.length - 1 ? (
            <button onClick={() => go(index + 1)} className="eb-btn-primary">
              Suivant <Icon name="arrow-right" size={18} />
            </button>
          ) : (
            <button onClick={() => setConfirmOpen(true)} className="eb-btn-red">
              Terminer l'examen
            </button>
          )}
        </div>
      </main>

      {/* Overlay « hors examen » + alarme */}
      <AnimatePresence>
        {focus.away && (
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-live="assertive"
            aria-label="Vous avez quitté la page d'examen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-eb-red/95 p-6 text-center text-white backdrop-blur-sm"
          >
            <div>
              <motion.div
                animate={reduceMotion ? {} : { scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 0.9 }}
                className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-white/15"
              >
                <Icon name="warning" size={44} strokeWidth={1.6} />
              </motion.div>
              <h2 className="mt-5 text-[26px] font-bold">Revenez à l'examen</h2>
              <p className="mx-auto mt-2 max-w-md text-white/85">
                Vous avez quitté la page d'examen. Cette sortie est enregistrée dans votre rapport. Le minuteur continue
                de tourner.
              </p>
              <p className="mt-4 text-[13px] uppercase tracking-[0.18em] text-white/70">
                Sortie n° {focus.count + 1} · {focus.reason === 'blur' ? 'fenêtre quittée' : 'onglet masqué'}
              </p>
              <p className="mt-2 text-[12px] text-white/60">Si vous n'entendez pas l'alarme, activez le son de l'appareil.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation de fin */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 grid place-items-center bg-navy/50 p-5 backdrop-blur-sm"
            onClick={() => setConfirmOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card-lg"
            >
              <h3 id="confirm-title" className="text-[19px] font-semibold text-navy">
                Terminer l'examen ?
              </h3>
              <p className="mt-2 text-[14px] text-eb-muted">
                Vous avez répondu à <strong className="text-navy">{answeredCount}</strong> question
                {answeredCount > 1 ? 's' : ''} sur {questions.length}.
                {answeredCount < questions.length && (
                  <>
                    {' '}
                    <span className="text-eb-red">{questions.length - answeredCount} sans réponse.</span>
                  </>
                )}
                <br />
                Une fois validé, le rapport est généré et vous ne pourrez plus modifier vos réponses.
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <button autoFocus onClick={() => setConfirmOpen(false)} className="eb-btn-ghost">
                  Continuer
                </button>
                <button onClick={finish} className="eb-btn-red">
                  Valider et terminer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
