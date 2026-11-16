<script setup lang="ts">
defineProps<{
  title: string
}>()

defineSlots<{
  default(): unknown
}>()
</script>

<template>
  <section class="mb-4">
    <h6 class="help-heading">{{ title }}</h6>
    <slot />
  </section>
</template>

<style scoped>
.help-heading {
  color: #0aa2c0;
  border-left: 3px solid #0aa2c0;
  padding-left: 8px;
}
</style>
