<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useI18n } from '@/shared/i18n/useI18n'
import type { TournamentParticipant } from '../domain/types'
import { validateParticipantName } from '../domain/tournament'

const props = defineProps<{
  participants: TournamentParticipant[]
  locked: boolean
}>()

const emit = defineEmits<{
  add: [name: string]
  remove: [participantId: string]
}>()

const { t } = useI18n()

const name = shallowRef('')
const isDirty = shallowRef(false)

const error = computed(() => validateParticipantName(props.participants, name.value))

const errorText = computed(() => {
  if (!isDirty.value || !error.value) return ''
  return error.value === 'duplicate'
    ? t('participant_error_duplicate')
    : t('participant_error_empty')
})

function onAdd(): void {
  isDirty.value = true
  if (error.value) return
  emit('add', name.value.trim())
  name.value = ''
  isDirty.value = false
}
</script>

<template>
  <section class="card shadow-sm border-0">
    <div class="card-header bg-white fw-bold d-flex justify-content-between">
      <span>{{ t('tournament_participants_title') }}</span>
      <span class="text-muted">{{ participants.length }}</span>
    </div>

    <ul v-if="participants.length > 0" class="list-group list-group-flush">
      <li
        v-for="(participant, index) in participants"
        :key="participant.id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <span>
          <span class="text-muted me-2">{{ index + 1 }}.</span>{{ participant.name }}
        </span>
        <button
          v-if="!locked"
          type="button"
          class="btn btn-sm btn-outline-danger"
          :aria-label="t('btn_remove')"
          @click="emit('remove', participant.id)"
        >
          ✕
        </button>
      </li>
    </ul>

    <div class="card-body">
      <p v-if="locked" class="small text-muted mb-0">{{ t('participants_locked') }}</p>

      <form v-else @submit.prevent="onAdd">
        <p v-if="participants.length < 2" class="small text-muted">
          {{ t('participants_empty') }}
        </p>
        <div class="input-group has-validation">
          <input
            v-model="name"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': errorText }"
            :placeholder="t('placeholder_participant_name')"
            maxlength="40"
            @input="isDirty = false"
          />
          <button type="submit" class="btn btn-outline-primary">
            {{ t('btn_add') }}
          </button>
          <div class="invalid-feedback">{{ errorText }}</div>
        </div>
      </form>
    </div>
  </section>
</template>
