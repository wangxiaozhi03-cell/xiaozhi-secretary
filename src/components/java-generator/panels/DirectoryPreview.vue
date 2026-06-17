<script setup lang="ts">
import { ref, computed } from 'vue'
import type { DirectoryNode, GenerationType } from '../../../composables/java-generator/types'

const props = defineProps<{
  structure: DirectoryNode | null
}>()

// 展开的目录
const expandedDirs = ref<Set<string>>(new Set())

// 初始化展开状态
function initExpandedDirs(node: DirectoryNode, path: string = '') {
  const fullPath = path ? `${path}/${node.name}` : node.name
  if (node.type === 'directory') {
    expandedDirs.value.add(fullPath)
    node.children?.forEach((child: DirectoryNode) => initExpandedDirs(child, fullPath))
  }
}

// 监听结构变化
if (props.structure) {
  initExpandedDirs(props.structure)
}

// 切换展开状态
function toggleExpand(path: string) {
  if (expandedDirs.value.has(path)) {
    expandedDirs.value.delete(path)
  } else {
    expandedDirs.value.add(path)
  }
}

// 获取文件类型图标颜色
function getFileTypeColor(type?: GenerationType): string {
  const colors: Record<GenerationType, string> = {
    entity: 'text-[#4F8CFF]',
    mapper: 'text-[#22C55E]',
    service: 'text-[#F59E0B]',
    serviceImpl: 'text-[#F59E0B]',
    controller: 'text-[#A78BFA]',
    xml: 'text-[#EC4899]',
    dto: 'text-[#6366F1]',
  }
  return type ? colors[type] || 'text-secondary' : 'text-secondary'
}

// 获取文件类型图标
function getFileTypeIcon(type?: GenerationType): string {
  const icons: Record<GenerationType, string> = {
    entity: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    mapper: 'M4 6h16M4 10h16M4 14h16M4 18h16',
    service: 'M13 10V3L4 14h7v7l9-11h-7z',
    serviceImpl: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
    controller: 'M5 12h14M12 5l7 7-7 7',
    xml: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z',
    dto: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  }
  return type ? icons[type] || 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' : 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
}

// 渲染目录树
function renderTree(node: DirectoryNode, path: string = '', depth: number = 0): any {
  const fullPath = path ? `${path}/${node.name}` : node.name
  const isExpanded = expandedDirs.value.has(fullPath)

  return {
    ...node,
    fullPath,
    depth,
    isExpanded,
    children: node.children?.map((child: DirectoryNode) => renderTree(child, fullPath, depth + 1)),
  }
}

const treeData = computed(() => {
  if (!props.structure) return null
  return renderTree(props.structure)
})
</script>

<template>
  <div class="directory-preview flex-1 overflow-y-auto p-2">
    <!-- 空状态 -->
    <div v-if="!structure" class="flex flex-col items-center justify-center h-full text-tertiary">
      <svg class="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <p class="text-xs">暂无目录结构</p>
      <p class="text-[10px] mt-1">请先解析 SQL</p>
    </div>

    <!-- 目录树 -->
    <div v-else-if="treeData" class="font-mono text-[11px]">
      <!-- 根节点 -->
      <div class="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
        <svg
          class="w-3 h-3 text-[#F59E0B] flex-shrink-0 transition-transform duration-200"
          :class="treeData.isExpanded ? 'rotate-90' : ''"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          @click="toggleExpand(treeData.fullPath)"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <svg class="w-4 h-4 text-[#F59E0B] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <span class="text-primary font-medium">{{ treeData.name }}</span>
      </div>

      <!-- 子节点 -->
      <Transition name="expand">
        <div v-if="treeData.isExpanded" class="ml-3">
          <template v-for="child in treeData.children" :key="child.fullPath">
            <!-- 目录 -->
            <div v-if="child.type === 'directory'">
              <div
                class="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-black/[0.02] dark:hover:bg-white/[0.02] cursor-pointer"
                @click="toggleExpand(child.fullPath)"
              >
                <svg
                  class="w-3 h-3 text-[#4F8CFF] flex-shrink-0 transition-transform duration-200"
                  :class="child.isExpanded ? 'rotate-90' : ''"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
                <svg class="w-4 h-4 text-[#4F8CFF] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span class="text-secondary">{{ child.name }}</span>
                <span class="text-[9px] text-tertiary ml-1">
                  {{ child.children?.length || 0 }} 个文件
                </span>
              </div>

              <!-- 目录子项 -->
              <Transition name="expand">
                <div v-if="child.isExpanded" class="ml-4">
                  <div
                    v-for="file in child.children"
                    :key="file.fullPath"
                    class="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
                  >
                    <span class="w-3 flex-shrink-0" />
                    <svg
                      class="w-4 h-4 flex-shrink-0"
                      :class="getFileTypeColor(file.fileType)"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        :d="getFileTypeIcon(file.fileType)" />
                    </svg>
                    <span class="text-primary truncate">{{ file.name }}</span>
                  </div>
                </div>
              </Transition>
            </div>

            <!-- 文件（根目录下的文件） -->
            <div
              v-else
              class="flex items-center gap-1.5 py-1 px-1 rounded hover:bg-black/[0.02] dark:hover:bg-white/[0.02]"
            >
              <span class="w-3 flex-shrink-0" />
              <svg
                class="w-4 h-4 flex-shrink-0"
                :class="getFileTypeColor(child.fileType)"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  :d="getFileTypeIcon(child.fileType)" />
              </svg>
              <span class="text-primary">{{ child.name }}</span>
            </div>
          </template>
        </div>
      </Transition>
    </div>

    <!-- 统计信息 -->
    <div v-if="structure" class="mt-3 pt-2 border-t border-white/10">
      <div class="flex flex-wrap gap-2 text-[10px] text-tertiary">
        <span>📁 {{ structure.children?.length || 0 }} 个目录</span>
        <span>📄 {{ countFiles(structure) }} 个文件</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// 计算文件数量
function countFiles(node: DirectoryNode): number {
  let count = 0
  if (node.type === 'file') {
    return 1
  }
  if (node.children) {
    for (const child of node.children) {
      count += countFiles(child)
    }
  }
  return count
}
</script>

<style scoped>
.expand-enter-active {
  transition: all 0.3s ease-out;
}

.expand-leave-active {
  transition: all 0.2s ease-in;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

/* 自定义滚动条 */
.directory-preview::-webkit-scrollbar {
  width: 4px;
}

.directory-preview::-webkit-scrollbar-track {
  background: transparent;
}

.directory-preview::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.dark .directory-preview::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>
