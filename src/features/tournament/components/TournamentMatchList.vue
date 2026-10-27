<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/shared/i18n/useI18n'
import type { Tournament, TournamentMatchResult } from '../domain/types'
import { lineupNames } from '../domain/tournament'

const props = defineProps<{
  tournament: Tournament
  activeMatchId: string | null
}>()

const emit = defineEmits<{
  start: [matchId: string]
  resume: []
  remove: [matchId: string]
}>()

const { t } = useI18n()

const PLACE_ICONS = ['🥇', '🥈', '🥉'] as const

function formatResults(results: TournamentMatchResult[]): string {
  const names = new Map(props.tournament.participants.map((p) => [p.id, p.name]))
  return [...results]
    .sort((a, b) => (a.place ?? Infinity) - (b.place ?? Infinity))
    .map((r) => {
      const place = r.place ? (PLACE_ICONS[r.place - 1] ?? `${r.place}.`) : '—'
      return `${place} ${names.get(r.participantId) ?? '?'}`
    })
    .join(' · ')
}

const rows = computed(() =>
  [...props.tournament.matches]
    .sort((a, b) => b.number - a.number)
    .map((match) => ({
      id: match.id,
      title: t('match_number', { number: match.number }),
      lineup: lineupNames(props.tournament, match.lineup).join(' → '),
      isFinished: match.status === 'finished',
      isActive: match.id === props.activeMatchId,
      results: formatResults(match.results),
    })),
)
</script>

<template>
  <div v-if="rows.length === 0" class="text-muted small">
    {{ t('tournament_matches_empty') }}
  </div>

  <ul v-else class="list-group list-group-flush">
    <li v-for="row in rows" :key="row.id" class="list-group-item px-0">
      <div class="d-flex justify-content-between align-items-start gap-2">
        <div>
          <div class="fw-bold">
            {{ row.title }}
            <span
              class="badge ms-1"
              :class="row.isFinished ? 'text-bg-secondary' : 'text-bg-warning'"
            >
              {{ row.isFinished ? t('match_status_finished') : t('match_status_pending') }}
            </span>
          </div>
          <div class="small text-muted">
            {{ row.isFinished ? row.results : row.lineup }}
          </div>
        </div>

        <div v-if="!row.isFinished" class="btn-group btn-group-sm flex-shrink-0">
          <button
            v-if="row.isActive"
            type="button"
            class="btn btn-success"
            @click="emit('resume')"
          >
            {{ t('btn_match_continue') }}
          </button>
          <template v-else>
            <button type="button" class="btn btn-outline-success" @click="emit('start', row.id)">
              {{ t('btn_match_start') }}
            </button>
            <button type="button" class="btn btn-outline-danger" @click="emit('remove', row.id)">
              {{ t('btn_match_delete') }}
            </button>
          </template>
        </div>
      </div>
    </li>
  </ul>
</template>
