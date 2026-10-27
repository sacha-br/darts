/** 
 * Один дротик. 
 * `zone` — не всегда сектор доски: пресеты и пульт присылают готовое значение с множителем 1. 
 */

export interface DartThrow {
  zone: number
  multiplier: number
}

export interface Player {
  name: string
  score: number
  isFinished: boolean
  place: number | null
}

export const BUST = 'BUST'

export interface TurnRecord {
  round: number
  playerName: string
  throws: DartThrow[]
  sum: number | typeof BUST
  remaining: number
}

export interface GameRules {
  startScore: number
  dartsPerTurn: number
  playToLast: boolean
  endWithDouble: boolean
}

export interface GameSetupConfig extends GameRules {
  playerNames: string[]
}

/** К чему относится партия: движок игры одинаков, отличаются источник игроков, правила и использование результата. */
export type MatchContext =
  | { kind: 'casual' }
  | { kind: 'tournament'; tournamentId: string; matchId: string }

export const CASUAL_CONTEXT = { kind: 'casual' } as const satisfies MatchContext
