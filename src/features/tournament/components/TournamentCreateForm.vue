<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import type { GameRules } from '@/features/game/domain/types'
import { DEFAULT_GAME_RULES } from '@/features/game/constants/rules'
import GameRulesFields from '@/features/game/components/GameRulesFields.vue'
import { useI18n } from '@/shared/i18n/useI18n'

const props = defineProps<{
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [input: { name: string; rules: GameRules }]
}>()

const { t } = useI18n()

const name = shallowRef('')
const startScore = shallowRef(DEFAULT_GAME_RULES.startScore)
const dartsPerTurn = shallowRef(DEFAULT_GAME_RULES.dartsPerTurn)
const playToLast = shallowRef(DEFAULT_GAME_RULES.playToLast)
const endWithDouble = shallowRef(DEFAULT_GAME_RULES.endWithDouble)

const canSubmit = computed(() => name.value.trim().length > 0 && !props.submitting)

function onSubmit(): void {
  if (!canSubmit.value) return
  emit('submit', {
    name: name.value.trim(),
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
