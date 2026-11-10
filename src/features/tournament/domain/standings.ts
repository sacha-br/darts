import { pointsForPlace } from '@/features/matches/domain/placePoints'
import type {
  Tournament,
  TournamentMatch,
  TournamentParticipant,
  TournamentStanding,
} from './types'

type Tally = Omit<TournamentStanding, 'position' | 'positionChange'>
type RankedTally = Omit<TournamentStanding, 'positionChange'>

/** Таблица регулярного этапа: учитываются только завершённые партии `regular` в порядке их завершения. */
function finishedRegularMatches(tournament: Tournament): TournamentMatch[] {
  return tournament.matches
    .filter((m) => m.stage === 'regular' && m.status === 'finished')
    .sort((a, b) => (a.finishedAt ?? '').localeCompare(b.finishedAt ?? '') || a.number - b.number)
}

function tally(
  participant: TournamentParticipant,
  matches: readonly TournamentMatch[],
  placesCount: number,
): Tally {
  const placeCounts = new Array<number>(placesCount).fill(0)
  let played = 0
  let points = 0
  let placeSum = 0
  let placedCount = 0

  for (const match of matches) {
    const result = match.results.find((r) => r.participantId === participant.id)
    if (!result) continue

    played++
    points += pointsForPlace(result.place)
    if (result.place !== null) {
      placeCounts[result.place - 1] = (placeCounts[result.place - 1] ?? 0) + 1
      placeSum += result.place
      placedCount++
    }
  }

  return {
    participantId: participant.id,
    name: participant.name,
    played,
    points,
    placeCounts,
    averagePlace: placedCount > 0 ? placeSum / placedCount : null,
  }
}

/** Очки, затем countback (больше 1-х мест, затем 2-х и т. д.), затем среднее место. */
function compareTallies(a: Tally, b: Tally): number {
  if (a.points !== b.points) return b.points - a.points

  const length = Math.max(a.placeCounts.length, b.placeCounts.length)
  for (let i = 0; i < length; i++) {
    const diff = (b.placeCounts[i] ?? 0) - (a.placeCounts[i] ?? 0)
    if (diff !== 0) return diff
  }

  const avgA = a.averagePlace ?? Infinity
  const avgB = b.averagePlace ?? Infinity
  return avgA === avgB ? 0 : avgA - avgB
}

function rankParticipants(
  participants: readonly TournamentParticipant[],
  matches: readonly TournamentMatch[],
): RankedTally[] {
  const sorted = participants
    .map((participant) => tally(participant, matches, participants.length))
    .sort((a, b) => compareTallies(a, b) || a.name.localeCompare(b.name))

  const ranked: RankedTally[] = []
  sorted.forEach((row, index) => {
    const previous = ranked[index - 1]
    const position = previous && compareTallies(previous, row) === 0 ? previous.position : index + 1
    ranked.push({ ...row, position })
  })
  return ranked
}

export function computeStandings(tournament: Tournament): TournamentStanding[] {
  const matches = finishedRegularMatches(tournament)
  const current = rankParticipants(tournament.participants, matches)

  if (matches.length < 2) {
    return current.map((row) => ({ ...row, positionChange: null }))
  }

  const positionsBefore = new Map(
    rankParticipants(tournament.participants, matches.slice(0, -1)).map((row) => [
      row.participantId,
      row.position,
    ]),
  )
  return current.map((row) => ({
    ...row,
    positionChange: (positionsBefore.get(row.participantId) ?? row.position) - row.position,
  }))
}
