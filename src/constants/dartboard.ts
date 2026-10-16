export const MAX_THROWS_PER_TURN = 3
export const BUST_MODAL_DURATION_MS = 200
export const WIN_MODAL_DURATION_MS = 300
export const AUTO_FINISH_DELAY_MS = 400

export const SECTORS_ORDER = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
] as const

export const ANGLE_PER_SECTOR = 18

export interface SectorGeometry {
  value: number
  startAngle: number
  endAngle: number
  isEven: boolean
  doublePath: string
  outerSinglePath: string
  triplePath: string
  innerSinglePath: string
  mainColor: string
  modColor: string
  numberX: number
  numberY: number
}

function createArcPath(
  startAngle: number,
  endAngle: number,
  innerRadius: number,
  outerRadius: number,
): string {
  const startRad = ((startAngle - 90) * Math.PI) / 180
  const endRad = ((endAngle - 90) * Math.PI) / 180

  const x1 = outerRadius * Math.cos(startRad)
  const y1 = outerRadius * Math.sin(startRad)
  const x2 = outerRadius * Math.cos(endRad)
  const y2 = outerRadius * Math.sin(endRad)

  const x3 = innerRadius * Math.cos(endRad)
  const y3 = innerRadius * Math.sin(endRad)
  const x4 = innerRadius * Math.cos(startRad)
  const y4 = innerRadius * Math.sin(startRad)

  return [
    `M ${x1} ${y1}`,
    `A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4}`,
    'Z',
  ].join(' ')
}

export const SECTOR_GEOMETRIES: SectorGeometry[] = SECTORS_ORDER.map(
  (value, index) => {
    const startAngle = index * ANGLE_PER_SECTOR - 9
    const endAngle = startAngle + ANGLE_PER_SECTOR
    const isEven = index % 2 === 0

    const textRad = ((startAngle + 9) * Math.PI) / 180 - Math.PI / 2
    const numberX = 185 * Math.cos(textRad)
    const numberY = 185 * Math.sin(textRad)

    return {
      value,
      startAngle,
      endAngle,
      isEven,
      doublePath: createArcPath(startAngle, endAngle, 160, 170),
      outerSinglePath: createArcPath(startAngle, endAngle, 100, 160),
      triplePath: createArcPath(startAngle, endAngle, 90, 100),
      innerSinglePath: createArcPath(startAngle, endAngle, 24, 90),
      mainColor: isEven ? 'var(--c-black)' : 'var(--c-white)',
      modColor: isEven ? 'var(--c-red)' : 'var(--c-green)',
      numberX,
      numberY,
    }
  },
)

export interface CheckoutEntry {
  remaining: number
  combination: string
}

export const POPULAR_CHECKOUTS: CheckoutEntry[] = [
  { remaining: 170, combination: 'T20, T20, Bull' },
  { remaining: 167, combination: 'T20, T19, Bull' },
  { remaining: 164, combination: 'T20, T18, Bull' },
  { remaining: 161, combination: 'T20, T17, Bull' },
  { remaining: 160, combination: 'T20, T20, D20' },
  { remaining: 158, combination: 'T20, T20, D19' },
  { remaining: 150, combination: 'T20, T18, D18' },
  { remaining: 140, combination: 'T20, T16, D16' },
  { remaining: 121, combination: 'T20, 11, D25' },
  { remaining: 100, combination: 'T20, D20' },
  { remaining: 80, combination: 'T20, D10' },
  { remaining: 60, combination: '20, D20' },
  { remaining: 40, combination: 'D20' },
  { remaining: 32, combination: 'D16' },
]

export interface ThrowCombo {
  label: string
  throws: readonly number[]
}

// Пресеты для самых частых ходов
export const POPULAR_COMBOS: ThrowCombo[] = [
  { label: '0 + 0 + 0', throws: [0, 0, 0] },
  { label: '1 + 5 + 20', throws: [1, 5, 20] },
  { label: '1 + 20 + 20', throws: [1, 20, 20] },
  { label: '60 + 60 + 60', throws: [60, 60, 60] },
]

export const CLASSIC_BOARD_VALUES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
] as const
