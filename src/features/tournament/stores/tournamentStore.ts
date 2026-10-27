import { defineStore } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import type { GameRules } from '@/features/game/domain/types'
import { createId } from '@/shared/lib/id'
import type { Tournament, TournamentMatch, TournamentMatchResult } from '../domain/types'
import {
  addParticipant as addParticipantRule,
  createRegularMatch,
  createTournament,
  recordMatchResult as recordMatchResultRule,
  removeParticipant as removeParticipantRule,
  removePendingMatch,
} from '../domain/tournament'
import { createTournamentRepository } from '../storage'

export const useTournamentStore = defineStore('tournament', () => {
  const repository = createTournamentRepository()

  const tournaments = ref<Tournament[]>([])
  const isLoaded = shallowRef(false)
  let loading: Promise<void> | null = null

  const sortedTournaments = computed(() =>
    [...tournaments.value].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  )

  function getById(id: string): Tournament | undefined {
    return tournaments.value.find((t) => t.id === id)
  }

  function requireTournament(id: string): Tournament {
    const tournament = getById(id)
    if (!tournament) throw new Error(`Tournament "${id}" not found`)
    return tournament
  }

  function load(): Promise<void> {
    if (isLoaded.value) return Promise.resolve()
    loading ??= repository
      .list()
      .then((list) => {
        tournaments.value = list
        isLoaded.value = true
      })
      .finally(() => {
        loading = null
      })
    return loading
  }

  async function commit(next: Tournament): Promise<void> {
    const index = tournaments.value.findIndex((t) => t.id === next.id)
    if (index === -1) tournaments.value.push(next)
    else tournaments.value[index] = next
    await repository.save(next)
  }

  async function create(input: { name: string; rules: GameRules }): Promise<Tournament> {
    const tournament = createTournament({
      id: createId(),
      name: input.name,
      rules: input.rules,
      createdAt: new Date().toISOString(),
    })
    await commit(tournament)
    return tournament
  }

  async function addParticipant(tournamentId: string, name: string): Promise<void> {
    const next = addParticipantRule(requireTournament(tournamentId), { id: createId(), name })
    await commit(next)
  }

  async function removeParticipant(tournamentId: string, participantId: string): Promise<void> {
    await commit(removeParticipantRule(requireTournament(tournamentId), participantId))
  }

  async function createMatch(tournamentId: string, lineup: string[]): Promise<TournamentMatch> {
    const { tournament, match } = createRegularMatch(requireTournament(tournamentId), {
      id: createId(),
      lineup,
      createdAt: new Date().toISOString(),
    })
    await commit(tournament)
    return match
  }

  async function removeMatch(tournamentId: string, matchId: string): Promise<void> {
    await commit(removePendingMatch(requireTournament(tournamentId), matchId))
  }

  async function recordMatchResult(
    tournamentId: string,
    matchId: string,
    results: TournamentMatchResult[],
  ): Promise<void> {
    const next = recordMatchResultRule(requireTournament(tournamentId), {
      matchId,
      results,
      finishedAt: new Date().toISOString(),
    })
    await commit(next)
  }

  return {
    tournaments,
    isLoaded,
    sortedTournaments,

    getById,
    load,
    create,
    addParticipant,
    removeParticipant,
    createMatch,
    removeMatch,
    recordMatchResult,
  }
})
