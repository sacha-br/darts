import { useRouter } from 'vue-router'
import { useGameStore } from '@/features/game/stores/gameStore'
import { activeGameLocation } from '@/features/game/routing'
import { useI18n } from '@/shared/i18n/useI18n'
import type { Tournament, TournamentMatch } from '../domain/types'
import { lineupNames } from '../domain/tournament'

export function useTournamentMatchLauncher() {
  const game = useGameStore()
  const router = useRouter()
  const { t } = useI18n()

  function isActiveMatch(tournamentId: string, matchId: string): boolean {
    const context = game.context
    return (
      game.isGameStarted &&
      context.kind === 'tournament' &&
      context.tournamentId === tournamentId &&
      context.matchId === matchId
    )
  }

  /** Незаконченная партия хранится в единственном экземпляре, поэтому новая её затирает. */
  function confirmReplaceActiveGame(): boolean {
    return !game.isGameStarted || confirm(t('confirm_replace_game'))
  }

  async function play(tournament: Tournament, match: TournamentMatch): Promise<void> {
    game.startGame(
      { ...tournament.rules, playerNames: lineupNames(tournament, match.lineup) },
      { kind: 'tournament', tournamentId: tournament.id, matchId: match.id },
    )
    await router.push(activeGameLocation(game.context))
  }

  async function resume(): Promise<void> {
    await router.push(activeGameLocation(game.context))
  }

  return { isActiveMatch, confirmReplaceActiveGame, play, resume }
}
