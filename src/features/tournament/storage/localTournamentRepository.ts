import type { Tournament } from '../domain/types'
import type { TournamentRepository } from '../domain/tournamentRepository'

const STORAGE_KEY = 'dartsTournaments'
const SCHEMA_VERSION = 1

interface StoredTournaments {
  version: typeof SCHEMA_VERSION
  tournaments: Tournament[]
}

function readAll(): Tournament[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as Partial<StoredTournaments> | null
    if (parsed?.version !== SCHEMA_VERSION || !Array.isArray(parsed.tournaments)) return []
    return parsed.tournaments
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
