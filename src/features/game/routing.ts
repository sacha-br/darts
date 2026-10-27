import type { RouteLocationRaw } from 'vue-router'
import { RouteName } from '@/shared/router/routeNames'
import type { MatchContext } from './domain/types'

export function activeGameLocation(context: MatchContext): RouteLocationRaw {
  if (context.kind === 'tournament') {
    return {
      name: RouteName.TournamentMatchPlay,
      params: { tournamentId: context.tournamentId, matchId: context.matchId },
    }
  }
  return { name: RouteName.GamePlay }
}
