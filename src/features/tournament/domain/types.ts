import type { GameRules } from '@/features/game/domain/types'

export interface TournamentParticipant {
  id: string
  name: string
}

/** `regular` — партии регулярного этапа со всеми участниками; `playoff` — будущая сетка 1-на-1 (BO3). */
export type TournamentStage = 'regular' | 'playoff'

export type TournamentMatchStatus = 'pending' | 'finished'

export interface TournamentMatchResult {
  participantId: string
  place: number | null
}

export interface TournamentMatch {
  id: string
  /** Порядковый номер партии внутри турнира, начиная с 1. */
  number: number
  stage: TournamentStage
  /** Id участников в порядке бросков. */
  lineup: string[]
  status: TournamentMatchStatus
  createdAt: string
  finishedAt: string | null
  results: TournamentMatchResult[]
}

export interface Tournament {
  id: string
  name: string
  createdAt: string
  /** Правила фиксируются при создании и действуют для всех партий турнира. */
  rules: GameRules
  participants: TournamentParticipant[]
  matches: TournamentMatch[]
  finishedAt: string | null
}

export type TournamentStatus = 'draft' | 'active' | 'finished'

export interface TournamentStanding {
  participantId: string
  name: string
  /** Игроки, равные по всем критериям, делят позицию: 1, 1, 3. */
  position: number
  played: number
  points: number
  /** `placeCounts[i]` — сколько раз участник занял место `i + 1`. */
  placeCounts: number[]
  averagePlace: number | null
  /** На сколько позиций поднялся (+) или опустился (−) после последней завершённой партии; `null`, пока сравнивать не с чем. */
  positionChange: number | null
}

/** Действующий чемпион: назначен вручную или победитель последнего турнира — побеждает более позднее событие. */
export interface Champion {
  name: string
  since: string
  source: 'manual' | 'tournament'
}
