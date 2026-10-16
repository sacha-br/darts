<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { useI18n } from '@/composables/useI18n'

const game = useGameStore()
const { t } = useI18n()

function confirmNewGame(): void {
  if (confirm(t('confirm_new_game'))) {
    game.newGame()
  }
}
</script>

<template>
  <div class="mt-4 pt-3 border-top">
    <button
      class="btn btn-sm btn-outline-warning me-2"
      :disabled="game.isProcessingTurn"
      @click="game.undoLastThrow()"
    >
      {{ t('btn_undo') }}
    </button>
    <button
      class="btn btn-sm btn-outline-primary me-2"
      :disabled="game.isProcessingTurn"
      @click="game.advanceToPrevLeg()"
    >
      {{ t('btn_undo_leg') }}
    </button>
    <button
      class="btn btn-sm btn-outline-danger me-2"
      :disabled="game.isProcessingTurn"
      @click="game.bust()"
    >
      {{ t('btn_bust') }}
    </button>
    <button
      class="btn btn-sm btn-outline-secondary me-2"
      :disabled="game.isProcessingTurn"
      @click="game.resetTurn()"
    >
      {{ t('btn_reset') }}
    </button>
    <button
      class="btn btn-sm btn-outline-danger"
      @click="confirmNewGame"
    >
      {{ t('btn_new_game') }}
    </button>
  </div>
</template>
