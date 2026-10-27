<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/shared/i18n/useI18n'
import type { TournamentStatus } from '../domain/types'

const props = defineProps<{
  status: TournamentStatus
}>()

const { t } = useI18n()

const badge = computed(() => {
  switch (props.status) {
    case 'active':
      return { text: t('tournament_status_active'), className: 'text-bg-success' }
    case 'finished':
      return { text: t('tournament_status_finished'), className: 'text-bg-secondary' }
    default:
      return { text: t('tournament_status_draft'), className: 'text-bg-warning' }
  }
})
</script>

<template>
  <span class="badge" :class="badge.className">{{ badge.text }}</span>
</template>
