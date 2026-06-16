// Test de justesse de la notation — exécuté hors navigateur.
//   node --experimental-strip-types verify/check-scoring.ts
import { EXAM } from '../src/data/exam.ts'
import { gradeExam, normalize } from '../src/lib/scoring.ts'
import type { AnswerMap, Question } from '../src/types.ts'

const cand = { fullName: 'Test', email: 't@t.cd', profile: 'P' }
let failures = 0
const assert = (cond: boolean, msg: string) => {
  if (!cond) {
    failures++
    console.log('  ✗ ' + msg)
  } else {
    console.log('  ✓ ' + msg)
  }
}

function perfect(q: Question): unknown {
  switch (q.type) {
    case 'mcq': return q.correctOption
    case 'multi': return [...(q.correctOptions || [])]
    case 'truefalse': return q.correctBool
    case 'hotspot': return q.correctSpot
    case 'order': return [...(q.correctOrder || [])]
    case 'match': return { ...(q.correctMatch || {}) }
    case 'short': return (q.accept || [''])[0]
    case 'long': {
      const words = (q.rubric || []).join(' ')
      let s = words
      while (s.split(' ').length < (q.minWords || 0) + 5) s += ' ' + words
      return s
    }
  }
}

function wrong(q: Question): unknown {
  switch (q.type) {
    case 'mcq': return (q.options || []).find((o) => o.id !== q.correctOption)?.id
    case 'multi': {
      const bad = (q.options || []).filter((o) => !(q.correctOptions || []).includes(o.id)).map((o) => o.id)
      return bad.length ? bad : []
    }
    case 'truefalse': return !q.correctBool
    case 'hotspot': return (q.spots || []).find((s) => s.id !== q.correctSpot)?.id
    case 'order': return [...(q.correctOrder || [])].reverse()
    case 'match': {
      const rid = (q.rights || [])[0]?.id
      return Object.fromEntries((q.lefts || []).map((l) => [l.id, rid]))
    }
    case 'short':
    case 'long': return 'zzzzz qqqqq'
  }
}

// 1) Parcours parfait → 100 %
{
  console.log('\n[1] Parcours PARFAIT')
  const ans: AnswerMap = {}
  EXAM.questions.forEach((q) => (ans[q.id] = perfect(q) as never))
  const r = gradeExam(EXAM, ans, cand, 1000, 2000, [])
  assert(r.totalAwarded === r.totalMax, `score plein ${r.totalAwarded}/${r.totalMax} (=${r.pct}%)`)
  assert(r.pct === 100, `pct = 100 (obtenu ${r.pct})`)
  assert(r.passed === true, 'passed = true')
  assert(r.perQuestion.every((p) => p.answered), 'toutes répondues')
  const notFull = r.perQuestion.filter((p) => p.awarded < p.max)
  assert(notFull.length === 0, `aucune question sous le max (${notFull.map((p) => p.questionId).join(',') || 'ok'})`)
}

// 2) Parcours faux → score bas
{
  console.log('\n[2] Parcours FAUX')
  const ans: AnswerMap = {}
  EXAM.questions.forEach((q) => (ans[q.id] = wrong(q) as never))
  const r = gradeExam(EXAM, ans, cand, 1000, 2000, [])
  assert(r.pct < 25, `pct bas = ${r.pct}%`)
  assert(r.passed === false, 'passed = false')
  // les rédigées fausses doivent être à corriger
  const longs = EXAM.questions.filter((q) => q.type === 'long' || q.type === 'short')
  const review = longs.every((q) => r.perQuestion.find((p) => p.questionId === q.id)!.needsReview)
  assert(review, 'short/long faux → needsReview')
}

// 3) Vide → 0 %
{
  console.log('\n[3] Parcours VIDE')
  const r = gradeExam(EXAM, {}, cand, 1000, 2000, [])
  assert(r.totalAwarded === 0, 'score 0')
  assert(r.pct === 0, 'pct 0')
  assert(r.perQuestion.every((p) => !p.answered), 'aucune répondue')
  assert(r.reviewPending === false, 'pas de revue en attente si rien répondu')
}

// 4) Crédit partiel (multi / order / match)
{
  console.log('\n[4] CRÉDIT PARTIEL')
  const multi = EXAM.questions.find((q) => q.type === 'multi')!
  // sélectionne 1 bonne seulement
  const half: AnswerMap = { [multi.id]: [(multi.correctOptions || [])[0]] }
  const r = gradeExam(EXAM, half, cand, 1000, 2000, [])
  const pm = r.perQuestion.find((p) => p.questionId === multi.id)!
  assert(pm.awarded > 0 && pm.awarded < pm.max, `multi partiel = ${pm.awarded}/${pm.max}`)
  assert(pm.partial === true && pm.correct === false, 'multi marqué partiel')

  const order = EXAM.questions.find((q) => q.type === 'order')!
  const swapped = [...(order.correctOrder || [])]
  ;[swapped[0], swapped[1]] = [swapped[1], swapped[0]]
  const r2 = gradeExam(EXAM, { [order.id]: swapped }, cand, 1000, 2000, [])
  const po = r2.perQuestion.find((p) => p.questionId === order.id)!
  assert(po.awarded > 0 && po.awarded < po.max, `order partiel = ${po.awarded}/${po.max}`)
}

// 5) Normalisation FR (accents/casse/ponctuation)
{
  console.log('\n[5] NORMALISATION')
  assert(normalize('Référentiel de Gravité !') === 'referentiel de gravite', 'accents + casse + ponctuation')
  // On prend dynamiquement la première question « short » et on vérifie qu'une
  // variante accentuée/en majuscules de son mot-clé est bien acceptée.
  const short = EXAM.questions.find((q) => q.type === 'short')!
  const kw = (short.accept || [])[0]
  const variant = kw.toUpperCase() + ' !!!'
  const r = gradeExam(EXAM, { [short.id]: variant }, cand, 1000, 2000, [])
  const p = r.perQuestion.find((x) => x.questionId === short.id)!
  assert(p.correct && p.awarded === p.max, `short « ${short.id} » accepte la variante « ${variant} »`)
}

console.log('\n' + (failures === 0 ? '✅ TOUS LES TESTS PASSENT' : `❌ ${failures} ÉCHEC(S)`))
process.exit(failures === 0 ? 0 : 1)
