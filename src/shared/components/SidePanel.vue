<script setup lang="ts">
defineProps<{
  title: string
}>()

defineSlots<{
  default(): unknown
}>()

const visible = defineModel<boolean>('visible', { required: true })

function close(): void {
  visible.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sidebar">
      <div v-if="visible" class="sidebar-backdrop" @click.self="close">
        <div class="sidebar-panel" role="dialog" aria-modal="true" :aria-label="title">
          <div class="sidebar-header">
            <h5 class="mb-0">{{ title }}</h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              aria-label="Close"
              @click="close"
            />
          </div>

          <div class="sidebar-body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1045;
  background: rgba(0, 0, 0, 0.4);
}

.sidebar-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 360px;
  max-width: 90vw;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: #0dcaf0;
  color: #fff;
}

.sidebar-body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
}

@media (min-width: 576px) {
  .sidebar-panel {
    width: 400px;
  }
}

/* Анимация выезда */
.sidebar-enter-active {
  transition: opacity 0.3s ease;
}

.sidebar-leave-active {
  transition: opacity 0.25s ease;
}

.sidebar-enter-active .sidebar-panel {
  transition: transform 0.3s ease;
}

.sidebar-leave-active .sidebar-panel {
  transition: transform 0.25s ease;
}

.sidebar-enter-from {
  opacity: 0;
}

.sidebar-enter-from .sidebar-panel {
  transform: translateX(100%);
}

.sidebar-leave-to {
  opacity: 0;
}

.sidebar-leave-to .sidebar-panel {
  transform: translateX(100%);
}
</style>
