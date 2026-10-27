<script setup lang="ts">
import { shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import type { GameRules } from '@/features/game/domain/types'
import { useI18n } from '@/shared/i18n/useI18n'
import { RouteName } from '@/shared/router/routeNames'
import PageHeader from '@/shared/components/PageHeader.vue'
import { useTournamentStore } from '../stores/tournamentStore'
import TournamentCreateForm from '../components/TournamentCreateForm.vue'

const store = useTournamentStore()
const router = useRouter()
const { t } = useI18n()

const submitting = shallowRef(false)

async function onSubmit(input: { name: string; rules: GameRules }): Promise<void> {
  submitting.value = true
  try {
    const tournament = await store.create(input)
    await router.replace({
      name: RouteName.TournamentDetails,
      params: { tournamentId: tournament.id },
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="tournament-create mx-auto">
    <PageHeader :title="t('tournament_create_title')" />
    <TournamentCreateForm :submitting="submitting" @submit="onSubmit" />
  </div>
</template>

<style scoped>
.tournament-create {
  max-width: 500px;
}
</style>
