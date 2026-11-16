<script setup lang="ts">
import { useI18n } from '@/shared/i18n/useI18n'
import SidePanel from '@/shared/components/SidePanel.vue'
import HelpSection from '@/shared/components/HelpSection.vue'
import { POPULAR_CHECKOUTS } from '../constants/dartboard'

const visible = defineModel<boolean>('visible', { required: true })
const { t } = useI18n()
</script>

<template>
  <SidePanel v-model:visible="visible" :title="t('help_title')">
    <HelpSection :title="t('help_h1')">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p class="small text-muted" v-html="t('help_p1')" />
    </HelpSection>
    <HelpSection :title="t('help_h2')">
      <p class="small text-muted">{{ t('help_p2') }}</p>
    </HelpSection>
    <HelpSection :title="t('help_h3')">
      <p class="small text-muted">{{ t('help_p3') }}</p>
    </HelpSection>
    <HelpSection :title="t('help_h4')">
      <p class="small text-muted">{{ t('help_p4') }}</p>
    </HelpSection>
    <HelpSection :title="t('help_h5')">
      <p class="small text-muted">{{ t('help_p5') }}</p>
    </HelpSection>

    <hr />
    <div class="alert alert-light border small">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <span v-html="t('help_tip')" />
    </div>

    <hr />
    <h6 class="mb-3">{{ t('help_checkouts_title') }}</h6>
    <div class="table-responsive">
      <table class="table table-sm table-striped border checkouts-table">
        <thead class="table-light">
          <tr>
            <th>{{ t('th_checkout_left') }}</th>
            <th>{{ t('th_checkout_comb') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in POPULAR_CHECKOUTS" :key="row.remaining">
            <td>{{ row.remaining }}</td>
            <td>
              {{ row.combination }}
              <template v-if="row.remaining === 170">
                ({{ t('checkout_max') }})
              </template>
            </td>
          </tr>
        </tbody>
      </table>
      <small class="text-muted">{{ t('help_checkouts_legend') }}</small>
    </div>
  </SidePanel>
</template>

<style scoped>
.checkouts-table {
  font-size: 0.8rem;
}
</style>
