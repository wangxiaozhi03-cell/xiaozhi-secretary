<script setup lang="ts">
import type { GeneratorConfig, GenerationType, OrmType, DateType, SwaggerVersion, ResponseStyle } from '../../../composables/java-generator/types'

const props = defineProps<{
  config: GeneratorConfig
}>()

const emit = defineEmits<{
  'update:config': [config: GeneratorConfig]
}>()

// 更新配置
function updateConfig(key: keyof GeneratorConfig, value: any) {
  emit('update:config', {
    ...props.config,
    [key]: value,
  })
}

// 切换生成内容
function toggleGeneration(type: GenerationType) {
  const generations = [...props.config.generations]
  const index = generations.indexOf(type)

  if (index === -1) {
    generations.push(type)
  } else {
    generations.splice(index, 1)
  }

  updateConfig('generations', generations)
}

// ORM 选项
const ormOptions: { value: OrmType; label: string; desc: string }[] = [
  { value: 'mybatis-plus', label: 'MyBatis-Plus', desc: '推荐，功能强大' },
  { value: 'mybatis', label: 'MyBatis', desc: '经典，灵活可控' },
  { value: 'jpa', label: 'JPA', desc: '预留，即将支持' },
]

// 日期类型选项
const dateOptions: { value: DateType; label: string }[] = [
  { value: 'LocalDateTime', label: 'LocalDateTime (Java 8+)' },
  { value: 'Date', label: 'java.util.Date' },
]

// Swagger 版本选项
const swaggerOptions: { value: SwaggerVersion; label: string; desc: string }[] = [
  { value: 'swagger2', label: 'Swagger 2', desc: '@ApiModel, @ApiModelProperty' },
  { value: 'swagger3', label: 'Swagger 3', desc: '@Schema (OpenAPI 3)' },
  { value: 'knife4j', label: 'Knife4j', desc: '增强版 Swagger' },
]

// 返回格式选项
const responseStyleOptions: { value: ResponseStyle; label: string; desc: string }[] = [
  { value: 'spring-blade', label: 'Spring Blade', desc: 'R.data() 返回数据' },
  { value: 'pigx', label: 'PigX', desc: 'R.ok() 返回数据' },
  { value: 'spring-boot', label: 'Spring Boot', desc: 'ResponseEntity 返回' },
]

// 生成内容选项
const generationOptions: { type: GenerationType; label: string; icon: string }[] = [
  { type: 'entity', label: 'Entity', icon: '实体类' },
  { type: 'mapper', label: 'Mapper', icon: '数据访问层' },
  { type: 'service', label: 'Service', icon: '服务接口' },
  { type: 'serviceImpl', label: 'ServiceImpl', icon: '服务实现' },
  { type: 'controller', label: 'Controller', icon: '控制器' },
  { type: 'xml', label: 'Mapper XML', icon: 'MyBatis XML' },
  { type: 'dto', label: 'DTO', icon: '数据传输对象' },
]
</script>

<template>
  <div class="config-panel p-3 space-y-4">
    <!-- 标题 -->
    <div class="flex items-center gap-2">
      <svg class="w-4 h-4 text-[#4F8CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <span class="text-xs font-semibold text-primary">生成配置</span>
    </div>

    <!-- 基础配置 -->
    <div class="space-y-2.5">
      <h4 class="text-[10px] font-medium text-tertiary uppercase tracking-wider">基础配置</h4>

      <!-- 包名 -->
      <div class="space-y-1">
        <label class="text-[11px] text-secondary">包名 (Package)</label>
        <input
          type="text"
          :value="config.packageName"
          @input="updateConfig('packageName', ($event.target as HTMLInputElement).value)"
          class="w-full px-2.5 py-1.5 rounded-lg text-xs bg-black/[0.04] dark:bg-black/40 border border-white/20 focus:border-[#4F8CFF]/50 focus:ring-2 focus:ring-[#4F8CFF]/20 outline-none transition-all"
          placeholder="com.example.demo"
        />
      </div>

      <!-- 模块名 -->
      <div class="space-y-1">
        <label class="text-[11px] text-secondary">模块名</label>
        <input
          type="text"
          :value="config.moduleName"
          @input="updateConfig('moduleName', ($event.target as HTMLInputElement).value)"
          class="w-full px-2.5 py-1.5 rounded-lg text-xs bg-black/[0.04] dark:bg-black/40 border border-white/20 focus:border-[#4F8CFF]/50 focus:ring-2 focus:ring-[#4F8CFF]/20 outline-none transition-all"
          placeholder="system"
        />
      </div>

      <!-- 作者 -->
      <div class="space-y-1">
        <label class="text-[11px] text-secondary">作者 (Author)</label>
        <input
          type="text"
          :value="config.author"
          @input="updateConfig('author', ($event.target as HTMLInputElement).value)"
          class="w-full px-2.5 py-1.5 rounded-lg text-xs bg-black/[0.04] dark:bg-black/40 border border-white/20 focus:border-[#4F8CFF]/50 focus:ring-2 focus:ring-[#4F8CFF]/20 outline-none transition-all"
          placeholder="Developer"
        />
      </div>

      <!-- 表前缀 -->
      <div class="space-y-1">
        <label class="text-[11px] text-secondary">表前缀 (可选)</label>
        <input
          type="text"
          :value="config.tablePrefix"
          @input="updateConfig('tablePrefix', ($event.target as HTMLInputElement).value)"
          class="w-full px-2.5 py-1.5 rounded-lg text-xs bg-black/[0.04] dark:bg-black/40 border border-white/20 focus:border-[#4F8CFF]/50 focus:ring-2 focus:ring-[#4F8CFF]/20 outline-none transition-all"
          placeholder="t_ / sys_"
        />
      </div>
    </div>

    <!-- ORM 选择 -->
    <div class="space-y-2">
      <h4 class="text-[10px] font-medium text-tertiary uppercase tracking-wider">ORM 框架</h4>

      <div class="space-y-1.5">
        <button
          v-for="option in ormOptions"
          :key="option.value"
          class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all"
          :class="[
            config.ormType === option.value
              ? 'bg-[#4F8CFF]/10 border border-[#4F8CFF]/30'
              : 'bg-black/[0.03] dark:bg-black/20 border border-white/20 hover:border-white/40',
            option.value === 'jpa' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          ]"
          :disabled="option.value === 'jpa'"
          @click="updateConfig('ormType', option.value)"
        >
          <div
            class="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
            :class="config.ormType === option.value
              ? 'border-[#4F8CFF] bg-[#4F8CFF]'
              : 'border-gray-300 dark:border-gray-600'"
          >
            <div v-if="config.ormType === option.value" class="w-1.5 h-1.5 rounded-full bg-[#E0E5ED]" />
          </div>
          <div>
            <span class="text-xs font-medium text-primary">{{ option.label }}</span>
            <span class="text-[10px] text-tertiary ml-1.5">{{ option.desc }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- 日期类型 -->
    <div class="space-y-2">
      <h4 class="text-[10px] font-medium text-tertiary uppercase tracking-wider">日期类型</h4>

      <div class="flex gap-2">
        <button
          v-for="option in dateOptions"
          :key="option.value"
          class="flex-1 px-2.5 py-1.5 rounded-lg text-xs text-center transition-all"
          :class="config.dateType === option.value
            ? 'bg-[#4F8CFF]/10 border border-[#4F8CFF]/30 text-[#4F8CFF] font-medium'
            : 'bg-black/[0.03] dark:bg-black/20 border border-white/20 text-secondary hover:border-white/40'"
          @click="updateConfig('dateType', option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Swagger 版本 -->
    <div class="space-y-2">
      <h4 class="text-[10px] font-medium text-tertiary uppercase tracking-wider">Swagger 版本</h4>

      <div class="space-y-1.5">
        <button
          v-for="option in swaggerOptions"
          :key="option.value"
          class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all"
          :class="config.swaggerVersion === option.value
            ? 'bg-[#4F8CFF]/10 border border-[#4F8CFF]/30'
            : 'bg-black/[0.03] dark:bg-black/20 border border-white/20 hover:border-white/40'"
          @click="updateConfig('swaggerVersion', option.value)"
        >
          <div
            class="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
            :class="config.swaggerVersion === option.value
              ? 'border-[#4F8CFF] bg-[#4F8CFF]'
              : 'border-gray-300 dark:border-gray-600'"
          >
            <div v-if="config.swaggerVersion === option.value" class="w-1.5 h-1.5 rounded-full bg-[#E0E5ED]" />
          </div>
          <div>
            <span class="text-xs font-medium text-primary">{{ option.label }}</span>
            <span class="text-[10px] text-tertiary ml-1.5">{{ option.desc }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- 返回格式 -->
    <div class="space-y-2">
      <h4 class="text-[10px] font-medium text-tertiary uppercase tracking-wider">Controller 返回格式</h4>

      <div class="space-y-1.5">
        <button
          v-for="option in responseStyleOptions"
          :key="option.value"
          class="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all"
          :class="config.responseStyle === option.value
            ? 'bg-[#4F8CFF]/10 border border-[#4F8CFF]/30'
            : 'bg-black/[0.03] dark:bg-black/20 border border-white/20 hover:border-white/40'"
          @click="updateConfig('responseStyle', option.value)"
        >
          <div
            class="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
            :class="config.responseStyle === option.value
              ? 'border-[#4F8CFF] bg-[#4F8CFF]'
              : 'border-gray-300 dark:border-gray-600'"
          >
            <div v-if="config.responseStyle === option.value" class="w-1.5 h-1.5 rounded-full bg-[#E0E5ED]" />
          </div>
          <div>
            <span class="text-xs font-medium text-primary">{{ option.label }}</span>
            <span class="text-[10px] text-tertiary ml-1.5">{{ option.desc }}</span>
          </div>
        </button>
      </div>
    </div>

    <!-- 生成内容 -->
    <div class="space-y-2">
      <h4 class="text-[10px] font-medium text-tertiary uppercase tracking-wider">生成内容</h4>

      <div class="grid grid-cols-2 gap-1.5">
        <button
          v-for="option in generationOptions"
          :key="option.type"
          class="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all"
          :class="config.generations.includes(option.type)
            ? 'bg-[#4F8CFF]/10 border border-[#4F8CFF]/30'
            : 'bg-black/[0.03] dark:bg-black/20 border border-white/20 hover:border-white/40'"
          @click="toggleGeneration(option.type)"
        >
          <div
            class="w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 transition-all"
            :class="config.generations.includes(option.type)
              ? 'border-[#4F8CFF] bg-[#4F8CFF]'
              : 'border-gray-300 dark:border-gray-600'"
          >
            <svg
              v-if="config.generations.includes(option.type)"
              class="w-2.5 h-2.5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span class="text-[11px] text-primary">{{ option.label }}</span>
        </button>
      </div>
    </div>

    <!-- 高级选项 -->
    <div class="space-y-2">
      <h4 class="text-[10px] font-medium text-tertiary uppercase tracking-wider">高级选项</h4>

      <div class="space-y-1.5">
        <!-- Lombok -->
        <label class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
          <div
            class="relative w-8 h-4.5 rounded-full transition-colors cursor-pointer"
            :class="config.useLombok ? 'bg-[#4F8CFF]' : 'bg-gray-300 dark:bg-gray-600'"
            @click="updateConfig('useLombok', !config.useLombok)"
          >
            <div
              class="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white/80 dark:bg-white/20 shadow-sm transition-transform"
              :class="config.useLombok ? 'translate-x-3.5' : 'translate-x-0'"
            />
          </div>
          <div>
            <span class="text-xs text-primary">Lombok</span>
            <span class="text-[10px] text-tertiary ml-1">@Data, @Getter, @Setter</span>
          </div>
        </label>

        <!-- Swagger -->
        <label class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
          <div
            class="relative w-8 h-4.5 rounded-full transition-colors cursor-pointer"
            :class="config.useSwagger ? 'bg-[#4F8CFF]' : 'bg-gray-300 dark:bg-gray-600'"
            @click="updateConfig('useSwagger', !config.useSwagger)"
          >
            <div
              class="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white/80 dark:bg-white/20 shadow-sm transition-transform"
              :class="config.useSwagger ? 'translate-x-3.5' : 'translate-x-0'"
            />
          </div>
          <div>
            <span class="text-xs text-primary">Swagger</span>
            <span class="text-[10px] text-tertiary ml-1">@Api, @ApiOperation</span>
          </div>
        </label>

        <!-- REST 风格 -->
        <label class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
          <div
            class="relative w-8 h-4.5 rounded-full transition-colors cursor-pointer"
            :class="config.useRestController ? 'bg-[#4F8CFF]' : 'bg-gray-300 dark:bg-gray-600'"
            @click="updateConfig('useRestController', !config.useRestController)"
          >
            <div
              class="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white/80 dark:bg-white/20 shadow-sm transition-transform"
              :class="config.useRestController ? 'translate-x-3.5' : 'translate-x-0'"
            />
          </div>
          <div>
            <span class="text-xs text-primary">REST 风格</span>
            <span class="text-[10px] text-tertiary ml-1">@RestController</span>
          </div>
        </label>

        <!-- BaseEntity -->
        <label class="flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
          <div
            class="relative w-8 h-4.5 rounded-full transition-colors cursor-pointer"
            :class="config.useBaseEntity ? 'bg-[#4F8CFF]' : 'bg-gray-300 dark:bg-gray-600'"
            @click="updateConfig('useBaseEntity', !config.useBaseEntity)"
          >
            <div
              class="absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-white/80 dark:bg-white/20 shadow-sm transition-transform"
              :class="config.useBaseEntity ? 'translate-x-3.5' : 'translate-x-0'"
            />
          </div>
          <div>
            <span class="text-xs text-primary">BaseEntity</span>
            <span class="text-[10px] text-tertiary ml-1">继承基础实体类</span>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.config-panel {
  /* 自定义滚动条 */
}

.config-panel::-webkit-scrollbar {
  width: 4px;
}

.config-panel::-webkit-scrollbar-track {
  background: transparent;
}

.config-panel::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.dark .config-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}
</style>
