<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'
import { useSettingsStore } from '@/stores/settingsStore'
import ThrowBadges from './ThrowBadges.vue'
import DartboardCircle from './DartboardCircle.vue'
import DartboardClassic from './DartboardClassic.vue'
import GameControls from './GameControls.vue'
import GameHeader from './GameHeader.vue'

const game = useGameStore()
const settings = useSettingsStore()

function handleCircleScore(baseValue: number, zoneMultiplier: number): void {
  game.addScore(baseValue, zoneMultiplier)
}

function handleClassicScore(baseValue: number): void {
  game.addScore(baseValue)
}
</script>

<template>
  <div class="card shadow-sm border-0 mb-3">
    <div class="card-body text-center">
      <!-- Текущий игрок, затем раунд -->
      <GameHeader v-if="settings.boardView === 'classic'" />

      <!-- Бейджи бросков -->
      <ThrowBadges />

      <!-- Виды доски -->
      <DartboardCircle
        v-show="settings.boardView === 'circle'"
        @score="handleCircleScore"
      />
      <DartboardClassic
        v-show="settings.boardView === 'classic'"
        @score="handleClassicScore"
      />

      <!-- Управление -->
      <GameControls />
    </div>
  </div>
</template>

<style scoped>
.remaining-normal {
  color: #6c757d;
}

.remaining-bust {
  color: #dc3545;
}
</style>
