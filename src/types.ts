// ============================================================================
// Modèle de données — Examen des formateurs Étoile Bleue
// ============================================================================

export type QuestionType =
  | 'mcq' // choix unique
  | 'multi' // choix multiples
  | 'truefalse' // vrai / faux
  | 'short' // réponse écrite courte (auto par mots-clés)
  | 'long' // réponse rédigée (correction manuelle)
  | 'order' // remettre dans l'ordre
  | 'match' // associer
  | 'hotspot' // visuel : cliquer la bonne zone d'une maquette

export type MockupId =
  | 'citizen-home'
  | 'citizen-type'
  | 'urgentiste-mission'
  | 'urgentiste-bilan'
  | 'urgentiste-home'
  | 'hopital-preadmission'
  | 'regulation-199'
  | 'hopital-capacite'
  | 'citizen-data'
  | 'urgentiste-incident'

// Figures de raisonnement (Section cognitive)
export type FigureId =
  | 'count-triangles'
  | 'arrows-rotation'
  | 'dots-series'
  | 'matrix-3x3'
  | 'gears'
  | 'folding-cube'
  | 'number-pyramid'

export interface Option {
  id: string
  label: string
}

export interface OrderItem {
  id: string
  label: string
}

export interface MatchLeft {
  id: string
  label: string
}

export interface Spot {
  id: string
  label: string
  // coordonnées en % du cadre de la maquette
  x: number
  y: number
  w: number
  h: number
}

export interface Question {
  id: string
  sectionId: string
  type: QuestionType
  prompt: string
  help?: string
  points: number
  mockup?: MockupId
  figure?: FigureId // figure de raisonnement (questions cognitives visuelles)
  context?: string // mise en situation partagée (études de cas)
  explanation?: string

  // selon le type
  options?: Option[] // mcq, multi
  correctOption?: string // mcq
  correctOptions?: string[] // multi
  correctBool?: boolean // truefalse

  accept?: string[] // short — mots-clés acceptés (normalisés)
  sample?: string // short / long — réponse attendue (référence)
  rubric?: string[] // long — points de barème (mots-clés indicatifs)
  minWords?: number // long

  items?: OrderItem[] // order — présentés mélangés
  correctOrder?: string[] // order — ordre attendu (ids)

  lefts?: MatchLeft[] // match
  rights?: Option[] // match — cibles
  correctMatch?: Record<string, string> // match — leftId -> rightId

  spots?: Spot[] // hotspot
  correctSpot?: string // hotspot
}

export interface Section {
  id: string
  index: string // « I », « II »…
  title: string
  subtitle: string
}

export interface ExamDefinition {
  meta: {
    title: string
    subtitle: string
    edition: string
    durationMin: number
    passMark: number // seuil de réussite (%)
    practicalNote?: string
  }
  sections: Section[]
  questions: Question[]
}

// ---- Réponses du candidat -------------------------------------------------

export type AnswerValue =
  | string // mcq, short, long, hotspot
  | string[] // multi, order
  | boolean // truefalse
  | Record<string, string> // match
  | undefined

export type AnswerMap = Record<string, AnswerValue>

export interface Candidate {
  fullName: string
  email: string
  profile: string // Opérateur 199 / Secouriste / Référent hospitalier / Formateur…
  org?: string
}

// ---- Intégrité (Mode Focus) ----------------------------------------------

export interface FocusEvent {
  at: number // timestamp de départ
  durationMs: number // durée hors de la page
  reason: 'hidden' | 'blur' // onglet caché / fenêtre défocalisée
}

// ---- Notation -------------------------------------------------------------

export interface QuestionResult {
  questionId: string
  awarded: number
  max: number
  correct: boolean // entièrement correct
  partial: boolean
  needsReview: boolean // réponse écrite à valider par le correcteur
  answered: boolean
}

export interface SectionScore {
  sectionId: string
  awarded: number
  max: number
  pct: number
}

export interface ExamResult {
  candidate: Candidate
  startedAt: number
  submittedAt: number
  durationMs: number
  totalAwarded: number
  totalMax: number
  pct: number
  passed: boolean
  reviewPending: boolean
  sections: SectionScore[]
  perQuestion: QuestionResult[]
  focusEvents: FocusEvent[]
  answers: AnswerMap
}
