<script setup lang="ts">
import { ref, computed, provide, watch } from 'vue'
import { open, message } from '@tauri-apps/plugin-dialog'
import { writeFile, mkdir, exists } from '@tauri-apps/plugin-fs'
import { useSqlParser } from '../../composables/java-generator/useSqlParser'
import { useCodeGenerator } from '../../composables/java-generator/useCodeGenerator'
import type {
  TableDefinition,
  GeneratorConfig,
  GenerationResult,
  SqlParseResult,
} from '../../composables/java-generator/types'
import SqlInputPanel from './panels/SqlInputPanel.vue'
import TableStructurePanel from './panels/TableStructurePanel.vue'
import CodePreviewPanel from './panels/CodePreviewPanel.vue'
import ConfigPanel from './panels/ConfigPanel.vue'
import DirectoryPreview from './panels/DirectoryPreview.vue'

// 解析器和生成器
const { parseSql, validateSql } = useSqlParser()
const { generateCode, copyToClipboard, generateAllCode } = useCodeGenerator()

// 状态
const sqlInput = ref(`CREATE TABLE user (
  id bigint PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  username varchar(50) NOT NULL COMMENT '用户名',
  password varchar(100) NOT NULL COMMENT '密码',
  email varchar(100) COMMENT '邮箱',
  phone varchar(20) COMMENT '手机号',
  status tinyint DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  created_at datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE role (
  id bigint PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
  role_name varchar(50) NOT NULL COMMENT '角色名称',
  role_code varchar(50) NOT NULL COMMENT '角色编码',
  description varchar(200) COMMENT '描述',
  status tinyint DEFAULT 1 COMMENT '状态',
  created_at datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

CREATE TABLE user_role (
  id bigint PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  user_id bigint NOT NULL COMMENT '用户ID',
  role_id bigint NOT NULL COMMENT '角色ID',
  created_at datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';`)

const parseResult = ref<SqlParseResult | null>(null)
const generationResult = ref<GenerationResult | null>(null)
const selectedTable = ref<TableDefinition | null>(null)
const selectedFileIndex = ref(0)
const isGenerating = ref(false)

// 配置
const config = ref<GeneratorConfig>({
  packageName: 'com.example.demo',
  moduleName: 'system',
  author: 'Developer',
  dateType: 'LocalDateTime',
  ormType: 'mybatis-plus',
  swaggerVersion: 'swagger2',
  responseStyle: 'spring-blade',
  generations: ['entity', 'mapper', 'service', 'serviceImpl', 'controller', 'xml'],
  useLombok: true,
  useSwagger: true,
  useRestController: true,
  useBaseEntity: false,
  tablePrefix: '',
})

// 计算属性
const tables = computed(() => parseResult.value?.tables || [])
const errors = computed(() => parseResult.value?.errors || [])
const files = computed(() => generationResult.value?.files || [])
const directoryStructure = computed(() => generationResult.value?.directoryStructure || null)

// 提供给子组件的状态
provide('config', config)
provide('tables', tables)
provide('files', files)

// 解析 SQL
function handleParseSql() {
  const validationErrors = validateSql(sqlInput.value)
  if (validationErrors.some(e => e.severity === 'error')) {
    parseResult.value = {
      tables: [],
      relations: [],
      errors: validationErrors,
    }
    return
  }

  parseResult.value = parseSql(sqlInput.value)
  if (tables.value.length > 0) {
    selectedTable.value = tables.value[0]
    handleGenerate()
  }
}

// 生成代码
async function handleGenerate() {
  if (tables.value.length === 0) return

  isGenerating.value = true

  // 模拟生成延迟（实际应该很快）
  await new Promise(resolve => setTimeout(resolve, 300))

  generationResult.value = generateCode(tables.value, config.value)
  selectedFileIndex.value = 0

  isGenerating.value = false
}

// 复制单个文件
async function handleCopyFile(index: number) {
  const file = files.value[index]
  if (file) {
    await copyToClipboard(file.content)
  }
}

// 复制所有代码
async function handleCopyAll() {
  const allCode = generateAllCode(files.value)
  await copyToClipboard(allCode)
}

// 下载代码文件（按目录结构保存）
async function handleDownloadZip() {
  if (files.value.length === 0) return

  try {
    // 选择保存位置
    const selectedDir = await open({
      title: '选择保存位置',
      directory: true,
    })

    if (!selectedDir) return

    // 自动创建以模块名命名的目录
    const baseDir = `${selectedDir}/${config.value.moduleName}`
    await mkdir(baseDir, { recursive: true })

    const encoder = new TextEncoder()

    // 获取所有需要创建的子目录
    const dirs = new Set<string>()
    for (const file of files.value) {
      const dirPath = file.path.split('/').slice(0, -1).join('/')
      if (dirPath) {
        dirs.add(dirPath)
      }
    }

    // 创建子目录结构
    for (const dir of dirs) {
      const fullPath = `${baseDir}/${dir}`
      const dirExists = await exists(fullPath)
      if (!dirExists) {
        await mkdir(fullPath, { recursive: true })
      }
    }

    // 写入每个文件
    for (const file of files.value) {
      const filePath = `${baseDir}/${file.path}`
      const data = encoder.encode(file.content)
      await writeFile(filePath, data)
    }

    await message(`成功导出 ${files.value.length} 个文件到 ${config.value.moduleName} 目录！`, { title: 'Java 代码生成器' })
  } catch (e) {
    console.error('导出失败:', e)
    await message(`导出失败: ${String(e)}`, { title: '错误' })
  }
}

// 清空
function handleClear() {
  sqlInput.value = ''
  parseResult.value = null
  generationResult.value = null
  selectedTable.value = null
  selectedFileIndex.value = 0
}

// 加载示例
function handleLoadExample() {
  sqlInput.value = `CREATE TABLE user (
  id bigint PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
  username varchar(50) NOT NULL COMMENT '用户名',
  password varchar(100) NOT NULL COMMENT '密码',
  email varchar(100) COMMENT '邮箱',
  phone varchar(20) COMMENT '手机号',
  status tinyint DEFAULT 1 COMMENT '状态：0-禁用，1-启用',
  created_at datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

CREATE TABLE role (
  id bigint PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
  role_name varchar(50) NOT NULL COMMENT '角色名称',
  role_code varchar(50) NOT NULL COMMENT '角色编码',
  description varchar(200) COMMENT '描述',
  status tinyint DEFAULT 1 COMMENT '状态',
  created_at datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色表';

CREATE TABLE user_role (
  id bigint PRIMARY KEY AUTO_INCREMENT COMMENT 'ID',
  user_id bigint NOT NULL COMMENT '用户ID',
  role_id bigint NOT NULL COMMENT '角色ID',
  created_at datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户角色关联表';`
  handleParseSql()
}

// 监听配置变化，自动重新生成
watch(config, () => {
  if (tables.value.length > 0) {
    handleGenerate()
  }
}, { deep: true })

// 初始解析
handleParseSql()
</script>

<template>
  <div class="java-generator flex-1 flex flex-col overflow-hidden">
    <!-- 顶部工具栏 -->
    <div class="glass-bar flex items-center justify-between px-4 py-2 mb-2">
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-[#4F8CFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          <h2 class="text-sm font-semibold text-primary">Java 代码生成器</h2>
        </div>
        <span class="px-2 py-0.5 rounded-full text-[10px] bg-[#4F8CFF]/10 text-[#4F8CFF] font-medium">
          SQL → Java
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="btn btn-primary text-xs"
          @click="handleParseSql"
          :disabled="!sqlInput.trim()"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          解析 SQL
        </button>

        <button
          class="btn text-xs"
          @click="handleCopyAll"
          :disabled="files.length === 0"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          复制全部
        </button>

        <button
          class="btn text-xs"
          @click="handleDownloadZip"
          :disabled="files.length === 0"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          下载
        </button>

        <button
          class="btn text-xs"
          @click="handleClear"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          清空
        </button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="flex-1 flex gap-2 overflow-hidden">
      <!-- 左侧区域 -->
      <div class="flex flex-col gap-2 w-[45%] min-w-0">
        <!-- SQL 输入区 -->
        <div class="glass-card flex-1 flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium text-primary">SQL 输入</span>
              <button
                class="px-2 py-0.5 rounded text-[10px] bg-[#4F8CFF]/10 text-[#4F8CFF] hover:bg-[#4F8CFF]/20 transition-colors"
                @click="handleLoadExample"
              >
                加载示例
              </button>
            </div>
            <span class="text-[10px] text-tertiary">
              {{ tables.length }} 个表
            </span>
          </div>
          <SqlInputPanel
            v-model:sql="sqlInput"
            @parse="handleParseSql"
          />
        </div>

        <!-- 配置区 -->
        <div class="glass-card" style="max-height: 45%; overflow-y: auto;">
          <ConfigPanel v-model:config="config" />
        </div>
      </div>

      <!-- 右侧区域 -->
      <div class="flex flex-col gap-2 flex-1 min-w-0">
        <!-- 上方：表结构和目录预览 -->
        <div class="flex gap-2" style="max-height: 40%;">
          <!-- 表结构 -->
          <div class="glass-card flex-1 flex flex-col overflow-hidden">
            <div class="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <span class="text-xs font-medium text-primary">表结构</span>
              <span class="text-[10px] text-tertiary">{{ tables.length }} 个表</span>
            </div>
            <TableStructurePanel
              :tables="tables"
              :selected-table="selectedTable"
              @select="(t) => selectedTable = t"
            />
          </div>

          <!-- 目录预览 -->
          <div class="glass-card flex-1 flex flex-col overflow-hidden">
            <div class="flex items-center justify-between px-3 py-2 border-b border-white/10">
              <span class="text-xs font-medium text-primary">目录结构</span>
              <span class="text-[10px] text-tertiary">{{ files.length }} 个文件</span>
            </div>
            <DirectoryPreview :structure="directoryStructure" />
          </div>
        </div>

        <!-- 下方：代码预览 -->
        <div class="glass-card flex-1 flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span class="text-xs font-medium text-primary">代码预览</span>
            <div class="flex items-center gap-2">
              <span class="text-[10px] text-tertiary">
                {{ files[selectedFileIndex]?.name || '暂无代码' }}
              </span>
            </div>
          </div>
          <CodePreviewPanel
            :files="files"
            :selected-index="selectedFileIndex"
            :is-generating="isGenerating"
            @select="(i) => selectedFileIndex = i"
            @copy="handleCopyFile"
          />
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <Transition name="fade">
      <div
        v-if="errors.length > 0"
        class="fixed bottom-4 right-4 max-w-md glass-card p-3 border-l-4 border-[#EF4444]"
      >
        <div class="flex items-start gap-2">
          <svg class="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="text-xs font-medium text-primary">解析警告</p>
            <ul class="mt-1 space-y-0.5">
              <li v-for="(error, i) in errors" :key="i" class="text-[11px] text-secondary">
                {{ error.message }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
