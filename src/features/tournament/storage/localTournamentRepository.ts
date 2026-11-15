import type { Tournament, TournamentMatchResult } from '../domain/types'
import type { TournamentRepository } from '../domain/tournamentRepository'
import { DEFAULT_PLANNED_MATCHES } from '../domain/tournament'

const STORAGE_KEY = 'dartsTournaments'
const SCHEMA_VERSION = 3

interface StoredTournaments {
  version: typeof SCHEMA_VERSION
  tournaments: Tournament[]
}

/** Схема v2: количество партий турнира не задавалось. */
type TournamentV2 = Omit<Tournament, 'plannedMatches'>

/** В схеме v1 после общего места следующее шло подряд (1, 1, 2); с v2 — после всех разделивших (1, 1, 3). */
function migrateResultsFromV1(results: TournamentMatchResult[]): TournamentMatchResult[] {
  return results.map((result) => ({
    ...result,
    place:
      result.place === null
        ? null
        : 1 + results.filter((other) => other.place !== null && other.place < result.place!).length,
  }))
}

function migrateFromV1(tournaments: TournamentV2[]): TournamentV2[] {
  return tournaments.map((tournament) => ({
    ...tournament,
    matches: tournament.matches.map((match) => ({
      ...match,
      results: migrateResultsFromV1(match.results),
    })),
  }))
}

/**
 * Уже идущим турнирам назначается количество партий по умолчанию;
 * если партий создано больше, лимит расширяется до их числа, чтобы ни одна не потерялась.
 */
function migrateFromV2(tournaments: TournamentV2[]): Tournament[] {
  return tournaments.map((tournament) => {
    const regular = tournament.matches.filter((m) => m.stage === 'regular')
    const plannedMatches = Math.max(DEFAULT_PLANNED_MATCHES, regular.length)
    const finished = regular.filter((m) => m.status === 'finished')
    const lastFinishedAt = finished
      .map((m) => m.finishedAt ?? '')
      .reduce((latest, at) => (at > latest ? at : latest), '')

    return {
      ...tournament,
      plannedMatches,
      finishedAt:
        tournament.finishedAt ??
        (finished.length >= plannedMatches && lastFinishedAt ? lastFinishedAt : null),
    }
  })
}

function readAll(): Tournament[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as { version?: number; tournaments?: unknown } | null
    if (!parsed || !Array.isArray(parsed.tournaments)) return []

    switch (parsed.version) {
      case SCHEMA_VERSION:
        return parsed.tournaments as Tournament[]
      case 2:
        return migrateFromV2(parsed.tournaments as TournamentV2[])
      case 1:
        return migrateFromV2(migrateFromV1(parsed.tournaments as TournamentV2[]))
      default:
        return []
    }
  } catch {
    return []
  }
}

function writeAll(tournaments: Tournament[]): void {
  const stored: StoredTournaments = { version: SCHEMA_VERSION, tournaments }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

export function createLocalTournamentRepository(): TournamentRepository {
  return {
    async list() {
      return readAll()
    },

    async save(tournament) {
      const all = readAll()
      const index = all.findIndex((t) => t.id === tournament.id)
      if (index === -1) all.push(tournament)
      else all[index] = tournament
      writeAll(all)
    },

    async remove(id) {
      writeAll(readAll().filter((t) => t.id !== id))
    },
  }
}
