<script setup lang="ts">
import { SECTOR_GEOMETRIES } from '@/constants/dartboard'

const emit = defineEmits<{
  score: [baseValue: number, zoneMultiplier: number]
}>()

function onSectorClick(value: number, multiplier: number): void {
  emit('score', value, multiplier)
}
</script>

<template>
  <div class="dartboard-wrapper">
    <svg
      viewBox="-210 -210 420 420"
      width="100%"
      height="100%"
      style="border-radius: 50%"
    >
      <!-- Внешнее кольцо промаха -->
      <circle
        r="200"
        fill="#0f172a"
        class="db-sector"
        @click="onSectorClick(0, 1)"
      />

      <!-- 20 секторов -->
      <template v-for="sector in SECTOR_GEOMETRIES" :key="sector.value">
        <path
          :d="sector.doublePath"
          :fill="sector.modColor"
          class="db-sector db-sector-dark"
          @click="onSectorClick(sector.value, 2)"
        />
        <path
          :d="sector.outerSinglePath"
          :fill="sector.mainColor"
          class="db-sector"
          :class="{ 'db-sector-dark': sector.isEven }"
          @click="onSectorClick(sector.value, 1)"
        />
        <path
          :d="sector.triplePath"
          :fill="sector.modColor"
          class="db-sector db-sector-dark"
          @click="onSectorClick(sector.value, 3)"
        />
        <path
          :d="sector.innerSinglePath"
          :fill="sector.mainColor"
          class="db-sector"
          :class="{ 'db-sector-dark': sector.isEven }"
          @click="onSectorClick(sector.value, 1)"
        />
      </template>

      <!-- Яблочко -->
      <circle
        r="24"
        fill="var(--c-green)"
        class="db-sector"
        @click="onSectorClick(25, 1)"
      />
      <circle
        r="10"
        fill="var(--c-red)"
        class="db-sector"
        @click="onSectorClick(25, 2)"
      />

      <!-- Подписи номеров -->
      <text
        v-for="sector in SECTOR_GEOMETRIES"
        :key="'num-' + sector.value"
        :x="sector.numberX"
        :y="sector.numberY"
        class="db-text"
      >
        {{ sector.value }}
      </text>
    </svg>
  </div>
</template>

<style scoped>
.dartboard-wrapper {
  width: var(--board-size);
  height: var(--board-size);
  margin: 0 auto;
}

.db-sector {
  cursor: pointer;
  stroke: #4b5563;
  stroke-width: 0.5px;
  transition: filter 0.1s ease;
}

.db-sector:hover {
  filter: brightness(0.3);
}

.db-sector:active {
  filter: brightness(0.8);
}

.db-sector-dark:hover {
  filter: brightness(3);
}

.db-sector-dark:active {
  filter: brightness(0.8);
}

.db-text {
  font-size: 14px;
  font-family: sans-serif;
  font-weight: 900;
  fill: #ffffff;
  pointer-events: none;
  text-anchor: middle;
  dominant-baseline: middle;
}
</style>
