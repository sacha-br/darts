<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import GameRulesSummary from '@/features/game/components/GameRulesSummary.vue'
import { PLACE_POINTS } from '@/features/matches/domain/placePoints'
import { useI18n } from '@/shared/i18n/useI18n'
import SidePanel from '@/shared/components/SidePanel.vue'
import HelpSection from '@/shared/components/HelpSection.vue'
import { useTournamentStore } from '../stores/tournamentStore'
import {
  MAX_PLANNED_MATCHES,
  MIN_PLANNED_MATCHES,
  MIN_TOURNAMENT_PARTICIPANTS,
} from '../domain/tournament'

const visible = defineModel<boolean>('visible', { required: true })

const route = useRoute()
const store = useTournamentStore()
const { t } = useI18n()

/** Панель рендерится раскладкой вне `RouterView`, поэтому турнир берётся из параметров маршрута. */
const tournament = computed(() => {
  const id = route.params.tournamentId
  return typeof id === 'string' ? store.getById(id) : undefined
})

const pointsHint = computed(() =>
  t('standings_points_hint', {
    scale: PLACE_POINTS.map((points, index) =>
      t('standings_points_scale_item', { place: index + 1, points }),
    ).join(', '),
  }),
)
</script>

<template>
  <SidePanel v-model:visible="visible" :title="t('tournament_guide_title')">
    <section v-if="tournament" class="alert alert-light border mb-4">
      <h6 class="fw-bold mb-2">{{ t('tournament_guide_current_title', { name: tournament.name }) }}</h6>
      <dl class="row mb-0 small">
        <dt class="col-8 fw-normal text-muted">{{ t('label_planned_matches') }}</dt>
        <dd class="col-4 mb-1 fw-bold text-end">{{ tournament.plannedMatches }}</dd>
      </dl>
      <GameRulesSummary :rules="tournament.rules" />
    </section>

    <HelpSection :title="t('tournament_guide_h_setup')">
      <p class="small text-muted">
        {{ t('tournament_guide_p_setup', { min: MIN_PLANNED_MATCHES, max: MAX_PLANNED_MATCHES }) }}
      </p>
    </HelpSection>
    <HelpSection :title="t('tournament_guide_h_participants')">
      <p class="small text-muted">
        {{ t('tournament_guide_p_participants', { min: MIN_TOURNAMENT_PARTICIPANTS }) }}
      </p>
    </HelpSection>
    <HelpSection :title="t('tournament_guide_h_matches')">
      <p class="small text-muted">{{ t('tournament_guide_p_matches') }}</p>
    </HelpSection>
    <HelpSection :title="t('tournament_guide_h_result')">
      <p class="small text-muted">
        {{ t('tournament_guide_p_result', { button: t('btn_save_result') }) }}
      </p>
    </HelpSection>
    <HelpSection :title="t('tournament_guide_h_standings')">
      <p class="small text-muted mb-2">{{ pointsHint }}</p>
      <p class="small text-muted">{{ t('tournament_guide_p_standings') }}</p>
    </HelpSection>
    <HelpSection :title="t('tournament_guide_h_finish')">
      <p class="small text-muted">
        {{
          t('tournament_guide_p_finish', {
            draft: t('tournament_status_draft'),
            active: t('tournament_status_active'),
            finished: t('tournament_status_finished'),
          })
        }}
      </p>
    </HelpSection>
  </SidePanel>
</template>
