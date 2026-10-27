import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'
import { useGameStore } from '@/features/game/stores/gameStore'
import { RouteName } from '@/shared/router/routeNames'
import { useTournamentStore } from './stores/tournamentStore'
import { canCreateMatch } from './domain/tournament'

function param(to: RouteLocationNormalized, key: string): string {
  const value = to.params[key]
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

function requireTournament(to: RouteLocationNormalized) {
  if (!useTournamentStore().getById(param(to, 'tournamentId'))) {
    return { name: RouteName.Tournaments }
  }
}

function requireCanCreateMatch(to: RouteLocationNormalized) {
  const tournament = useTournamentStore().getById(param(to, 'tournamentId'))
  if (tournament && !canCreateMatch(tournament)) {
    return { name: RouteName.TournamentDetails, params: { tournamentId: tournament.id } }
  }
}

/** Экран партии показывает только ту партию, что сейчас идёт в движке игры. */
function requireActiveMatch(to: RouteLocationNormalized) {
  const game = useGameStore()
  const context = game.context
  const isActive =
    game.isGameStarted &&
    context.kind === 'tournament' &&
    context.tournamentId === param(to, 'tournamentId') &&
    context.matchId === param(to, 'matchId')

  if (!isActive) {
    return { name: RouteName.TournamentDetails, params: { tournamentId: param(to, 'tournamentId') } }
  }
}

export const tournamentRoutes: RouteRecordRaw[] = [
  {
    path: 'tournaments',
    beforeEnter: () => useTournamentStore().load(),
    children: [
      {
        path: '',
        name: RouteName.Tournaments,
        component: () => import('./pages/TournamentListPage.vue'),
      },
      {
        path: 'new',
        name: RouteName.TournamentCreate,
        component: () => import('./pages/TournamentCreatePage.vue'),
      },
      {
        path: ':tournamentId',
        name: RouteName.TournamentDetails,
        component: () => import('./pages/TournamentDetailsPage.vue'),
        props: true,
        beforeEnter: requireTournament,
      },
      {
        path: ':tournamentId/matches/new',
        name: RouteName.TournamentMatchCreate,
        component: () => import('./pages/TournamentMatchCreatePage.vue'),
        props: true,
        beforeEnter: [requireTournament, requireCanCreateMatch],
      },
      {
        path: ':tournamentId/matches/:matchId/play',
        name: RouteName.TournamentMatchPlay,
        component: () => import('./pages/TournamentMatchPlayPage.vue'),
        props: true,
        beforeEnter: [requireTournament, requireActiveMatch],
      },
    ],
  },
]
