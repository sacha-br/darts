import type { RouteRecordRaw } from 'vue-router'
import { RouteName } from '@/shared/router/routeNames'
import { useGameStore } from './stores/gameStore'
import { activeGameLocation } from './routing'

export const gameRoutes: RouteRecordRaw[] = [
  {
    path: 'game',
    component: () => import('./layouts/GameLayout.vue'),
    children: [
      {
        path: '',
        name: RouteName.GamePlay,
        component: () => import('./pages/GamePlayPage.vue'),
        beforeEnter: () => {
          const game = useGameStore()
          if (!game.isGameStarted) return { name: RouteName.GameSetup }
          if (game.context.kind !== 'casual') return activeGameLocation(game.context)
        },
      },
      {
        path: 'new',
        name: RouteName.GameSetup,
        component: () => import('./pages/GameSetupPage.vue'),
        beforeEnter: () => {
          const game = useGameStore()
          if (game.isGameStarted) return activeGameLocation(game.context)
        },
      },
    ],
  },
]
