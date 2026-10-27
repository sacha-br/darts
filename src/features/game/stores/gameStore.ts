import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import type {
  DartThrow,
  GameSetupConfig,
  MatchContext,
  Player,
  TurnRecord,
} from '../domain/types'
import { BUST, CASUAL_CONTEXT } from '../domain/types'
import { createThrow, turnScore } from '../domain/throws'
import { evaluateTurn } from '../domain/turn'
import {
  AUTO_FINISH_DELAY_MS,
  BUST_MODAL_DURATION_MS,
  DEFAULT_GAME_RULES,
  WIN_MODAL_DURATION_MS,
} from '../constants/rules'
import {
  clearGameState,
  loadGameState,
  saveGameState,
  type GameStateSnapshot,
} from '../storage/gameStateStorage'

export const useGameStore = defineStore('game', () => {
  // ─── Основное состояние
  const players = ref<Player[]>([])
  const currentPlayerIndex = shallowRef(0)
  const currentTurnThrows = ref<DartThrow[]>([])
  const currentPlace = shallowRef(1)
  const someoneWonInThisRound = shallowRef(false)
  const roundNumber = shallowRef(1)
  const isGameOver = shallowRef(false)
  const isGameStarted = shallowRef(false)
  const history = ref<TurnRecord[]>([])
  const playToLast = shallowRef(DEFAULT_GAME_RULES.playToLast)
  const endWithDouble = shallowRef(DEFAULT_GAME_RULES.endWithDouble)
  const startScore = shallowRef(DEFAULT_GAME_RULES.startScore)
  const dartsPerTurn = shallowRef(DEFAULT_GAME_RULES.dartsPerTurn)
  const context = shallowRef<MatchContext>(CASUAL_CONTEXT)

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

  const currentTurnSum = computed(() => turnScore(currentTurnThrows.value))

  const currentRemaining = computed(() => {
    if (!currentPlayer.value) return 0
    return currentPlayer.value.score - currentTurnSum.value
  })

  // ─── Действия

  function startGame(
    config: GameSetupConfig,
    matchContext: MatchContext = CASUAL_CONTEXT,
  ): void {
    context.value = matchContext
    players.value = config.playerNames.map((name) => ({
      name,
      score: config.startScore,
      isFinished: false,
      place: null,
    }))
    startScore.value = config.startScore
    playToLast.value = config.playToLast
    endWithDouble.value = config.endWithDouble
    dartsPerTurn.value = config.dartsPerTurn
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

  function addScore(baseValue: number, zoneMultiplier?: number): void {
    if (currentTurnThrows.value.length >= dartsPerTurn.value) return
    if (isGameOver.value || isProcessingTurn.value) return
    if (!currentPlayer.value || currentPlayer.value.isFinished) return

    currentTurnThrows.value.push(
      createThrow(baseValue, zoneMultiplier ?? multiplier.value),
    )
    multiplier.value = 1

    if (currentTurnThrows.value.length === dartsPerTurn.value) {
      isProcessingTurn.value = true
      setTimeout(() => finishTurn(), AUTO_FINISH_DELAY_MS)
    } else if (currentPlayer.value.score - currentTurnSum.value <= 0) {
      isProcessingTurn.value = true
      setTimeout(() => finishTurn(), AUTO_FINISH_DELAY_MS)
    }

    persistState()
  }

  function addPopularCombo(combo: readonly number[]): void {
    if (combo.length !== dartsPerTurn.value) return
    if (isGameOver.value || isProcessingTurn.value) return
    if (!currentPlayer.value || currentPlayer.value.isFinished) return

    if (currentTurnThrows.value.length > 0) resetTurn()
    // Пресеты — это готовые значения бросков, множитель к ним не применяется.
    combo.forEach((value) => addScore(value, 1))
  }

  function recordTurn(player: Player, sum: TurnRecord['sum'], remaining: number): void {
    history.value.unshift({
      round: roundNumber.value,
      playerName: player.name,
      throws: currentTurnThrows.value.map((dart) => ({ ...dart })),
      sum,
      remaining,
    })
  }

  function finishTurn(): void {
    const player = currentPlayer.value
    if (!player) return

    const sum = currentTurnSum.value
    const outcome = evaluateTurn(
      player.score,
      currentTurnThrows.value,
      endWithDouble.value,
    )

    if (outcome === 'scored') {
      player.score -= sum
      recordTurn(player, sum, player.score)
      currentTurnThrows.value = []
      isProcessingTurn.value = false
      advanceToNextPlayer()
      return
    }

    if (outcome === 'checkout') {
      player.score -= sum
      recordTurn(player, sum, player.score)

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
    }

    recordTurn(player, BUST, player.score)

    // bustModalVisible.value = true
    persistState()

    setTimeout(() => {
      bustModalVisible.value = false
      currentTurnThrows.value = []
      isProcessingTurn.value = false
      advanceToNextPlayer()
    }, BUST_MODAL_DURATION_MS)
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

  function undoLastTurn(): void {
    const lastTurn = history.value.shift()
    if (!lastTurn) return

    const prevPlayerIndex = players.value.findIndex(
      (el) => el.name == lastTurn.playerName,
    )
    const thisRoundLeftHistory = history.value.filter(
      (el) => el.round == lastTurn.round,
    )
    roundNumber.value = lastTurn.round

    if (lastTurn.sum === BUST) {
      currentPlayerIndex.value = prevPlayerIndex
      return
    }

    if (lastTurn.remaining == 0) {
      players.value[prevPlayerIndex]!.isFinished = false
      players.value[prevPlayerIndex]!.place = null
      someoneWonInThisRound.value = !!thisRoundLeftHistory.find(
        (el) => el.remaining == 0,
      )
      if (!someoneWonInThisRound.value) {
        currentPlace.value--
      }
    }

    players.value[prevPlayerIndex]!.score += lastTurn.sum
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
      dartsPerTurn: dartsPerTurn.value,
      playToLast: playToLast.value,
      endWithDouble: endWithDouble.value,
    })
  }

  function newGame(): void {
    clearGameState()
    context.value = CASUAL_CONTEXT
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

  function bust(): void {
    addScore(currentPlayer.value!.score + 2, 1)
  }

  // ─── Сохранение состояния

  function persistState(): void {
    const state: GameStateSnapshot = {
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
      dartsPerTurn: dartsPerTurn.value,
      context: context.value,
    }
    saveGameState(state)
  }

  function hydrate(): void {
    const state = loadGameState()
    if (!state) return

    players.value = state.players
    currentPlayerIndex.value = state.currentPlayerIndex
    currentTurnThrows.value = state.currentTurnThrows
    currentPlace.value = state.currentPlace
    someoneWonInThisRound.value = state.someoneWonInThisRound
    roundNumber.value = state.roundNumber
    isGameOver.value = state.isGameOver
    isGameStarted.value = state.isGameStarted
    history.value = state.history
    playToLast.value = state.playToLast
    startScore.value = state.startScore
    endWithDouble.value = state.endWithDouble
    dartsPerTurn.value = state.dartsPerTurn
    context.value = state.context
    multiplier.value = 1
    isProcessingTurn.value = false

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
  }

  hydrate()

  return {
    players,
    currentPlayerIndex,
    currentTurnThrows,
    currentPlace,
    someoneWonInThisRound,
    roundNumber,
    isGameOver,
    isGameStarted,
    history,
    playToLast,
    startScore,
    endWithDouble,
    multiplier,
    dartsPerTurn,
    context,
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
    undoLastTurn,
    resetTurn,
    rematch,
    newGame,
  }
})
