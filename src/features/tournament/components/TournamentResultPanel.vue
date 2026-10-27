<script setup lang="ts">
import { useI18n } from '@/shared/i18n/useI18n'

defineProps<{
  saving: boolean
}>()

const emit = defineEmits<{
  save: []
}>()

const { t } = useI18n()
</script>

<template>
  <div class="p-4 bg-white shadow rounded text-center mb-3">
    <h3 class="text-success mb-3">{{ t('msg_game_over') }}</h3>
    <button
      type="button"
      class="btn btn-primary btn-lg"
      :disabled="saving"
      @click="emit('save')"
    >
      {{ t('btn_save_result') }}
    </button>
  </div>
</template>
