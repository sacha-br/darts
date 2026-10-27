<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/shared/i18n/useI18n'
import type { TournamentParticipant } from '../domain/types'

const props = defineProps<{
  participants: TournamentParticipant[]
}>()

const lineup = defineModel<string[]>({ required: true })

const { t } = useI18n()

const rows = computed(() => {
  const names = new Map(props.participants.map((p) => [p.id, p.name]))
  return lineup.value.map((id, index) => ({
    id,
    name: names.get(id) ?? '?',
    isFirst: index === 0,
    isLast: index === lineup.value.length - 1,
  }))
})

function move(index: number, offset: -1 | 1): void {
  const target = index + offset
  if (target < 0 || target >= lineup.value.length) return
  const next = [...lineup.value]
  ;[next[index], next[target]] = [next[target]!, next[index]!]
  lineup.value = next
}

function shuffle(): void {
  const next = [...lineup.value]
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j]!, next[i]!]
  }
  lineup.value = next
}
</script>

<template>
  <section class="card shadow-sm border-0">
    <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
      <span>{{ t('match_lineup_title') }}</span>
      <button type="button" class="btn btn-sm btn-outline-secondary" @click="shuffle">
        {{ t('btn_shuffle') }}
      </button>
    </div>

    <ol class="list-group list-group-flush list-group-numbered">
      <li
        v-for="(row, index) in rows"
        :key="row.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <span class="ms-2 me-auto fw-bold">{{ row.name }}</span>
        <span class="btn-group btn-group-sm">
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="row.isFirst"
            :aria-label="t('btn_move_up')"
            @click="move(index, -1)"
          >
            ↑
          </button>
          <button
            type="button"
            class="btn btn-outline-secondary"
            :disabled="row.isLast"
            :aria-label="t('btn_move_down')"
            @click="move(index, 1)"
          >
            ↓
          </button>
        </span>
      </li>
    </ol>

    <div class="card-body py-2">
      <p class="small text-muted mb-0">{{ t('match_lineup_hint') }}</p>
    </div>
  </section>
</template>
