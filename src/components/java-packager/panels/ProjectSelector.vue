<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ProjectConfig, MavenModule } from '../../../composables/java-packager/types'

const props = defineProps<{
  projects: ProjectConfig[]
  currentProject: ProjectConfig | null
  modules: MavenModule[]
  leafModules: MavenModule[]
  selectedModules: MavenModule[]
  loadingModules: boolean
}>()

const emit = defineEmits<{
  selectProject: [project: ProjectConfig]
  toggleModule: [mod: MavenModule]
  clearSelection: []
  openSettings: []
}>()

// 搜索关键词
const searchQuery = ref('')

// 展开/折叠状态（按模块路径）
const expandedPaths = ref<Set<string>>(new Set())

// 过滤后的模块（模糊搜索）
const filteredModules = computed(() => {
  if (!searchQuery.value.trim()) return props.modules
  const query = searchQuery.value.toLowerCase()

  function filterModule(mod: MavenModule): MavenModule | null {
    // 检查当前模块名称是否匹配
    const nameMatch = mod.name.toLowerCase().includes(query)
    // 递归过滤子模块
    const filteredChildren = mod.children
      .map(c => filterModule(c))
      .filter((c): c is MavenModule => c !== null)

    // 如果名称匹配或有匹配的子模块，则保留
    if (nameMatch || filteredChildren.length > 0) {
      return { ...mod, children: filteredChildren }
    }
    return null
  }

  return props.modules
    .map(m => filterModule(m))
    .filter((m): m is MavenModule => m !== null)
})

function isExpanded(path: string): boolean {
  return expandedPaths.value.has(path)
}

function toggleExpand(path: string) {
  if (expandedPaths.value.has(path)) {
    expandedPaths.value.delete(path)
  } else {
    expandedPaths.value.add(path)
  }
}

function isSelected(path: string, selectedModules: MavenModule[]): boolean {
  return selectedModules.some(m => m.path === path)
}

/** 递归渲染树时，收集叶子节点路径 */
function getLeafPaths(mod: MavenModule): string[] {
  if (mod.children.length === 0) return [mod.path]
  return mod.children.flatMap(c => getLeafPaths(c))
}

/** 切换聚合模块 = 全选/取消其所有叶子 */
function toggleAggregator(mod: MavenModule, selectedModules: MavenModule[]) {
  const leafPaths = getLeafPaths(mod)
  const allSelected = leafPaths.every(p => selectedModules.some(m => m.path === p))
  // 通过逐个 toggle 来实现
  for (const lp of leafPaths) {
    const leaf = findLeaf(mod, lp)
    if (leaf) {
      const isCurrentlySelected = selectedModules.some(m => m.path === lp)
      if (allSelected && isCurrentlySelected) {
        emit('toggleModule', leaf)
      } else if (!allSelected && !isCurrentlySelected) {
        emit('toggleModule', leaf)
      }
    }
  }
}

function findLeaf(root: MavenModule, path: string): MavenModule | null {
  if (root.path === path) return root
  for (const c of root.children) {
    const found = findLeaf(c, path)
    if (found) return found
  }
  return null
}

/** 聚合模块的选中状态：none / partial / all */
function aggregatorCheckState(mod: MavenModule, selectedModules: MavenModule[]): 'none' | 'partial' | 'all' {
  const leafPaths = getLeafPaths(mod)
  const selectedCount = leafPaths.filter(p => selectedModules.some(m => m.path === p)).length
  if (selectedCount === 0) return 'none'
  if (selectedCount === leafPaths.length) return 'all'
  return 'partial'
}

function getModuleIcon(name: string): string {
  if (name.includes('gateway')) return 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z'
  if (name.includes('auth')) return 'M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z'
  if (name.includes('common')) return 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125'
  if (name.includes('admin') || name.includes('upms')) return 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
  if (name.includes('order')) return 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z'
  return 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5'
}
</script>

<template>
  <aside class="glass-card w-[300px] flex flex-col flex-shrink-0 overflow-hidden">
    <!-- 项目选择 -->
    <div class="px-4 pt-4 pb-2">
      <div class="flex items-center justify-between mb-2">
        <label class="text-[11px] font-medium text-tertiary uppercase tracking-wider">选择项目</label>
        <button
          class="text-[10px] text-blue-500 hover:text-blue-600 transition-colors"
          @click="emit('openSettings')"
        >
          管理
        </button>
      </div>

      <!-- 空状态 -->
      <div v-if="projects.length === 0" class="py-4 text-center">
        <button
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-medium bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
          @click="emit('openSettings')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          添加项目
        </button>
      </div>

      <div v-else class="mt-2 space-y-1.5">
        <button
          v-for="p in projects"
          :key="p.path"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left"
          :class="currentProject?.path === p.path
            ? 'bg-blue-500/10 text-blue-600 shadow-sm shadow-blue-500/5'
            : 'hover:bg-black/[0.03] text-secondary'"
          @click="emit('selectProject', p)"
        >
          <div
            class="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
            :class="currentProject?.path === p.path
              ? 'bg-blue-500 text-white'
              : 'bg-black/[0.05] text-tertiary'"
          >
            {{ p.name.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <div class="text-[13px] font-medium truncate">{{ p.name }}</div>
            <div class="text-[10px] text-tertiary truncate">{{ p.path }}</div>
          </div>
        </button>
      </div>
    </div>

    <!-- 分隔线 -->
    <div class="mx-4 my-2 h-px bg-black/[0.06] dark:bg-white/[0.08]" />

    <!-- 模块树 -->
    <div class="flex-1 overflow-y-auto px-3 pb-4">
      <div class="flex items-center justify-between mb-2 px-1">
        <label class="text-[11px] font-medium text-tertiary uppercase tracking-wider">模块列表</label>
        <div class="flex items-center gap-2">
          <span v-if="selectedModules.length" class="text-[10px] text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded-full">
            已选 {{ selectedModules.length }}
          </span>
          <button
            v-if="selectedModules.length"
            class="text-[10px] text-tertiary hover:text-red-500 transition-colors"
            @click="emit('clearSelection')"
          >
            清空
          </button>
          <span v-else-if="!loadingModules && leafModules.length" class="text-[10px] text-tertiary bg-black/[0.04] dark:bg-white/[0.06] px-1.5 py-0.5 rounded-full">
            {{ leafModules.length }}
          </span>
        </div>
      </div>

      <!-- 搜索框 -->
      <div v-if="currentProject && modules.length > 0" class="mb-2">
        <div class="relative">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            placeholder="搜索模块..."
            class="w-full h-7 pl-8 pr-2 rounded-lg bg-black/[0.04] dark:bg-white/[0.06] border border-transparent focus:border-blue-400/40 text-[12px] text-primary placeholder:text-tertiary/50 outline-none transition-all"
          />
          <button
            v-if="searchQuery"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-tertiary hover:text-secondary"
            @click="searchQuery = ''"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loadingModules" class="flex items-center justify-center py-8">
        <svg class="animate-spin w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>

      <!-- Empty state -->
      <div v-else-if="!currentProject" class="flex flex-col items-center justify-center py-8 text-tertiary">
        <svg class="w-8 h-8 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
        </svg>
        <span class="text-[12px]">请先选择项目</span>
      </div>

      <!-- Tree -->
      <div v-else class="space-y-0.5">
        <!-- 无搜索结果 -->
        <div v-if="searchQuery && filteredModules.length === 0" class="text-center py-4 text-tertiary text-[12px]">
          未找到匹配的模块
        </div>
        <template v-for="mod in filteredModules" :key="mod.path">
          <!-- 聚合模块（有子模块） -->
          <div v-if="mod.children.length > 0">
            <!-- 聚合模块标题行 -->
            <div class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg group">
              <!-- 展开/折叠箭头 -->
              <button
                class="w-4 h-4 flex items-center justify-center flex-shrink-0 text-tertiary hover:text-secondary transition-colors"
                @click="toggleExpand(mod.path)"
              >
                <svg
                  class="w-3 h-3 transition-transform duration-200"
                  :class="isExpanded(mod.path) ? 'rotate-90' : ''"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <!-- 聚合模块 checkbox -->
              <button
                class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                :class="aggregatorCheckState(mod, selectedModules) === 'all'
                  ? 'bg-blue-500 border-blue-500'
                  : aggregatorCheckState(mod, selectedModules) === 'partial'
                    ? 'bg-blue-500/50 border-blue-500'
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'"
                @click="toggleAggregator(mod, selectedModules)"
              >
                <svg v-if="aggregatorCheckState(mod, selectedModules) === 'all'" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else-if="aggregatorCheckState(mod, selectedModules) === 'partial'" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 12h14" />
                </svg>
              </button>
              <svg class="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              <span class="text-[12px] font-medium text-secondary truncate">{{ mod.name }}</span>
              <span class="text-[10px] text-tertiary ml-auto flex-shrink-0">{{ mod.children.length }}</span>
            </div>

            <!-- 子模块（叶子） -->
            <Transition name="expand">
              <div v-if="isExpanded(mod.path)" class="ml-5 space-y-0.5">
                <button
                  v-for="child in mod.children"
                  :key="child.path"
                  class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150 text-left group"
                  :class="isSelected(child.path, selectedModules)
                    ? 'bg-blue-500/10 text-blue-600'
                    : 'hover:bg-black/[0.03] text-secondary'"
                  @click="emit('toggleModule', child)"
                >
                  <!-- Checkbox -->
                  <div
                    class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
                    :class="isSelected(child.path, selectedModules)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'"
                  >
                    <svg v-if="isSelected(child.path, selectedModules)" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <svg
                    class="w-3.5 h-3.5 flex-shrink-0 transition-colors"
                    :class="isSelected(child.path, selectedModules) ? 'text-blue-500' : 'text-tertiary group-hover:text-blue-400'"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="getModuleIcon(child.name)" />
                  </svg>
                  <span class="text-[12px] truncate">{{ child.name }}</span>
                </button>
              </div>
            </Transition>
          </div>

          <!-- 叶子模块（无子模块，直接是可部署的） -->
          <button
            v-else
            class="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150 text-left group"
            :class="isSelected(mod.path, selectedModules)
              ? 'bg-blue-500/10 text-blue-600'
              : 'hover:bg-black/[0.03] text-secondary'"
            @click="emit('toggleModule', mod)"
          >
            <!-- Checkbox -->
            <div
              class="w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all"
              :class="isSelected(mod.path, selectedModules)
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-400'"
            >
              <svg v-if="isSelected(mod.path, selectedModules)" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <svg
              class="w-3.5 h-3.5 flex-shrink-0 transition-colors ml-[18px]"
              :class="isSelected(mod.path, selectedModules) ? 'text-blue-500' : 'text-tertiary group-hover:text-blue-400'"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="getModuleIcon(mod.name)" />
            </svg>
            <span class="text-[12px] truncate">{{ mod.name }}</span>
          </button>
        </template>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.2s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>
