<script setup lang="ts">
import { useI18n } from '@/shared/i18n/useI18n'
import { RouteName } from '@/shared/router/routeNames'

defineProps<{
  tournamentId: string
  tournamentName: string
  matchNumber: number
}>()

const { t } = useI18n()
</script>

<template>
  <div class="match-banner d-flex justify-content-between align-items-center mb-3">
    <span class="fw-bold">
      {{ t('tournament_match_banner', { name: tournamentName, number: matchNumber }) }}
    </span>
    <RouterLink
      :to="{ name: RouteName.TournamentDetails, params: { tournamentId } }"
      class="btn btn-sm btn-outline-warning"
    >
      {{ t('nav_tournament') }}
    </RouterLink>
  </div>
</template>

<style scoped>
.match-banner {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  border: 1px solid #ffe69c;
  background: #fff8e1;
  color: #664d03;
}
</style>
