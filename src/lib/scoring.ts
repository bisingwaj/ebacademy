import type {
  AnswerMap,
  AnswerValue,
  Candidate,
  ExamDefinition,
  ExamResult,
  FocusEvent,
  Question,
  QuestionResult,
  SectionScore,
} from '../types'

// Normalisation FR : minuscules, sans accents, espaces réduits, ponctuation douce
export function normalize(s: string): string {
  return (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function countWords(s: string): number {
  const n = normalize(s)
  return n ? n.split(' ').length : 0
}

// Évalue une question. Renvoie le détail (points, statut, à corriger…)
export function gradeQuestion(q: Question, raw: AnswerValue): QuestionResult {
  const max = q.points
  const base: QuestionResult = {
    questionId: q.id,
    awarded: 0,
    max,
    correct: false,
    partial: false,
    needsReview: false,
    answered: raw !== undefined && raw !== null && !(Array.isArray(raw) && raw.length === 0) && raw !== '',
  }

  if (!base.answered) return base

  switch (q.type) {
    case 'mcq': {
      const ok = raw === q.correctOption
      return { ...base, awarded: ok ? max : 0, correct: ok }
    }
    case 'truefalse': {
      const ok = raw === q.correctBool
      return { ...base, awarded: ok ? max : 0, correct: ok }
    }
    case 'multi': {
      const sel = (raw as string[]) || []
      const correctSet = q.correctOptions || []
      const allOptions = q.options || []
      // crédit partiel : +1 par bon sélectionné, -1 par mauvais, borné à [0, max]
      let good = 0
      let bad = 0
      sel.forEach((id) => (correctSet.includes(id) ? good++ : bad++))
      const denom = correctSet.length || 1
      const fraction = Math.max(0, (good - bad) / denom)
      const awarded = Math.round(fraction * max * 100) / 100
      const fullyCorrect = good === correctSet.length && bad === 0 && allOptions.length > 0
      return {
        ...base,
        awarded,
        correct: fullyCorrect,
        partial: awarded > 0 && !fullyCorrect,
      }
    }
    case 'order': {
      const arr = (raw as string[]) || []
      const correct = q.correctOrder || []
      let goodPos = 0
      correct.forEach((id, i) => {
        if (arr[i] === id) goodPos++
      })
      const fraction = correct.length ? goodPos / correct.length : 0
      const awarded = Math.round(fraction * max * 100) / 100
      const fullyCorrect = goodPos === correct.length
      return { ...base, awarded, correct: fullyCorrect, partial: awarded > 0 && !fullyCorrect }
    }
    case 'match': {
      const m = (raw as Record<string, string>) || {}
      const correct = q.correctMatch || {}
      const keys = Object.keys(correct)
      let good = 0
      keys.forEach((k) => {
        if (m[k] === correct[k]) good++
      })
      const fraction = keys.length ? good / keys.length : 0
      const awarded = Math.round(fraction * max * 100) / 100
      const fullyCorrect = good === keys.length
      return { ...base, awarded, correct: fullyCorrect, partial: awarded > 0 && !fullyCorrect }
    }
    case 'hotspot': {
      const ok = raw === q.correctSpot
      return { ...base, awarded: ok ? max : 0, correct: ok }
    }
    case 'short': {
      const txt = normalize(raw as string)
      const accept = (q.accept || []).map(normalize)
      const hit = accept.some((a) => a && txt.includes(a))
      return { ...base, awarded: hit ? max : 0, correct: hit, needsReview: !hit }
    }
    case 'long': {
      // Correction manuelle. On propose un score indicatif sur la couverture
      // des mots-clés du barème et le respect de la longueur minimale.
      const txt = normalize(raw as string)
      const rubric = (q.rubric || []).map(normalize)
      const hits = rubric.filter((k) => k && txt.includes(k)).length
      const coverage = rubric.length ? hits / rubric.length : 0
      const lenOk = countWords(raw as string) >= (q.minWords || 0)
      const suggested = Math.round(Math.min(1, coverage * 1.6) * (lenOk ? 1 : 0.7) * max * 100) / 100
      return {
        ...base,
        awarded: suggested, // indicatif — à valider par le correcteur
        correct: false,
        partial: suggested > 0,
        needsReview: true,
      }
    }
    default:
      return base
  }
}

export function gradeExam(
  exam: ExamDefinition,
  answers: AnswerMap,
  candidate: Candidate,
  startedAt: number,
  submittedAt: number,
  focusEvents: FocusEvent[],
): ExamResult {
  const perQuestion = exam.questions.map((q) => gradeQuestion(q, answers[q.id]))
  const byId = new Map(perQuestion.map((r) => [r.questionId, r]))

  const sections: SectionScore[] = exam.sections.map((s) => {
    const qs = exam.questions.filter((q) => q.sectionId === s.id)
    const awarded = qs.reduce((acc, q) => acc + (byId.get(q.id)?.awarded || 0), 0)
    const max = qs.reduce((acc, q) => acc + q.points, 0)
    return {
      sectionId: s.id,
      awarded: Math.round(awarded * 100) / 100,
      max,
      pct: max ? Math.round((awarded / max) * 1000) / 10 : 0,
    }
  })

  const totalAwarded = Math.round(perQuestion.reduce((a, r) => a + r.awarded, 0) * 100) / 100
  const totalMax = exam.questions.reduce((a, q) => a + q.points, 0)
  const pct = totalMax ? Math.round((totalAwarded / totalMax) * 1000) / 10 : 0
  const reviewPending = perQuestion.some((r) => r.needsReview)

  return {
    candidate,
    startedAt,
    submittedAt,
    durationMs: submittedAt - startedAt,
    totalAwarded,
    totalMax,
    pct,
    passed: pct >= exam.meta.passMark,
    reviewPending,
    sections,
    perQuestion,
    focusEvents,
    answers,
  }
}
