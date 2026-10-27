<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/shared/i18n/useI18n'
import { RouteName } from '@/shared/router/routeNames'
import type { Tournament } from '../domain/types'
import { getTournamentStatus } from '../domain/tournament'
import TournamentStatusBadge from './TournamentStatusBadge.vue'

const props = defineProps<{
  tournaments: Tournament[]
}>()

const { t } = useI18n()

const rows = computed(() =>
  props.tournaments.map((tournament) => ({
    id: tournament.id,
    name: tournament.name,
    status: getTournamentStatus(tournament),
    createdAt: new Date(tournament.createdAt).toLocaleDateString(),
    participantsLabel: t('tournament_participants_count', { count: tournament.participants.length }),
    matchesLabel: t('tournament_matches_count', { count: tournament.matches.length }),
  })),
)
</script>

<template>
  <div v-if="rows.length === 0" class="text-muted text-center py-4">
    {{ t('tournaments_empty') }}
  </div>

  <div v-else class="list-group shadow-sm">
    <RouterLink
      v-for="row in rows"
      :key="row.id"
      :to="{ name: RouteName.TournamentDetails, params: { tournamentId: row.id } }"
      class="list-group-item list-group-item-action d-flex justify-content-between align-items-center gap-3"
    >
      <span class="d-flex flex-column">
        <span class="fw-bold">{{ row.name }}</span>
        <span class="small text-muted">
          {{ row.createdAt }} · {{ row.participantsLabel }} · {{ row.matchesLabel }}
        </span>
      </span>
      <TournamentStatusBadge :status="row.status" />
    </RouterLink>
  </div>
</template>
