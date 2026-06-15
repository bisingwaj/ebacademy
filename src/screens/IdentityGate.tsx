import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { Candidate, ExamDefinition } from '../types'
import { FooterBand, StarLogo, TopBand } from '../components/Brand'
import { Icon } from '../components/Icon'
import { primeAudio } from '../lib/audio'

function emailValid(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim())
}

export default function IdentityGate({ exam, onStart }: { exam: ExamDefinition; onStart: (c: Candidate) => void }) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [org, setOrg] = useState('')
  const [consent, setConsent] = useState(false)
  const [touched, setTouched] = useState(false)

  const nQuestions = exam.questions.length
  const totalPoints = useMemo(() => exam.questions.reduce((a, q) => a + q.points, 0), [exam])

  const valid = fullName.trim().length >= 2 && emailValid(email) && consent

  const start = () => {
    setTouched(true)
    if (!valid) return
    primeAudio() // déverrouille l'audio (geste utilisateur) pour l'alarme Mode Focus
    // Les formateurs forment tous les profils : rôle unique « Formateur ».
    onStart({ fullName: fullName.trim(), email: email.trim(), profile: 'Formateur', org: org.trim() || undefined })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBand />
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-8 px-5 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-12">
        {/* Présentation */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col justify-center"
        >
          <span className="eb-eyebrow">Certification officielle</span>
          <h1 className="mt-3 text-pretty text-[34px] font-semibold leading-[1.08] tracking-tight text-navy md:text-[46px]">
            {exam.meta.title}
          </h1>
          <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-eb-muted">{exam.meta.subtitle}</p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={`${nQuestions}`} label="questions" />
            <Stat value={`${exam.meta.durationMin}`} label="minutes" />
            <Stat value={`${totalPoints}`} label="points" />
            <Stat value={`${exam.meta.passMark}%`} label="pour réussir" accent />
          </div>

          <div className="mt-7 border-l-2 border-eb-red bg-eb-red/[0.05] p-4">
            <div className="flex items-center gap-2 font-semibold text-eb-red">
              <Icon name="warning" size={18} />
              Mode Focus activé
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-eb-ink/80">
              Pendant l'examen, l'application surveille votre présence. Si vous changez d'onglet, minimisez ou quittez la
              page, une <strong>alarme sonore</strong> se déclenche et l'incident est consigné dans votre rapport.
              Activez le son de votre appareil.
            </p>
          </div>

          <ul className="mt-6 grid gap-2 text-[14px] text-eb-muted">
            {[
              'Couvre l’application Citoyenne et l’application Urgentiste.',
              'Questions variées : QCM, vrai/faux, association, mise en ordre, visuel et rédaction.',
              'Un rapport détaillé est généré à la fin (imprimable et téléchargeable).',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2.5">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 bg-eb-red" />
                {t}
              </li>
            ))}
          </ul>
        </motion.section>

        {/* Formulaire */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="eb-card p-6 md:p-7"
        >
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy">
              <StarLogo size={22} />
            </span>
            <div>
              <div className="text-[15px] font-semibold text-navy">Identification du candidat</div>
              <div className="text-[12px] text-eb-muted">{exam.meta.edition}</div>
            </div>
          </div>

          <div className="grid gap-4">
            <Field label="Nom complet" required error={touched && fullName.trim().length < 2 ? 'Indiquez votre nom.' : ''}>
              <input
                autoFocus
                className="eb-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex. Jeanne Mukendi"
              />
            </Field>

            <Field label="Adresse e-mail" required error={touched && !emailValid(email) ? 'E-mail invalide.' : ''}>
              <input className="eb-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@exemple.cd" inputMode="email" />
            </Field>

            <Field label="Structure / Centre (facultatif)">
              <input className="eb-field" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Ex. HGR de Kinshasa" />
            </Field>

            <label className="mt-1 flex cursor-pointer items-start gap-3 rounded-xl border border-eb-line bg-eb-cream/40 p-3">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[#3461c9]" />
              <span className="text-[13px] leading-snug text-eb-ink/80">
                Je comprends que le <strong>Mode Focus</strong> surveille ma présence et déclenche une alarme si je quitte la
                page d'examen, et je m'engage à composer de manière honnête.
              </span>
            </label>

            <button onClick={start} disabled={touched && !valid} className="eb-btn-primary mt-1 w-full text-[16px]">
              Commencer l'examen <Icon name="arrow-right" size={18} />
            </button>
            <p className="text-center text-[12px] text-eb-muted">
              Le minuteur démarre dès que vous cliquez. Durée : {exam.meta.durationMin} minutes.
            </p>
          </div>
        </motion.section>
      </main>
      <FooterBand />
    </div>
  )
}

function Stat({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  return (
    <div className="border border-eb-line bg-white px-3 py-3 text-center">
      <div className={`font-mono text-[26px] font-medium leading-none ${accent ? 'text-eb-red' : 'text-navy'}`}>{value}</div>
      <div className="mt-1.5 text-[11px] uppercase tracking-wide text-eb-muted">{label}</div>
    </div>
  )
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-navy">
        {label} {required && <span className="text-eb-red">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-[12px] text-eb-red">{error}</span>}
    </label>
  )
}
