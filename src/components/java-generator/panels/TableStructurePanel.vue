<script setup lang="ts">
import type { TableDefinition } from '../../../composables/java-generator/types'

defineProps<{
  tables: TableDefinition[]
  selectedTable: TableDefinition | null
}>()

const emit = defineEmits<{
  select: [table: TableDefinition]
}>()

// 获取字段类型颜色
function getTypeColor(type: string): string {
  const lowerType = type.toLowerCase()
  if (['bigint', 'int', 'integer', 'smallint', 'tinyint', 'mediumint'].includes(lowerType)) {
    return 'text-[#4F8CFF]'
  }
  if (['varchar', 'char', 'text', 'tinytext', 'mediumtext', 'longtext'].includes(lowerType)) {
    return 'text-[#22C55E]'
  }
  if (['datetime', 'timestamp', 'date', 'time'].includes(lowerType)) {
    return 'text-[#F59E0B]'
  }
  if (['decimal', 'numeric', 'float', 'double'].includes(lowerType)) {
    return 'text-[#A78BFA]'
  }
  if (['boolean', 'bool'].includes(lowerType)) {
    return 'text-[#EC4899]'
  }
  return 'text-secondary'
}

// 格式化字段类型显示
function formatFieldType(field: { type: string; length?: number; scale?: number }): string {
  let type = field.type.toUpperCase()
  if (field.length) {
    type += `(${field.length}${field.scale ? `, ${field.scale}` : ''})`
  }
  return type
}
</script>

<template>
  <div class="table-structure-panel flex-1 overflow-y-auto">
    <div v-if="tables.length === 0" class="flex flex-col items-center justify-center h-full text-tertiary">
      <svg class="w-10 h-10 mb-2 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <p class="text-xs">暂无表结构</p>
      <p class="text-[10px] mt-1">请先解析 SQL</p>
    </div>

    <div v-else class="p-2 space-y-1">
      <div
        v-for="table in tables"
        :key="table.name"
        class="rounded-lg overflow-hidden transition-all duration-200"
        :class="[
          selectedTable?.name === table.name
            ? 'ring-2 ring-[#4F8CFF]/30 bg-[#4F8CFF]/5'
            : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
        ]"
      >
        <!-- 表头 -->
        <button
          class="w-full flex items-center gap-2 px-2.5 py-2 text-left"
          @click="emit('select', table)"
        >
          <svg
            class="w-4 h-4 flex-shrink-0 transition-transform duration-200"
            :class="selectedTable?.name === table.name ? 'text-[#4F8CFF] rotate-90' : 'text-tertiary'"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium text-primary truncate">{{ table.name }}</span>
              <span class="px-1.5 py-0.5 rounded text-[9px] bg-[#4F8CFF]/10 text-[#4F8CFF]">
                {{ table.fields.length }} 字段
              </span>
            </div>
            <p v-if="table.comment" class="text-[10px] text-tertiary truncate mt-0.5">
              {{ table.comment }}
            </p>
          </div>
        </button>

        <!-- 字段列表 -->
        <Transition name="expand">
          <div
            v-if="selectedTable?.name === table.name"
            class="border-t border-white/10"
          >
            <div class="max-h-[200px] overflow-y-auto">
              <table class="w-full text-[11px]">
                <thead>
                  <tr class="text-tertiary bg-black/[0.02] dark:bg-white/[0.02]">
                    <th class="text-left py-1.5 px-2.5 font-medium">字段名</th>
                    <th class="text-left py-1.5 px-2 font-medium">类型</th>
                    <th class="text-center py-1.5 px-2 font-medium">可空</th>
                    <th class="text-center py-1.5 px-2 font-medium">主键</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="field in table.fields"
                    :key="field.name"
                    class="border-t border-white/5 hover:bg-white/30 dark:hover:bg-white/[0.02]"
                  >
                    <td class="py-1.5 px-2.5">
                      <div class="flex items-center gap-1.5">
                        <span v-if="field.isPrimary" class="text-[#F59E0B]">
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                          </svg>
                        </span>
                        <span class="font-mono text-primary">{{ field.name }}</span>
                      </div>
                    </td>
                    <td class="py-1.5 px-2">
                      <span class="font-mono" :class="getTypeColor(field.type)">
                        {{ formatFieldType(field) }}
                      </span>
                    </td>
                    <td class="py-1.5 px-2 text-center">
                      <span
                        class="inline-block w-4 h-4 rounded-full text-[9px] leading-4 text-center"
                        :class="field.nullable ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'"
                      >
                        {{ field.nullable ? '✓' : '✗' }}
                      </span>
                    </td>
                    <td class="py-1.5 px-2 text-center">
                      <span
                        v-if="field.isPrimary"
                        class="inline-block w-4 h-4 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] text-[9px] leading-4 text-center"
                      >
                        K
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 表信息 -->
            <div class="px-2.5 py-2 bg-black/[0.02] dark:bg-white/[0.02] border-t border-white/5">
              <div class="flex flex-wrap gap-2 text-[10px] text-tertiary">
                <span v-if="table.comment">📝 {{ table.comment }}</span>
                <span>📊 {{ table.fields.length }} 个字段</span>
                <span v-if="table.foreignKeys?.length">
                  🔗 {{ table.foreignKeys.length }} 个外键
                </span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
.expand-enter-active {
  transition: all 0.3s ease-out;
  max-height: 300px;
}

.expand-leave-active {
  transition: all 0.2s ease-in;
  max-height: 300px;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

/* 自定义滚动条 */
.table-structure-panel::-webkit-scrollbar {
  width: 4px;
}

.table-structure-panel::-webkit-scrollbar-track {
  background: transparent;
}

.table-structure-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.dark .table-structure-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>
