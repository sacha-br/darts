<script setup lang="ts">
import { useSettingsStore } from '@/shared/stores/settingsStore'
import { useGameStore } from '../stores/gameStore'
import GameBoard from './GameBoard.vue'
import GameHeader from './GameHeader.vue'
import PlayerScoreboard from './PlayerScoreboard.vue'
import ThrowHistory from './ThrowHistory.vue'
import BustModal from './BustModal.vue'
import WinModal from './WinModal.vue'

defineSlots<{
  'game-over'(): unknown
}>()

const game = useGameStore()
const settings = useSettingsStore()
</script>

<template>
  <div class="row g-4">
    <div class="col-lg-7">
      <GameBoard />
    </div>

    <div class="col-lg-5">
      <GameHeader v-if="settings.boardView === 'circle'" />
      <PlayerScoreboard />
      <slot v-if="game.isGameOver" name="game-over" />
      <ThrowHistory />
    </div>
  </div>

  <!-- Модалки (телепортируются в body) -->
  <BustModal />
  <WinModal />
</template>
