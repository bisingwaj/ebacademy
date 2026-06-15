import { useState } from 'react'
import type { Candidate, ExamResult } from './types'
import { EXAM } from './data/exam'
import { gradeExam } from './lib/scoring'
import IdentityGate from './screens/IdentityGate'
import ExamShell from './screens/ExamShell'
import Report from './screens/Report'

type Phase = 'identity' | 'exam' | 'report'

export default function App() {
  const [phase, setPhase] = useState<Phase>('identity')
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [result, setResult] = useState<ExamResult | null>(null)

  if (phase === 'exam' && candidate) {
    return (
      <ExamShell
        exam={EXAM}
        candidate={candidate}
        onSubmit={({ answers, startedAt, submittedAt, focusEvents }) => {
          const r = gradeExam(EXAM, answers, candidate, startedAt, submittedAt, focusEvents)
          setResult(r)
          setPhase('report')
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }

  if (phase === 'report' && result) {
    return (
      <Report
        exam={EXAM}
        result={result}
        onRestart={() => {
          setResult(null)
          setCandidate(null)
          setPhase('identity')
          window.scrollTo({ top: 0 })
        }}
      />
    )
  }

  return (
    <IdentityGate
      exam={EXAM}
      onStart={(c) => {
        setCandidate(c)
        setResult(null)
        setPhase('exam')
        window.scrollTo({ top: 0 })
      }}
    />
  )
}
