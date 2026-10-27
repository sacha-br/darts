<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { RouteName } from '@/shared/router/routeNames'
import { useGameStore } from '../stores/gameStore'
import GameArena from '../components/GameArena.vue'
import GameOverPanel from '../components/GameOverPanel.vue'

const game = useGameStore()
const router = useRouter()

watch(
  () => game.isGameStarted,
  (started) => {
    if (!started) void router.replace({ name: RouteName.GameSetup })
  },
)
</script>

<template>
  <GameArena>
    <template #game-over>
      <GameOverPanel />
    </template>
  </GameArena>
</template>
