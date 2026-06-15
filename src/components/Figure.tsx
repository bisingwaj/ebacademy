import type { FigureId } from '../types'

// Figures de raisonnement (Section cognitive). Rendu propre, sur carte blanche.

function CountTriangles() {
  // Grand triangle divisé en 4 par les milieux → 5 triangles au total.
  return (
    <svg viewBox="0 0 100 92" className="h-40 w-full">
      <g fill="none" stroke="#0d1b3e" strokeWidth="2.2" strokeLinejoin="round">
        <path d="M50 8 L8 84 L92 84 Z" />
        <path d="M29 46 L71 46 L50 84 Z" />
      </g>
    </svg>
  )
}

function Arrow({ dir }: { dir: 'up' | 'right' | 'down' | 'left' }) {
  const rot = { up: 0, right: 90, down: 180, left: 270 }[dir]
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" style={{ transform: `rotate(${rot}deg)` }}>
      <path d="M12 4 L19 13 H15 V20 H9 V13 H5 Z" fill="#3461c9" />
    </svg>
  )
}

function ArrowsRotation() {
  const cells: ('up' | 'right' | 'down' | null)[] = ['up', 'right', 'down', null]
  return (
    <div className="flex items-center gap-2">
      {cells.map((d, i) => (
        <div
          key={i}
          className="grid h-14 w-14 place-items-center border border-eb-line bg-white text-[20px] font-semibold text-eb-muted"
        >
          {d ? <Arrow dir={d} /> : '?'}
        </div>
      ))}
    </div>
  )
}

function DotsSeries() {
  const counts = [1, 2, 4, 8]
  const Dots = ({ n }: { n: number }) => (
    <div className="grid grid-cols-3 place-content-center gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full bg-navy" />
      ))}
    </div>
  )
  return (
    <div className="flex items-center gap-2">
      {counts.map((n) => (
        <div key={n} className="grid h-14 w-14 place-items-center border border-eb-line bg-white p-1">
          <Dots n={n} />
        </div>
      ))}
      <div className="grid h-14 w-14 place-items-center border border-eb-line bg-white text-[20px] font-semibold text-eb-muted">
        ?
      </div>
    </div>
  )
}

export function Figure({ id }: { id: FigureId }) {
  const inner =
    id === 'count-triangles' ? <CountTriangles /> : id === 'arrows-rotation' ? <ArrowsRotation /> : <DotsSeries />
  return (
    <div className="inline-flex items-center justify-center border border-eb-line bg-gray-10 px-5 py-4">{inner}</div>
  )
}
