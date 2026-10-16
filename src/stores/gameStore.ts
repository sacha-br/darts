import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import type { Player, HistoryEntry, GameSetupConfig } from '@/types/game'
import {
  BUST_MODAL_DURATION_MS,
  WIN_MODAL_DURATION_MS,
  AUTO_FINISH_DELAY_MS,
} from '@/constants/dartboard'

const STORAGE_KEY = 'dartsGameState'

interface Throw {
  zone: number
  multiplier: number
}

interface PersistedState {
  players: Player[]
  currentPlayerIndex: number
  currentTurnThrows: Throw[]
  currentPlace: number
  someoneWonInThisRound: boolean
  roundNumber: number
  isGameOver: boolean
  isGameStarted: boolean
  history: HistoryEntry[]
  playToLast: boolean
  startScore: number
  endWithDouble: boolean
  maxThrowsPerLeg: number
}

export const useGameStore = defineStore('game', () => {
  // ─── Основное состояние
  const players = ref<Player[]>([])
  const currentPlayerIndex = shallowRef(0)
  const currentTurnThrows = ref<Throw[]>([])
  const currentPlace = shallowRef(1)
  const someoneWonInThisRound = shallowRef(false)
  const roundNumber = shallowRef(1)
  const isGameOver = shallowRef(false)
  const isGameStarted = shallowRef(false)
  const history = ref<HistoryEntry[]>([])
  const playToLast = shallowRef(true)
  const endWithDouble = shallowRef(true)
  const startScore = shallowRef(301)
  const maxThrowsPerLeg = shallowRef(3)

  // ─── Множитель (только для классической доски)
  const multiplier = shallowRef(1)

  // ─── Состояние модальных окон
  const bustModalVisible = shallowRef(false)
  const winModalData = shallowRef<{ name: string; place: number } | null>(null)

  // Блокирует набор очков во время анимаций модалок или автозавершения хода
  const isProcessingTurn = shallowRef(false)

  // ─── Вычисляемые свойства
  const currentPlayer = computed<Player | null>(() =>
    isGameStarted.value
      ? (players.value[currentPlayerIndex.value] ?? null)
      : null,
  )

  const activePlayers = computed(() =>
    players.value.filter((p) => !p.isFinished),
  )

  const currentTurnSum = computed(() =>
    currentTurnThrows.value.reduce((a, b) => a + b.zone * b.multiplier, 0),
  )

  const currentRemaining = computed(() => {
    if (!currentPlayer.value) return 0
    return currentPlayer.value.score - currentTurnSum.value
  })

  // ─── Действия

  function startGame(config: GameSetupConfig): void {
    players.value = config.playerNames.map((name) => ({
      name,
      score: config.startScore,
      isFinished: false,
      place: null,
    }))
    startScore.value = config.startScore
    playToLast.value = config.playToLast
    endWithDouble.value = config.endWithDouble
    maxThrowsPerLeg.value = config.throwsPerLeg
    currentPlayerIndex.value = 0
    currentPlace.value = 1
    roundNumber.value = 1
    someoneWonInThisRound.value = false
    currentTurnThrows.value = []
    multiplier.value = 1
    isGameOver.value = false
    isGameStarted.value = true
    isProcessingTurn.value = false
    history.value = []
    bustModalVisible.value = false
    winModalData.value = null
    persistState()
  }

  function setMultiplier(m: number): void {
    multiplier.value = multiplier.value === m ? 1 : m
  }

  function throwToHistoryStr(playerThrow: Throw): string {
    if (playerThrow.multiplier == 2) {
      return `D${playerThrow.zone}`
    }
    if (playerThrow.multiplier == 3) {
      return `T${playerThrow.zone}`
    }
    return `${playerThrow.zone}`
  }

  function addScore(baseValue: number, zoneMultiplier?: number): void {
    if (currentTurnThrows.value.length >= maxThrowsPerLeg.value) return
    if (isGameOver.value || isProcessingTurn.value) return
    if (!currentPlayer.value || currentPlayer.value.isFinished) return

    if (baseValue == 50) {
      baseValue = 25
      zoneMultiplier = 2
    }

    currentTurnThrows.value.push({
      zone: baseValue,
      multiplier: zoneMultiplier ?? multiplier.value,
    })
    multiplier.value = 1

    if (currentTurnThrows.value.length === maxThrowsPerLeg.value) {
      isProcessingTurn.value = true
      setTimeout(() => finishTurn(), AUTO_FINISH_DELAY_MS)
    } else if (currentPlayer.value.score - currentTurnSum.value <= 0) {
      isProcessingTurn.value = true
      setTimeout(() => finishTurn(), AUTO_FINISH_DELAY_MS)
    }

    persistState()
  }

  function addPopularCombo(combo: readonly number[]): void {
    if (combo.length !== maxThrowsPerLeg.value) return
    if (isGameOver.value || isProcessingTurn.value) return
    if (!currentPlayer.value || currentPlayer.value.isFinished) return

    if (currentTurnThrows.value.length > 0) resetTurn()
    // Пресеты — это готовые значения бросков, множитель к ним не применяется.
    combo.forEach((value) => addScore(value, 1))
  }

  function finishTurn(): void {
    const player = currentPlayer.value
    if (!player) return

    const sum = currentTurnSum.value
    const prevScore = player.score
    if (
      (!endWithDouble.value && player.score - sum > 0) ||
      (endWithDouble.value && player.score - sum > 1)
    ) {
      player.score -= sum

      history.value.unshift({
        round: roundNumber.value,
        playerName: player.name,
        throws: [...currentTurnThrows.value.map((el) => throwToHistoryStr(el))],
        sum,
        remaining: player.score,
      })
      currentTurnThrows.value = []
      isProcessingTurn.value = false
      advanceToNextPlayer()
      return
    } else if (
      player.score - sum == 0 &&
      ((endWithDouble.value &&
        currentTurnThrows.value.filter((el) => el.zone).at(-1)?.multiplier ==
          2) ||
        !endWithDouble.value)
    ) {
      player.score -= sum

      history.value.unshift({
        round: roundNumber.value,
        playerName: player.name,
        throws: [...currentTurnThrows.value.map((el) => throwToHistoryStr(el))],
        sum,
        remaining: player.score,
      })

      player.isFinished = true
      player.place = currentPlace.value
      someoneWonInThisRound.value = true

      winModalData.value = { name: player.name, place: player.place }
      currentTurnThrows.value = []
      persistState()

      setTimeout(() => {
        winModalData.value = null
        isProcessingTurn.value = false
        advanceToNextPlayer()
      }, WIN_MODAL_DURATION_MS)
      return
    } else {
      history.value.unshift({
        round: roundNumber.value,
        playerName: player.name,
        throws: [...currentTurnThrows.value.map((el) => throwToHistoryStr(el))],
        sum: 'BUST',
        remaining: prevScore,
      })

      // bustModalVisible.value = true
      persistState()

      setTimeout(() => {
        bustModalVisible.value = false
        currentTurnThrows.value = []
        isProcessingTurn.value = false
        advanceToNextPlayer()
      }, BUST_MODAL_DURATION_MS)
    }
  }

  function advanceToNextPlayer(): void {
    const oldIdx = currentPlayerIndex.value
    const nextIdx = (oldIdx + 1) % players.value.length

    if (nextIdx <= oldIdx) {
      if (someoneWonInThisRound.value) {
        currentPlace.value++
        someoneWonInThisRound.value = false
      }
      roundNumber.value++

      const active = activePlayers.value
      if (!playToLast.value && active.length === 1) {
        active[0]!.isFinished = true
        active[0]!.place = currentPlace.value
        endGame()
        return
      }
    }

    currentPlayerIndex.value = nextIdx

    if (activePlayers.value.length === 0) {
      endGame()
      return
    }

    if (players.value[currentPlayerIndex.value]?.isFinished) {
      advanceToNextPlayer()
      return
    }

    persistState()
  }

  function undoLastLeg(): void {
    if (!history.value.length) return

    let prevLeg = history.value.shift()
    let prevPlayerIndex = players.value.findIndex(
      (el) => el.name == prevLeg!.playerName,
    )
    let thisRoundLeftHistory = history.value.filter(
      (el) => el.round == prevLeg!.round,
    )
    roundNumber.value = prevLeg!.round

    if (prevLeg?.sum == 'BUST') {
      currentPlayerIndex.value = prevPlayerIndex
      return
    }

    if (prevLeg?.remaining == 0) {
      players.value[prevPlayerIndex]!.isFinished = false
      players.value[prevPlayerIndex]!.place = null
      someoneWonInThisRound.value = !!thisRoundLeftHistory.find(
        (el) => el.remaining == 0,
      )
      if (!someoneWonInThisRound.value) {
        currentPlace.value--
      }
    }

    players.value[prevPlayerIndex]!.score += prevLeg!.sum
    currentPlayerIndex.value = prevPlayerIndex

    persistState()
  }

  function endGame(): void {
    isGameOver.value = true
    persistState()
  }

  function undoLastThrow(): void {
    if (isProcessingTurn.value) return
    currentTurnThrows.value.pop()
    persistState()
  }

  function resetTurn(): void {
    if (isProcessingTurn.value) return
    currentTurnThrows.value = []
    multiplier.value = 1
    persistState()
  }

  function rematch(): void {
    if (players.value.length === 0) return
    startGame({
      playerNames: players.value.map((p) => p.name),
      startScore: startScore.value,
      throwsPerLeg: maxThrowsPerLeg.value,
      playToLast: playToLast.value,
      endWithDouble: endWithDouble.value,
    })
  }

  function newGame(): void {
    localStorage.removeItem(STORAGE_KEY)
    players.value = []
    currentPlayerIndex.value = 0
    multiplier.value = 1
    currentTurnThrows.value = []
    currentPlace.value = 1
    someoneWonInThisRound.value = false
    roundNumber.value = 1
    isGameOver.value = false
    isGameStarted.value = false
    isProcessingTurn.value = false
    history.value = []
    bustModalVisible.value = false
    winModalData.value = null
  }

  // ─── Сохранение состояния

  function persistState(): void {
    const state: PersistedState = {
      players: players.value,
      currentPlayerIndex: currentPlayerIndex.value,
      currentTurnThrows: currentTurnThrows.value,
      currentPlace: currentPlace.value,
      someoneWonInThisRound: someoneWonInThisRound.value,
      roundNumber: roundNumber.value,
      isGameOver: isGameOver.value,
      isGameStarted: isGameStarted.value,
      history: history.value,
      playToLast: playToLast.value,
      startScore: startScore.value,
      endWithDouble: endWithDouble.value,
      maxThrowsPerLeg: maxThrowsPerLeg.value,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }

  function loadPersistedState(): boolean {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false

    try {
      const state: PersistedState = JSON.parse(raw)
      players.value = state.players
      currentPlayerIndex.value = state.currentPlayerIndex
      currentTurnThrows.value = state.currentTurnThrows
      currentPlace.value = state.currentPlace
      someoneWonInThisRound.value = state.someoneWonInThisRound
      roundNumber.value = state.roundNumber
      isGameOver.value = state.isGameOver
      isGameStarted.value = state.isGameStarted
      history.value = state.history ?? []
      playToLast.value = state.playToLast ?? true
      startScore.value = state.startScore ?? 301
      multiplier.value = 1
      isProcessingTurn.value = false
      endWithDouble.value = state.endWithDouble
      maxThrowsPerLeg.value = state.maxThrowsPerLeg

      // Перезагрузка при открытой модалке победы сбрасывает таймер перехода,
      // поэтому ход остался бы на уже финишировавшем игроке и addScore() отклонял бы все броски.
      // Повторяем этот переход.
      if (
        isGameStarted.value &&
        !isGameOver.value &&
        players.value.length > 0 &&
        currentPlayer.value?.isFinished
      ) {
        advanceToNextPlayer()
      }

      return true
    } catch {
      return false
    }
  }

  function bust(): void {
    addScore(currentPlayer.value!.score + 2, 1)
  }

  return {
    players,
    currentPlayerIndex,
    currentTurnThrows,
    currentPlace,
    roundNumber,
    isGameOver,
    isGameStarted,
    history,
    playToLast,
    startScore,
    multiplier,
    maxThrowsPerLeg,
    bustModalVisible,
    winModalData,
    isProcessingTurn,

    currentPlayer,
    activePlayers,
    currentTurnSum,
    currentRemaining,

    startGame,
    setMultiplier,
    bust,
    addScore,
    addPopularCombo,
    undoLastThrow,
    advanceToPrevLeg: undoLastLeg,
    resetTurn,
    rematch,
    newGame,
    loadPersistedState,
  }
})
