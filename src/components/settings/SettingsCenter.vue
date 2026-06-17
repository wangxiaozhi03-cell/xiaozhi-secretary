<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import SettingsMenu from "./SettingsMenu.vue";
import SettingsContent from "./SettingsContent.vue";

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const activeTab = ref("appearance");

// ESC key handler
function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && props.visible) {
    emit("close");
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<template>
  <Teleport to="body">
    <Transition name="settings-overlay">
      <div
        v-if="visible"
        class="fixed inset-0 z-[100] flex items-center justify-center"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm"
          @click="emit('close')"
        />

        <!-- Settings Modal -->
        <div class="settings-modal relative flex overflow-hidden">
          <!-- Header -->
          <div class="settings-header absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 h-14">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <h2 class="text-[15px] font-semibold text-primary">设置中心</h2>
                <p class="text-[11px] text-tertiary">个性化你的开发工具体验</p>
              </div>
            </div>
            <button class="btn-icon" @click="emit('close')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="settings-body flex flex-1 overflow-hidden mt-14">
            <!-- Left Menu -->
            <SettingsMenu :active-tab="activeTab" @select="activeTab = $event" />

            <!-- Right Content -->
            <SettingsContent :active-tab="activeTab" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.settings-modal {
  width: 820px;
  height: 560px;
  min-width: 720px;
  min-height: 500px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(30px) saturate(150%);
  -webkit-backdrop-filter: blur(30px) saturate(150%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  animation: floatIn 0.3s ease-out;
}

.dark .settings-modal {
  background: rgba(30, 38, 50, 0.85);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.settings-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.dark .settings-header {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

/* Overlay transition */
.settings-overlay-enter-active {
  transition: opacity 0.3s ease;
}
.settings-overlay-leave-active {
  transition: opacity 0.2s ease;
}
.settings-overlay-enter-from,
.settings-overlay-leave-to {
  opacity: 0;
}

@keyframes floatIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
