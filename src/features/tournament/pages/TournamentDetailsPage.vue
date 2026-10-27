<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/features/game/stores/gameStore'
import GameRulesSummary from '@/features/game/components/GameRulesSummary.vue'
import { useI18n } from '@/shared/i18n/useI18n'
import { RouteName } from '@/shared/router/routeNames'
import PageHeader from '@/shared/components/PageHeader.vue'
import SkeletonCard from '@/shared/components/SkeletonCard.vue'
import { useTournamentStore } from '../stores/tournamentStore'
import { useTournamentMatchLauncher } from '../composables/useTournamentMatchLauncher'
import {
  canCreateMatch,
  canEditParticipants,
  getTournamentStatus,
} from '../domain/tournament'
import ParticipantsEditor from '../components/ParticipantsEditor.vue'
import TournamentMatchList from '../components/TournamentMatchList.vue'
import TournamentStatusBadge from '../components/TournamentStatusBadge.vue'

const props = defineProps<{
  tournamentId: string
}>()

const store = useTournamentStore()
const game = useGameStore()
const launcher = useTournamentMatchLauncher()
const { t } = useI18n()

const tournament = computed(() => store.getById(props.tournamentId))

const view = computed(() => {
  const current = tournament.value
  if (!current) return null
  return {
    status: getTournamentStatus(current),
    createdAt: new Date(current.createdAt).toLocaleDateString(),
    participantsLocked: !canEditParticipants(current),
    canCreateMatch: canCreateMatch(current),
  }
})

const activeMatchId = computed(() => {
  const context = game.context
  return game.isGameStarted &&
    context.kind === 'tournament' &&
    context.tournamentId === props.tournamentId
    ? context.matchId
    : null
})

function onAddParticipant(name: string): void {
  void store.addParticipant(props.tournamentId, name)
}

function onRemoveParticipant(participantId: string): void {
  void store.removeParticipant(props.tournamentId, participantId)
}

function onStartMatch(matchId: string): void {
  const current = tournament.value
  const match = current?.matches.find((m) => m.id === matchId)
  if (!current || !match || !launcher.confirmReplaceActiveGame()) return
  void launcher.play(current, match)
}

function onRemoveMatch(matchId: string): void {
  if (!confirm(t('confirm_delete_match'))) return
  void store.removeMatch(props.tournamentId, matchId)
}
</script>

<template>
  <div v-if="tournament && view">
    <RouterLink :to="{ name: RouteName.Tournaments }" class="small text-decoration-none">
      {{ t('nav_all_tournaments') }}
    </RouterLink>

    <div class="d-flex justify-content-between align-items-start gap-2 mt-1">
      <PageHeader :title="tournament.name" :subtitle="view.createdAt" />
      <TournamentStatusBadge :status="view.status" />
    </div>

    <div class="row g-3">
      <div class="col-lg-4 d-grid gap-3 align-content-start">
        <ParticipantsEditor
          :participants="tournament.participants"
          :locked="view.participantsLocked"
          @add="onAddParticipant"
          @remove="onRemoveParticipant"
        />

        <section class="card shadow-sm border-0">
          <div class="card-header bg-white fw-bold">{{ t('tournament_rules_title') }}</div>
          <div class="card-body">
            <GameRulesSummary :rules="tournament.rules" />
          </div>
        </section>
      </div>

      <div class="col-lg-8 d-grid gap-3 align-content-start">
        <section class="card shadow-sm border-0">
          <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
            <span>{{ t('tournament_matches_title') }}</span>
            <RouterLink
              v-if="view.canCreateMatch"
              :to="{ name: RouteName.TournamentMatchCreate, params: { tournamentId } }"
              class="btn btn-sm btn-primary"
            >
              {{ t('btn_new_match') }}
            </RouterLink>
          </div>
          <div class="card-body py-2">
            <TournamentMatchList
              :tournament="tournament"
              :active-match-id="activeMatchId"
              @start="onStartMatch"
              @resume="launcher.resume()"
              @remove="onRemoveMatch"
            />
          </div>
        </section>

        <SkeletonCard :title="t('tournament_section_table')" :lines="4" />
      </div>
    </div>
  </div>
</template>
