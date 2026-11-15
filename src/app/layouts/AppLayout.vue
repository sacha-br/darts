<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import PlayerGuidePanel from '@/features/game/components/PlayerGuidePanel.vue'
import TournamentRulesPanel from '@/features/tournament/components/TournamentRulesPanel.vue'

const route = useRoute()

const helpTopic = computed(() => route.meta.help ?? null)
const helpVisible = shallowRef(false)

watch(helpTopic, () => {
  helpVisible.value = false
})
</script>

<template>
  <div class="container py-2">
    <AppHeader :help-topic="helpTopic" @toggle-help="helpVisible = !helpVisible" />

    <RouterView />

    <PlayerGuidePanel v-if="helpTopic === 'player'" v-model:visible="helpVisible" />
    <TournamentRulesPanel v-else-if="helpTopic === 'tournament'" v-model:visible="helpVisible" />
  </div>
</template>
