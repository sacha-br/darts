import type { Tournament } from './types'

export interface TournamentRepository {
  list(): Promise<Tournament[]>
  save(tournament: Tournament): Promise<void>
  remove(id: string): Promise<void>
}
