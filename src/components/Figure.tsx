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

// Matrice type Raven 3×3 : nb de points = (ligne+1) × (colonne+1) ; dernière case « ? ».
function Matrix3x3() {
  const Dots = ({ n }: { n: number }) => (
    <div className="grid grid-cols-3 place-content-center gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="h-1.5 w-1.5 rounded-full bg-navy" />
      ))}
    </div>
  )
  return (
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: 9 }).map((_, i) => {
        const r = Math.floor(i / 3)
        const c = i % 3
        const last = i === 8
        return (
          <div key={i} className="grid h-12 w-12 place-items-center border border-eb-line bg-white p-1">
            {last ? <span className="text-[20px] font-semibold text-eb-muted">?</span> : <Dots n={(r + 1) * (c + 1)} />}
          </div>
        )
      })}
    </div>
  )
}

// Trois engrenages engrenés. Le premier porte une flèche (sens horaire).
function Cog({ arrow }: { arrow?: boolean }) {
  const teeth = Array.from({ length: 8 }, (_, i) => i)
  return (
    <div className="relative grid h-14 w-14 place-items-center">
      <svg viewBox="0 0 48 48" className="h-12 w-12">
        {teeth.map((i) => {
          const a = (i * Math.PI) / 4
          return <circle key={i} cx={24 + Math.cos(a) * 19} cy={24 + Math.sin(a) * 19} r="3.4" fill="#3461c9" />
        })}
        <circle cx="24" cy="24" r="15" fill="#3461c9" />
        <circle cx="24" cy="24" r="6" fill="#ffffff" />
      </svg>
      {arrow && (
        <svg viewBox="0 0 24 24" className="absolute h-7 w-7">
          <path d="M7 12a5 5 0 1 1 1.6 3.6" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <path d="M9.6 17.2l-1-3.3 3.3 1z" fill="#ffffff" />
        </svg>
      )}
    </div>
  )
}
function Gears() {
  return (
    <div className="flex items-center gap-0.5">
      <Cog arrow />
      <Cog />
      <Cog />
    </div>
  )
}

// Patron de cube en croix. Colonne A-C-E-F ; B et D de part et d'autre de C.
function FoldingCube() {
  const cells = [
    { l: 'A', x: 1, y: 0 },
    { l: 'B', x: 0, y: 1 },
    { l: 'C', x: 1, y: 1 },
    { l: 'D', x: 2, y: 1 },
    { l: 'E', x: 1, y: 2 },
    { l: 'F', x: 1, y: 3 },
  ]
  return (
    <div className="relative" style={{ width: 132, height: 176 }}>
      {cells.map((c) => (
        <div
          key={c.l}
          className="absolute grid h-11 w-11 place-items-center border border-navy bg-white text-[15px] font-semibold text-navy"
          style={{ left: c.x * 44, top: c.y * 44 }}
        >
          {c.l}
        </div>
      ))}
    </div>
  )
}

// Pyramide additive : chaque brique = somme des deux du dessous ; sommet manquant.
function NumberPyramid() {
  const Brick = ({ v, q }: { v?: number; q?: boolean }) => (
    <div
      className={`grid h-9 w-12 place-items-center border bg-white text-[15px] font-semibold ${
        q ? 'border-eb-line text-eb-muted' : 'border-navy text-navy'
      }`}
    >
      {q ? '?' : v}
    </div>
  )
  return (
    <div className="flex flex-col items-center gap-1">
      <Brick q />
      <div className="flex gap-1">
        <Brick v={12} />
        <Brick v={15} />
      </div>
      <div className="flex gap-1">
        <Brick v={5} />
        <Brick v={7} />
        <Brick v={8} />
      </div>
    </div>
  )
}

export function Figure({ id }: { id: FigureId }) {
  const inner =
    id === 'count-triangles' ? (
      <CountTriangles />
    ) : id === 'arrows-rotation' ? (
      <ArrowsRotation />
    ) : id === 'dots-series' ? (
      <DotsSeries />
    ) : id === 'matrix-3x3' ? (
      <Matrix3x3 />
    ) : id === 'gears' ? (
      <Gears />
    ) : id === 'folding-cube' ? (
      <FoldingCube />
    ) : (
      <NumberPyramid />
    )
  return (
    <div className="inline-flex items-center justify-center border border-eb-line bg-gray-10 px-5 py-4">{inner}</div>
  )
}
