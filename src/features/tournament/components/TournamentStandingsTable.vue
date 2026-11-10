<script setup lang="ts">
import { computed } from 'vue'
import { PLACE_POINTS } from '@/features/matches/domain/placePoints'
import { useI18n } from '@/shared/i18n/useI18n'
import type { TournamentStanding } from '../domain/types'

const props = defineProps<{
  standings: TournamentStanding[]
}>()

const { t } = useI18n()

const MEDALS = ['🥇', '🥈', '🥉'] as const

const isEmpty = computed(() => props.standings.every((s) => s.played === 0))

const medalHeaders = computed(() =>
  MEDALS.map((icon, index) => ({ icon, label: t('standings_th_place_count', { place: index + 1 }) })),
)

function formatTrend(change: number | null) {
  if (!change) return null
  return change > 0
    ? { text: `▲${change}`, className: 'text-success', label: t('standings_trend_up', { count: change }) }
    : { text: `▼${-change}`, className: 'text-danger', label: t('standings_trend_down', { count: -change }) }
}

const rows = computed(() =>
  props.standings.map((standing) => ({
    id: standing.participantId,
    position: standing.position,
    name: standing.name,
    played: standing.played,
    medalCounts: MEDALS.map((_, index) => standing.placeCounts[index] ?? 0),
    averagePlace: standing.averagePlace === null ? '—' : standing.averagePlace.toFixed(2),
    points: standing.points,
    isLeader: standing.position === 1,
    trend: formatTrend(standing.positionChange),
  })),
)

const pointsHint = computed(() =>
  t('standings_points_hint', {
    scale: PLACE_POINTS.map((points, index) =>
      t('standings_points_scale_item', { place: index + 1, points }),
    ).join(', '),
  }),
)
</script>

<template>
  <section class="card shadow-sm border-0">
    <div class="card-header bg-white fw-bold">{{ t('tournament_section_table') }}</div>

    <div v-if="isEmpty" class="card-body text-muted small">
      {{ t('tournament_table_empty') }}
    </div>

    <template v-else>
      <div class="table-responsive">
        <table class="standings table mb-0 align-middle text-nowrap">
          <thead class="table-light">
            <tr>
              <th scope="col">{{ t('standings_th_position') }}</th>
              <th scope="col">{{ t('th_player') }}</th>
              <th scope="col" class="text-center">{{ t('standings_th_played') }}</th>
              <th
                v-for="header in medalHeaders"
                :key="header.icon"
                scope="col"
                class="text-center"
                :title="header.label"
              >
                <span aria-hidden="true">{{ header.icon }}</span>
                <span class="visually-hidden">{{ header.label }}</span>
              </th>
              <th scope="col" class="text-center">{{ t('standings_th_avg_place') }}</th>
              <th scope="col" class="text-end">{{ t('standings_th_points') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id" :class="{ 'table-warning': row.isLeader }">
              <td class="fw-bold">
                {{ row.position }}
                <small v-if="row.trend" class="ms-1" :class="row.trend.className" :title="row.trend.label">
                  <span aria-hidden="true">{{ row.trend.text }}</span>
                  <span class="visually-hidden">{{ row.trend.label }}</span>
                </small>
              </td>
              <td class="fw-bold">{{ row.name }}</td>
              <td class="text-center">{{ row.played }}</td>
              <td v-for="(count, index) in row.medalCounts" :key="index" class="text-center">
                {{ count }}
              </td>
              <td class="text-center">{{ row.averagePlace }}</td>
              <td class="text-end fw-bold fs-5">{{ row.points }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card-footer bg-white small text-muted">{{ pointsHint }}</div>
    </template>
  </section>
</template>

<style scoped>
.standings td {
  font-variant-numeric: tabular-nums;
}
</style>
