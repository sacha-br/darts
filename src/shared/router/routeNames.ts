export const RouteName = {
  Menu: 'menu',
  GameSetup: 'game-setup',
  GamePlay: 'game-play',
  Tournaments: 'tournaments',
  TournamentCreate: 'tournament-create',
  TournamentDetails: 'tournament-details',
  TournamentMatchCreate: 'tournament-match-create',
  TournamentMatchPlay: 'tournament-match-play',
  Statistics: 'statistics',
  Remote: 'remote',
} as const

export type RouteName = (typeof RouteName)[keyof typeof RouteName]
