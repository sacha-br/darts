<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '@/features/game/stores/gameStore'
import GameArena from '@/features/game/components/GameArena.vue'
import RemoteControlPanel from '@/features/remote/components/RemoteControlPanel.vue'
import { useRemoteHost } from '@/features/remote/composables/useRemoteHost'
import { RouteName } from '@/shared/router/routeNames'
import { useTournamentStore } from '../stores/tournamentStore'
import TournamentMatchBanner from '../components/TournamentMatchBanner.vue'
import TournamentResultPanel from '../components/TournamentResultPanel.vue'

const props = defineProps<{
  tournamentId: string
  matchId: string
}>()

const store = useTournamentStore()
const game = useGameStore()
const router = useRouter()

useRemoteHost()

const tournament = computed(() => store.getById(props.tournamentId))
const match = computed(() => tournament.value?.matches.find((m) => m.id === props.matchId))

const saving = shallowRef(false)

const detailsLocation = computed(() => ({
  name: RouteName.TournamentDetails,
  params: { tournamentId: props.tournamentId },
}))

watch(
  () => game.isGameStarted,
  (started) => {
    if (!started) void router.replace(detailsLocation.value)
  },
)

async function onSaveResult(): Promise<void> {
  const current = match.value
  if (!current || saving.value) return

  saving.value = true
  try {
    // Игроки в партии создаются в порядке lineup, поэтому место берётся по индексу.
    const results = current.lineup.map((participantId, index) => ({
      participantId,
      place: game.players[index]?.place ?? null,
    }))
    await store.recordMatchResult(props.tournamentId, current.id, results)
    await router.replace(detailsLocation.value)
    game.newGame()
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <TournamentMatchBanner
    v-if="tournament && match"
    :tournament-id="tournamentId"
    :tournament-name="tournament.name"
    :match-number="match.number"
  />

  <GameArena>
    <template #game-over>
      <TournamentResultPanel :saving="saving" @save="onSaveResult" />
    </template>
  </GameArena>

  <RemoteControlPanel />
</template>
