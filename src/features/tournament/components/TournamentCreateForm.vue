<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { GameRules } from '@/features/game/domain/types'
import { DEFAULT_GAME_RULES } from '@/features/game/constants/rules'
import GameRulesFields from '@/features/game/components/GameRulesFields.vue'
import { useI18n } from '@/shared/i18n/useI18n'
import {
  DEFAULT_PLANNED_MATCHES,
  MAX_PLANNED_MATCHES,
  MIN_PLANNED_MATCHES,
  isValidPlannedMatches,
} from '../domain/tournament'

const props = defineProps<{
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [input: { name: string; rules: GameRules; plannedMatches: number }]
}>()

const { t } = useI18n()

const name = shallowRef('')
const plannedMatches = shallowRef<number>(DEFAULT_PLANNED_MATCHES)
const isPlannedMatchesValid = computed(() => isValidPlannedMatches(plannedMatches.value))
const startScore = shallowRef(DEFAULT_GAME_RULES.startScore)
const dartsPerTurn = shallowRef(DEFAULT_GAME_RULES.dartsPerTurn)
const playToLast = shallowRef(DEFAULT_GAME_RULES.playToLast)
const endWithDouble = shallowRef(DEFAULT_GAME_RULES.endWithDouble)

const canSubmit = computed(
  () => name.value.trim().length > 0 && isPlannedMatchesValid.value && !props.submitting,
)

function onSubmit(): void {
  if (!canSubmit.value) return
  emit('submit', {
    name: name.value.trim(),
    plannedMatches: plannedMatches.value,
    rules: {
      startScore: startScore.value,
      dartsPerTurn: dartsPerTurn.value,
      playToLast: playToLast.value,
      endWithDouble: endWithDouble.value,
    },
  })
}
</script>

<template>
  <form class="card shadow-sm border-0" @submit.prevent="onSubmit">
    <div class="card-body">
      <label class="form-label fw-bold" for="tournamentName">
        {{ t('label_tournament_name') }}
      </label>
      <input
        id="tournamentName"
        v-model="name"
        type="text"
        class="form-control mb-4"
        :placeholder="t('placeholder_tournament_name')"
        maxlength="80"
        required
      />

      <label class="form-label fw-bold" for="plannedMatches">
        {{ t('label_planned_matches') }}
      </label>
      <input
        id="plannedMatches"
        v-model.number="plannedMatches"
        type="number"
        class="form-control"
        :class="{ 'is-invalid': !isPlannedMatchesValid }"
        :min="MIN_PLANNED_MATCHES"
        :max="MAX_PLANNED_MATCHES"
        step="1"
        required
        aria-describedby="plannedMatchesHint"
      />
      <div class="invalid-feedback">
        {{ t('planned_matches_error', { min: MIN_PLANNED_MATCHES, max: MAX_PLANNED_MATCHES }) }}
      </div>
      <div id="plannedMatchesHint" class="form-text mb-4">{{ t('planned_matches_hint') }}</div>

      <h6 class="fw-bold mb-1">{{ t('tournament_rules_title') }}</h6>
      <p class="small text-muted mb-3">{{ t('tournament_rules_hint') }}</p>

      <GameRulesFields
        v-model:start-score="startScore"
        v-model:darts-per-turn="dartsPerTurn"
        v-model:play-to-last="playToLast"
        v-model:end-with-double="endWithDouble"
      />

      <button type="submit" class="btn btn-primary w-100" :disabled="!canSubmit">
        {{ t('btn_create') }}
      </button>
    </div>
  </form>
</template>
