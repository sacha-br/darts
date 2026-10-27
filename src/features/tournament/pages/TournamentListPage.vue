<script setup lang="ts">
import { useI18n } from '@/shared/i18n/useI18n'
import { RouteName } from '@/shared/router/routeNames'
import PageHeader from '@/shared/components/PageHeader.vue'
import SkeletonCard from '@/shared/components/SkeletonCard.vue'
import { useTournamentStore } from '../stores/tournamentStore'
import TournamentList from '../components/TournamentList.vue'

const store = useTournamentStore()
const { t } = useI18n()
</script>

<template>
  <div>
    <div class="d-flex justify-content-between align-items-start gap-2">
      <PageHeader :title="t('menu_tournament')" />
      <RouterLink :to="{ name: RouteName.TournamentCreate }" class="btn btn-primary">
        {{ t('btn_create_tournament') }}
      </RouterLink>
    </div>

    <div class="row g-3">
      <div class="col-lg-8">
        <TournamentList :tournaments="store.sortedTournaments" />
      </div>
      <div class="col-lg-4 d-grid gap-3 align-content-start">
        <SkeletonCard :title="t('tournament_section_champion')" :lines="2" />
        <SkeletonCard :title="t('tournament_section_stats')" :lines="4" />
      </div>
    </div>
  </div>
</template>
