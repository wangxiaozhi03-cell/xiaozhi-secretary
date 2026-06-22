<script setup lang="ts">
import AppearancePanel from "./panels/AppearancePanel.vue";
import AboutPanel from "./panels/AboutPanel.vue";

defineProps<{
  activeTab: string;
}>();
</script>

<template>
  <div class="settings-content flex-1 overflow-y-auto p-6">
    <Transition name="panel-fade" mode="out-in">
      <AppearancePanel v-if="activeTab === 'appearance'" key="appearance" />
      <AboutPanel v-else-if="activeTab === 'about'" key="about" />
    </Transition>
  </div>
</template>

<style scoped>
.settings-content {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.06) transparent;
}

.dark .settings-content {
  scrollbar-color: rgba(255, 255, 255, 0.08) transparent;
}

/* Panel transition */
.panel-fade-enter-active {
  transition: all 0.2s ease-out;
}
.panel-fade-leave-active {
  transition: all 0.15s ease-in;
}
.panel-fade-enter-from {
  opacity: 0;
  transform: translateX(8px);
}
.panel-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
