<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/shared/i18n/useI18n'
import type { GameRules } from '../domain/types'

const props = defineProps<{
  rules: GameRules
}>()

const { t } = useI18n()

const items = computed(() => [
  { label: t('label_play_to_score'), value: String(props.rules.startScore) },
  { label: t('label_throw_per_leg'), value: String(props.rules.dartsPerTurn) },
  { label: t('label_play_to_last'), value: props.rules.playToLast ? t('value_yes') : t('value_no') },
  { label: t('label_end_with_double'), value: props.rules.endWithDouble ? t('value_yes') : t('value_no') },
])
</script>

<template>
  <dl class="rules-summary row mb-0 small">
    <template v-for="item in items" :key="item.label">
      <dt class="col-8 fw-normal text-muted">{{ item.label }}</dt>
      <dd class="col-4 mb-1 fw-bold text-end">{{ item.value }}</dd>
    </template>
  </dl>
</template>
