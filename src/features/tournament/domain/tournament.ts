import type { GameRules } from '@/features/game/domain/types'
import { playerKey } from '@/features/matches/domain/player'
import type {
  Tournament,
  TournamentMatch,
  TournamentMatchResult,
  TournamentParticipant,
  TournamentStatus,
} from './types'

export const MIN_TOURNAMENT_PARTICIPANTS = 2

export type ParticipantNameError = 'empty' | 'duplicate'

export function getTournamentStatus(tournament: Tournament): TournamentStatus {
  if (tournament.finishedAt) return 'finished'
  return tournament.matches.length > 0 ? 'active' : 'draft'
}

/** Состав фиксируется с первой партией: в регулярном этапе каждая партия идёт со всеми участниками. */
export function canEditParticipants(tournament: Tournament): boolean {
  return getTournamentStatus(tournament) === 'draft'
}

export function canCreateMatch(tournament: Tournament): boolean {
  return (
    getTournamentStatus(tournament) !== 'finished' &&
    tournament.participants.length >= MIN_TOURNAMENT_PARTICIPANTS
  )
}

export function validateParticipantName(
  participants: readonly TournamentParticipant[],
  name: string,
): ParticipantNameError | null {
  const key = playerKey(name)
  if (!key) return 'empty'
  if (participants.some((p) => playerKey(p.name) === key)) return 'duplicate'
  return null
}

export function createTournament(input: {
  id: string
  name: string
  rules: GameRules
  createdAt: string
}): Tournament {
  return {
    id: input.id,
    name: input.name.trim(),
    createdAt: input.createdAt,
    rules: { ...input.rules },
    participants: [],
    matches: [],
    finishedAt: null,
  }
}

export function addParticipant(
  tournament: Tournament,
  participant: TournamentParticipant,
): Tournament {
  if (!canEditParticipants(tournament)) {
    throw new Error('Participants are locked after the first match')
  }
  if (validateParticipantName(tournament.participants, participant.name)) {
    throw new Error(`Invalid participant name: "${participant.name}"`)
  }
  return {
    ...tournament,
    participants: [
      ...tournament.participants,
      { id: participant.id, name: participant.name.trim() },
    ],
  }
}

export function removeParticipant(
  tournament: Tournament,
  participantId: string,
): Tournament {
  if (!canEditParticipants(tournament)) {
    throw new Error('Participants are locked after the first match')
  }
  return {
    ...tournament,
    participants: tournament.participants.filter((p) => p.id !== participantId),
  }
}

/** Регулярная партия: каждый участник турнира ровно один раз, меняется только порядок бросков. */
export function isFullLineup(tournament: Tournament, lineup: readonly string[]): boolean {
  const ids = new Set(tournament.participants.map((p) => p.id))
  return lineup.length === ids.size && new Set(lineup).size === ids.size && lineup.every((id) => ids.has(id))
}

export function createRegularMatch(
  tournament: Tournament,
  input: { id: string; lineup: string[]; createdAt: string },
): { tournament: Tournament; match: TournamentMatch } {
  if (!canCreateMatch(tournament)) {
    throw new Error('Tournament does not accept new matches')
  }
  if (!isFullLineup(tournament, input.lineup)) {
    throw new Error('Regular match must include every participant exactly once')
  }

  const lastNumber = tournament.matches.reduce((max, m) => Math.max(max, m.number), 0)
  const match: TournamentMatch = {
    id: input.id,
    number: lastNumber + 1,
    stage: 'regular',
    lineup: [...input.lineup],
    status: 'pending',
    createdAt: input.createdAt,
    finishedAt: null,
    results: [],
  }
  return { tournament: { ...tournament, matches: [...tournament.matches, match] }, match }
}

export function removePendingMatch(tournament: Tournament, matchId: string): Tournament {
  const match = tournament.matches.find((m) => m.id === matchId)
  if (!match || match.status !== 'pending') {
    throw new Error('Only pending matches can be removed')
  }
  return { ...tournament, matches: tournament.matches.filter((m) => m.id !== matchId) }
}

export function recordMatchResult(
  tournament: Tournament,
  input: { matchId: string; results: TournamentMatchResult[]; finishedAt: string },
): Tournament {
  const match = tournament.matches.find((m) => m.id === input.matchId)
  if (!match || match.status !== 'pending') {
    throw new Error('Result can be recorded only for a pending match')
  }
  return {
    ...tournament,
    matches: tournament.matches.map((m) =>
      m.id === input.matchId
        ? { ...m, status: 'finished', finishedAt: input.finishedAt, results: input.results.map((r) => ({ ...r })) }
        : m,
    ),
  }
}

export function lineupNames(tournament: Tournament, lineup: readonly string[]): string[] {
  const byId = new Map(tournament.participants.map((p) => [p.id, p.name]))
  return lineup.map((id) => byId.get(id) ?? '?')
}
