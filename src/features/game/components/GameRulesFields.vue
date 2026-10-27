<script setup lang="ts">
import { useI18n } from '@/shared/i18n/useI18n'

const startScore = defineModel<number>('startScore', { required: true })
const dartsPerTurn = defineModel<number>('dartsPerTurn', { required: true })
const playToLast = defineModel<boolean>('playToLast', { required: true })
const endWithDouble = defineModel<boolean>('endWithDouble', { required: true })

const { t } = useI18n()
</script>

<template>
  <div>
    <label class="form-check-label" for="playToLast">
      {{ t('label_play_to_score') }}
    </label>
    <input
      v-model.number="startScore"
      type="number"
      class="form-control mb-3"
      min="1"
    />
  </div>
  <div>
    <label class="form-check-label" for="playToLast">
      {{ t('label_throw_per_leg') }}
    </label>
    <input
      v-model.number="dartsPerTurn"
      type="number"
      class="form-control mb-3"
      min="1"
      max="10"
      default="3"
    />
  </div>
  <div class="form-check mb-3 text-start">
    <input
      v-model="playToLast"
      class="form-check-input"
      type="checkbox"
      id="playToLast"
    />
    <label class="form-check-label" for="playToLast">
      {{ t('label_play_to_last') }}
    </label>
  </div>

  <div class="form-check mb-3 text-start">
    <input
      v-model="endWithDouble"
      class="form-check-input"
      type="checkbox"
      id="endWithDouble"
    />
    <label class="form-check-label" for="endWithDouble">
      {{ t('label_end_with_double') }}
    </label>
  </div>
</template>
