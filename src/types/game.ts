export interface Player {
  name: string
  score: number
  isFinished: boolean
  place: number | null
}

export interface HistoryEntry {
  round: number
  playerName: string
  throws: string[]
  sum: number | 'BUST'
  remaining: number
}

export interface GameSetupConfig {
  playerNames: string[]
  startScore: number
  throwsPerLeg: number
  playToLast: boolean
  endWithDouble: boolean
}

export type BoardView = 'circle' | 'classic'
export type Language = 'ru' | 'en'
