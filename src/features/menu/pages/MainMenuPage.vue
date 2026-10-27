<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useGameStore } from '@/features/game/stores/gameStore'
import { activeGameLocation } from '@/features/game/routing'
import { useI18n } from '@/shared/i18n/useI18n'
import { RouteName } from '@/shared/router/routeNames'
import MenuTile from '../components/MenuTile.vue'

interface MenuItem {
  id: string
  to: RouteLocationRaw
  icon: string
  title: string
  description: string
  primary?: boolean
}

const game = useGameStore()
const { t } = useI18n()

const gameItem = computed<MenuItem>(() =>
  game.isGameStarted
    ? {
        id: 'game',
        to: activeGameLocation(game.context),
        icon: '▶️',
        title: t('menu_continue'),
        description:
          game.context.kind === 'tournament'
            ? t('menu_continue_tournament_desc')
            : t('menu_continue_desc'),
        primary: true,
      }
    : {
        id: 'game',
        to: { name: RouteName.GameSetup },
        icon: '🎯',
        title: t('menu_play'),
        description: t('menu_play_desc'),
        primary: true,
      },
)

const items = computed<MenuItem[]>(() => [
  gameItem.value,
  {
    id: 'tournament',
    to: { name: RouteName.Tournaments },
    icon: '🏆',
    title: t('menu_tournament'),
    description: t('menu_tournament_desc'),
  },
  {
    id: 'statistics',
    to: { name: RouteName.Statistics },
    icon: '📊',
    title: t('menu_statistics'),
    description: t('menu_statistics_desc'),
  },
])
</script>

<template>
  <div class="main-menu mx-auto">
    <div class="text-center mb-4">
      <h1 class="fw-bold mb-1">{{ t('menu_title') }}</h1>
      <p class="text-muted mb-0">{{ t('menu_subtitle') }}</p>
    </div>

    <nav class="d-grid gap-3">
      <MenuTile
        v-for="item in items"
        :key="item.id"
        :to="item.to"
        :icon="item.icon"
        :title="item.title"
        :description="item.description"
        :primary="item.primary"
      />
    </nav>
  </div>
</template>

<style scoped>
.main-menu {
  max-width: 500px;
  padding-top: 1.5rem;
}
</style>
