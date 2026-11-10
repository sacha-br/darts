/** Очки за 1–4 места; остальные места получают 0. */
export const PLACE_POINTS: readonly number[] = [5, 3, 2, 1]

/** Игроки, закрывшиеся в одном раунде, делят место и получают его очки полностью. */
export function pointsForPlace(place: number | null): number {
  return place ? (PLACE_POINTS[place - 1] ?? 0) : 0
}
