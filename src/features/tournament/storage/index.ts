import type { TournamentRepository } from '../domain/tournamentRepository'
import { createLocalTournamentRepository } from './localTournamentRepository'

export function createTournamentRepository(): TournamentRepository {
  return createLocalTournamentRepository()
}
