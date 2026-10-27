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

/** Действующий чемпион: назначен вручную или победитель последнего турнира — побеждает более позднее событие. */
export interface Champion {
  name: string
  since: string
  source: 'manual' | 'tournament'
}
