import type { DartThrow, MatchContext, Player, TurnRecord } from '../domain/types'
import { CASUAL_CONTEXT } from '../domain/types'
import { DEFAULT_GAME_RULES } from '../constants/rules'

const STORAGE_KEY = 'dartsGameState'
const SCHEMA_VERSION = 3

export interface GameStateSnapshot {
  players: Player[]
  currentPlayerIndex: number
  currentTurnThrows: DartThrow[]
  currentPlace: number
  someoneWonInThisRound: boolean
  roundNumber: number
  isGameOver: boolean
  isGameStarted: boolean
  history: TurnRecord[]
  playToLast: boolean
  startScore: number
  endWithDouble: boolean
  dartsPerTurn: number
  context: MatchContext
}

interface StoredGameStateV3 extends GameStateSnapshot {
  version: typeof SCHEMA_VERSION
}

/** Схема v2: все партии были быстрыми, контекста не было. */
type GameStateSnapshotV2 = Omit<GameStateSnapshot, 'context'>

/** Схема без поля `version`: броски в истории хранились строками ("D20", ранее "2x20"). */
interface StoredGameStateV1
  extends Omit<
    GameStateSnapshotV2,
    'history' | 'dartsPerTurn' | 'playToLast' | 'startScore' | 'endWithDouble'
  > {
  history?: Array<Omit<TurnRecord, 'throws'> & { throws: string[] }>
  playToLast?: boolean
  startScore?: number
  endWithDouble?: boolean
  maxThrowsPerLeg?: number
}

const LEGACY_THROW_PATTERN = /^(?:([DT])|(\d+)x)?(-?\d+(?:\.\d+)?)$/

function parseLegacyThrow(label: string): DartThrow {
  const match = LEGACY_THROW_PATTERN.exec(label)
  if (!match) return { zone: Number(label) || 0, multiplier: 1 }

  const [, prefix, factor, zone] = match
  const multiplier =
    prefix === 'D' ? 2 : prefix === 'T' ? 3 : factor ? Number(factor) : 1
  return { zone: Number(zone), multiplier }
}

function migrateFromV1(legacy: StoredGameStateV1): GameStateSnapshotV2 {
  const { history, maxThrowsPerLeg, ...rest } = legacy
  return {
    ...rest,
    history: (history ?? []).map((turn) => ({
      ...turn,
      throws: turn.throws.map(parseLegacyThrow),
    })),
    playToLast: legacy.playToLast ?? DEFAULT_GAME_RULES.playToLast,
    startScore: legacy.startScore ?? DEFAULT_GAME_RULES.startScore,
    endWithDouble: legacy.endWithDouble ?? false,
    dartsPerTurn: maxThrowsPerLeg ?? DEFAULT_GAME_RULES.dartsPerTurn,
  }
}

function migrateFromV2(state: GameStateSnapshotV2): GameStateSnapshot {
  return { ...state, context: CASUAL_CONTEXT }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function loadGameState(): GameStateSnapshot | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed) || !Array.isArray(parsed.players)) return null

    if (parsed.version === SCHEMA_VERSION) {
      const { version, ...state } = parsed as unknown as StoredGameStateV3
      return state
    }
    if (parsed.version === 2) {
      const { version, ...state } = parsed as unknown as GameStateSnapshotV2 & { version: 2 }
      return migrateFromV2(state)
    }
    return migrateFromV2(migrateFromV1(parsed as unknown as StoredGameStateV1))
  } catch {
    return null
  }
}

export function saveGameState(state: GameStateSnapshot): void {
  const stored: StoredGameStateV3 = { version: SCHEMA_VERSION, ...state }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

export function clearGameState(): void {
  localStorage.removeItem(STORAGE_KEY)
}
