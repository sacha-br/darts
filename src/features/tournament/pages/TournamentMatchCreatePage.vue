<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import GameRulesSummary from '@/features/game/components/GameRulesSummary.vue'
import { useI18n } from '@/shared/i18n/useI18n'
import { RouteName } from '@/shared/router/routeNames'
import PageHeader from '@/shared/components/PageHeader.vue'
import { useTournamentStore } from '../stores/tournamentStore'
import { useTournamentMatchLauncher } from '../composables/useTournamentMatchLauncher'
import MatchLineupEditor from '../components/MatchLineupEditor.vue'

const props = defineProps<{
  tournamentId: string
}>()

const store = useTournamentStore()
const launcher = useTournamentMatchLauncher()
const { t } = useI18n()

const tournament = computed(() => store.getById(props.tournamentId))

const lineup = ref<string[]>(tournament.value?.participants.map((p) => p.id) ?? [])
const starting = shallowRef(false)

async function onStart(): Promise<void> {
  if (starting.value || !launcher.confirmReplaceActiveGame()) return
  starting.value = true
  try {
    const match = await store.createMatch(props.tournamentId, lineup.value)
    const current = store.getById(props.tournamentId)
    if (current) await launcher.play(current, match)
  } finally {
    starting.value = false
  }
}
</script>

<template>
  <div v-if="tournament" class="match-create mx-auto">
    <RouterLink
      :to="{ name: RouteName.TournamentDetails, params: { tournamentId } }"
      class="small text-decoration-none"
    >
      {{ t('nav_tournament') }}
    </RouterLink>

    <PageHeader
      class="mt-1"
      :title="t('tournament_match_create_title')"
      :subtitle="tournament.name"
    />

    <div class="d-grid gap-3">
      <MatchLineupEditor v-model="lineup" :participants="tournament.participants" />

      <section class="card shadow-sm border-0">
        <div class="card-header bg-white fw-bold">{{ t('tournament_rules_title') }}</div>
        <div class="card-body">
          <GameRulesSummary :rules="tournament.rules" />
        </div>
      </section>

      <button type="button" class="btn btn-primary btn-lg" :disabled="starting" @click="onStart">
        {{ t('btn_start_match') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.match-create {
  max-width: 500px;
}
</style>
