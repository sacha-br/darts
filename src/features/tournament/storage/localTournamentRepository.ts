import type { Tournament, TournamentMatchResult } from '../domain/types'
import type { TournamentRepository } from '../domain/tournamentRepository'

const STORAGE_KEY = 'dartsTournaments'
const SCHEMA_VERSION = 2

interface StoredTournaments {
  version: typeof SCHEMA_VERSION
  tournaments: Tournament[]
}

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

function migrateFromV1(tournaments: Tournament[]): Tournament[] {
  return tournaments.map((tournament) => ({
    ...tournament,
    matches: tournament.matches.map((match) => ({
      ...match,
      results: migrateResultsFromV1(match.results),
    })),
  }))
}

function readAll(): Tournament[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as { version?: number; tournaments?: unknown } | null
    if (!parsed || !Array.isArray(parsed.tournaments)) return []
    const tournaments = parsed.tournaments as Tournament[]
    if (parsed.version === SCHEMA_VERSION) return tournaments
    if (parsed.version === 1) return migrateFromV1(tournaments)
    return []
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
