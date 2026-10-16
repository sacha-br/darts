<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useI18n } from '@/composables/useI18n'

const game = useGameStore()
const { t } = useI18n()

const remainingDisplay = computed(() => {
  if (!game.currentPlayer || game.currentTurnThrows.length === 0) return null
  const remaining = game.currentRemaining
  if (remaining < 0) return { text: '➜ BUST', className: 'remaining-bust' }
  return { text: `➜ ${remaining}`, className: 'remaining-normal' }
})
</script>

<template>
  <!-- Текущий игрок, затем раунд -->
  <div class="mycontainer">
    <h2 class="col player-hero mb-3">
      {{ game.currentPlayer?.name ?? '---' }}
    </h2>

    <div class="col d-flex justify-content-center align-items-center mb-3">
      <h1 class="display-1 fw-bold mb-3 pb-5 player-score">
        {{ game.currentPlayer?.score ?? 0 }}
      </h1>
      <span
        v-if="remainingDisplay"
        class="fs-3 ms-2 fw-bold"
        :class="remainingDisplay.className"
      >
        {{ remainingDisplay.text }}
      </span>
    </div>

    <div class="col round-hero mb-3" aria-live="polite">
      <span class="round-hero-label">{{ t('label_round') }}</span>
      <span class="round-hero-value">{{ game.roundNumber }}</span>
    </div>
  </div>

  <!-- Бейджи бросков -->
  <!-- <ThrowBadges /> -->
</template>

<style scoped>
.player-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
  width: fit-content;
  margin: 0 auto;
  padding: 8px 16px;
  border-radius: 14px;
  border: 1px solid #cdebd9;
  background: linear-gradient(180deg, #f2fbf5 0%, #eaf8f0 100%);
  color: #146c43;
  font-size: clamp(1.85rem, 2.1vw, 2.35rem);
  font-weight: 800;
  letter-spacing: 0.01em;
  line-height: 1.2;
  text-wrap: balance;
}

.round-hero {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid #cfe2ff;
  background: #eef5ff;
  color: #0b3d91;
  font-variant-numeric: tabular-nums;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.mycontainer {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
}

.round-hero-label {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.round-hero-value {
  font-size: clamp(1.55rem, 1.8vw, 1.9rem);
  font-weight: 800;
  line-height: 1;
}

@media (max-width: 576px) {
  .player-hero {
    min-height: 46px;
    padding: 7px 12px;
    font-size: 1.65rem;
  }

  .round-hero {
    gap: 8px;
    padding: 6px 12px;
  }

  .round-hero-value {
    font-size: 1.45rem;
  }
}

.player-score {
  line-height: 1;
}

.remaining-normal {
  color: #6c757d;
}

.remaining-bust {
  color: #dc3545;
}
</style>
