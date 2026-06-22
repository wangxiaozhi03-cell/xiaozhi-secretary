import { ref, watch, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import type { MavenModule, BuildStatus, BuildScope, ProjectConfig, SshServer, MavenConfig, ScanResult, BuildLogEvent, BuildDoneEvent } from './types'

const PROJECTS_KEY = 'java-packager-projects'
const SERVERS_KEY = 'java-packager-servers'
const MAVEN_CONFIG_KEY = 'java-packager-maven-config'

function loadProjects(): ProjectConfig[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveProjects(v: ProjectConfig[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(v))
}

function loadServers(): SshServer[] {
  try {
    const raw = localStorage.getItem(SERVERS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveServers(v: SshServer[]) {
  localStorage.setItem(SERVERS_KEY, JSON.stringify(v))
}

function loadMavenConfig(): MavenConfig {
  try {
    const raw = localStorage.getItem(MAVEN_CONFIG_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { customPath: '', javaHome: '' }
}

function saveMavenConfig(v: MavenConfig) {
  localStorage.setItem(MAVEN_CONFIG_KEY, JSON.stringify(v))
}

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function useMavenBuilder() {
  // ── 数据 ──
  const projects = ref<ProjectConfig[]>(loadProjects())
  const servers = ref<SshServer[]>(loadServers())
  const mavenConfig = ref<MavenConfig>(loadMavenConfig())
  const currentProject = ref<ProjectConfig | null>(null)
  const modules = ref<MavenModule[]>([])
  const leafModules = ref<MavenModule[]>([])
  const selectedModules = ref<MavenModule[]>([])
  const selectedProfile = ref('')
  const skipTests = ref(true)
  const extraArgs = ref('')
  const buildStatus = ref<BuildStatus>('idle')
  const buildLogs = ref<string[]>([])
  const mavenVersion = ref('')
  const loadingModules = ref(false)
  const outputDir = ref('')
  const buildDuration = ref(0)
  const buildScope = ref<BuildScope>('with-deps')
  const autoUpload = ref(false)
  const showSettings = ref(false)
  const settingsTab = ref<'projects' | 'servers' | 'maven'>('projects')

  // 扫描结果
  const mavenScanResults = ref<ScanResult[]>([])
  const jdkScanResults = ref<ScanResult[]>([])
  const scanning = ref(false)

  // 选中的上传服务器 ID
  const selectedServerIds = ref<string[]>([])

  let copiedFilePaths: string[] = []
  let unlistenLog: (() => void) | null = null
  let unlistenDone: (() => void) | null = null

  // 持久化（防抖：500ms 内只保存一次）
  let saveTimer: ReturnType<typeof setTimeout> | null = null
  function debouncedSave() {
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      saveProjects(projects.value)
      saveServers(servers.value)
      saveMavenConfig(mavenConfig.value)
    }, 500)
  }
  watch(projects, debouncedSave, { deep: true })
  watch(servers, debouncedSave, { deep: true })
  watch(mavenConfig, debouncedSave, { deep: true })

  // 当前选中的上传服务器
  const activeServers = computed(() =>
    servers.value.filter(s => selectedServerIds.value.includes(s.id))
  )

  // ── Maven ──
  async function checkMaven() {
    try {
      mavenVersion.value = await invoke<string>('check_maven_available', {
        customPath: mavenConfig.value.customPath || null,
        javaHome: mavenConfig.value.javaHome || null,
      })
      return true
    } catch {
      mavenVersion.value = ''
      return false
    }
  }

  // 更新 Maven 配置并重新检查
  async function updateMavenConfig(config: MavenConfig) {
    mavenConfig.value = config
    // 保存后重新检查 Maven 是否可用
    await checkMaven()
  }

  // 扫描系统中的 Maven 和 JDK 安装
  async function scanInstallations() {
    scanning.value = true
    try {
      const [mavenResults, jdkResults] = await Promise.all([
        invoke<ScanResult[]>('scan_maven_installations'),
        invoke<ScanResult[]>('scan_jdk_installations'),
      ])
      mavenScanResults.value = mavenResults
      jdkScanResults.value = jdkResults
    } catch (e) {
      console.error('扫描失败:', e)
    } finally {
      scanning.value = false
    }
  }

  // 选择扫描结果
  function selectMavenPath(path: string) {
    mavenConfig.value.customPath = path
  }

  function selectJavaHome(path: string) {
    mavenConfig.value.javaHome = path
  }

  // ── SSH 服务器 CRUD ──
  function addServer(data: Omit<SshServer, 'id'>) {
    servers.value.push({ ...data, id: genId() })
  }

  function updateServer(id: string, data: Omit<SshServer, 'id'>) {
    const idx = servers.value.findIndex(s => s.id === id)
    if (idx >= 0) servers.value[idx] = { ...data, id }
  }

  function removeServer(id: string) {
    servers.value = servers.value.filter(s => s.id !== id)
    selectedServerIds.value = selectedServerIds.value.filter(sid => sid !== id)
  }

  // ── 服务器导入导出 ──
  async function exportServers() {
    if (servers.value.length === 0) return
    const { save, message } = await import('@tauri-apps/plugin-dialog')
    try {
      const filePath = await save({
        title: '导出服务器配置',
        defaultPath: 'servers.json',
        filters: [{ name: 'JSON', extensions: ['json'] }],
      })
      if (!filePath) return
      const exportData = servers.value.map(({ id, ...rest }) => rest)
      const { writeTextFile } = await import('@tauri-apps/plugin-fs')
      await writeTextFile(filePath, JSON.stringify(exportData, null, 2))
      await message(`已导出 ${exportData.length} 个服务器配置`, { title: '导出成功' })
    } catch (e) {
      console.error('导出服务器配置失败:', e)
      await message(`导出失败: ${String(e)}`, { title: '错误' })
    }
  }

  async function importServers() {
    const { open, message } = await import('@tauri-apps/plugin-dialog')
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'JSON', extensions: ['json'] }],
        title: '导入服务器配置',
      })
      if (!selected || typeof selected !== 'string') return
      const { readTextFile } = await import('@tauri-apps/plugin-fs')
      const content = await readTextFile(selected)
      const parsed = JSON.parse(content)
      const arr = Array.isArray(parsed) ? parsed : [parsed]
      let count = 0
      for (const item of arr) {
        if (!item.host || !item.name) continue
        servers.value.push({
          id: genId(),
          name: item.name || '',
          host: item.host || '',
          port: item.port || 22,
          username: item.username || 'root',
          password: item.password || '',
          remotePath: item.remotePath || '',
        })
        count++
      }
      await message(`成功导入 ${count} 个服务器配置`, { title: '导入成功' })
    } catch (e) {
      console.error('导入服务器配置失败:', e)
      await message(`导入失败: ${String(e)}`, { title: '错误' })
    }
  }

  // ── 项目 CRUD ──
  function addProject(data: ProjectConfig) {
    projects.value.push(data)
  }

  function removeProject(index: number) {
    const removed = projects.value[index]
    projects.value.splice(index, 1)
    if (currentProject.value?.path === removed.path) {
      currentProject.value = null
      selectedModules.value = []
      modules.value = []
      leafModules.value = []
      selectedServerIds.value = []
    }
  }

  function updateProject(index: number, data: ProjectConfig) {
    const oldPath = projects.value[index].path
    projects.value[index] = data
    if (currentProject.value?.path === oldPath) {
      currentProject.value = data
    }
  }

  // ── 模块 ──
  async function selectProject(project: ProjectConfig) {
    currentProject.value = project
    selectedProfile.value = project.defaultProfile
    selectedModules.value = []
    buildLogs.value = []
    buildStatus.value = 'idle'
    // 不默认选中服务器，让用户手动选择
    selectedServerIds.value = []
    await loadModules()
  }

  async function loadModules() {
    if (!currentProject.value) return
    loadingModules.value = true
    try {
      const [tree, leaves] = await Promise.all([
        invoke<MavenModule[]>('list_maven_modules', { projectPath: currentProject.value.path }),
        invoke<MavenModule[]>('list_maven_leaf_modules', { projectPath: currentProject.value.path }),
      ])
      modules.value = tree
      leafModules.value = leaves
    } catch (e) {
      console.error('加载模块失败:', e)
      modules.value = []
      leafModules.value = []
    } finally {
      loadingModules.value = false
    }
  }

  function toggleModule(mod: MavenModule) {
    const idx = selectedModules.value.findIndex(m => m.path === mod.path)
    if (idx >= 0) {
      selectedModules.value.splice(idx, 1)
    } else {
      selectedModules.value.push(mod)
    }
  }

  function clearSelection() {
    selectedModules.value = []
  }

  function setOutputDir(dir: string) {
    outputDir.value = dir
  }

  function toggleServer(id: string) {
    if (!id) {
      // 选择"不上传"时清空
      selectedServerIds.value = []
    } else {
      // 单选模式：直接设置
      selectedServerIds.value = [id]
    }
  }

  // ── 上传 ──
  async function upload() {
    const targets = activeServers.value
    if (targets.length === 0 || copiedFilePaths.length === 0) {
      buildLogs.value.push('⚠️ 没有可上传的文件或未选择服务器')
      return
    }

    // 清理旧的监听器
    if (unlistenLog) unlistenLog()
    if (unlistenDone) unlistenDone()

    // 注册日志监听器
    unlistenLog = await listen<BuildLogEvent>('build-log', (event) => {
      const { line } = event.payload
      buildLogs.value.push(line)
      if (buildLogs.value.length > 2000) {
        buildLogs.value = buildLogs.value.slice(-1500)
      }
    })

    buildStatus.value = 'building'

    // 注册上传完成监听器（等待所有服务器上传完成）
    let uploadDoneResolve: (() => void) | null = null
    const uploadDonePromise = new Promise<void>((resolve) => {
      uploadDoneResolve = resolve
    })

    let pendingUploads = targets.length
    unlistenDone = await listen<BuildDoneEvent>('upload-done', () => {
      pendingUploads--
      if (pendingUploads <= 0) {
        uploadDoneResolve?.()
      }
    })

    for (const server of targets) {
      buildLogs.value.push('')
      buildLogs.value.push(`📤 上传到 ${server.name} (${server.username}@${server.host}:${server.remotePath})`)

      try {
        await invoke('upload_to_server', {
          localPaths: copiedFilePaths,
          host: server.host,
          port: server.port,
          username: server.username,
          password: server.password || null,
          remotePath: server.remotePath,
        })
      } catch (e) {
        buildLogs.value.push(`❌ 上传到 ${server.name} 失败: ${e}`)
        pendingUploads--
      }
    }

    // 等待上传完成（设置超时防止永久等待）
    await Promise.race([
      uploadDonePromise,
      new Promise(resolve => setTimeout(resolve, 300000)), // 5分钟超时
    ])

    // 清理监听器
    if (unlistenLog) { unlistenLog(); unlistenLog = null }
    if (unlistenDone) { unlistenDone(); unlistenDone = null }
    buildStatus.value = 'success'
  }

  // ── 构建 ──
  async function build() {
    if (!currentProject.value || selectedModules.value.length === 0) return

    buildStatus.value = 'building'
    buildLogs.value = []
    buildDuration.value = 0
    copiedFilePaths = []

    if (unlistenLog) unlistenLog()
    if (unlistenDone) unlistenDone()

    // 获取选中模块的路径，用于过滤 JAR
    const selectedModulePaths = selectedModules.value.map(m => m.path)

    unlistenLog = await listen<BuildLogEvent>('build-log', (event) => {
      const { line } = event.payload
      buildLogs.value.push(line)

      // 从 Maven 日志中提取 JAR 原始路径
      const jarMatch = line.match(/\[INFO\] Building jar: (.+\.jar)/)
      if (jarMatch) {
        const jarPath = jarMatch[1]
        // 只复制属于选中模块的 JAR 文件
        const belongsToSelectedModule = selectedModulePaths.some(modulePath =>
          jarPath.includes(modulePath.replace(/^\./, ''))
        )
        if (belongsToSelectedModule) {
          copiedFilePaths.push(jarPath)
        }
      }

      if (buildLogs.value.length > 2000) {
        buildLogs.value = buildLogs.value.slice(-1500)
      }
    })

    unlistenDone = await listen<BuildDoneEvent>('build-done', (event) => {
      const { success, duration_ms, message } = event.payload
      buildLogs.value.push('')
      buildLogs.value.push(message)
      buildDuration.value = duration_ms
      buildStatus.value = success ? 'success' : 'error'

      if (unlistenLog) { unlistenLog(); unlistenLog = null }
      if (unlistenDone) { unlistenDone(); unlistenDone = null }

      // 如果用户设置了输出目录，复制到输出目录
      if (success && outputDir.value && copiedFilePaths.length > 0) {
        copyToOutputDir()
      }

      // 如果设置了自动上传，上传到服务器
      if (success && autoUpload.value && selectedServerIds.value.length > 0 && copiedFilePaths.length > 0) {
        upload().catch(e => buildLogs.value.push(`❌ 自动上传失败: ${e}`))
      }
    })

    try {
      await invoke('start_build', {
        projectPath: currentProject.value.path,
        modulePaths: selectedModules.value.map(m => m.path),
        moduleNames: selectedModules.value.map(m => m.name),
        profile: selectedProfile.value,
        extraArgs: extraArgs.value || null,
        skipTests: skipTests.value,
        outputDir: null, // 不自动复制，直接从 target 目录操作
        buildScope: buildScope.value,
        customMavenPath: mavenConfig.value.customPath || null,
        javaHome: mavenConfig.value.javaHome || null,
      })
    } catch (e) {
      buildLogs.value.push(`❌ 启动构建失败: ${e}`)
      buildStatus.value = 'error'
      if (unlistenLog) { unlistenLog(); unlistenLog = null }
      if (unlistenDone) { unlistenDone(); unlistenDone = null }
    }
  }

  // 复制到用户指定的输出目录
  async function copyToOutputDir() {
    if (!outputDir.value || copiedFilePaths.length === 0) return

    try {
      await invoke('copy_files_to_dir', {
        filePaths: copiedFilePaths,
        outputDir: outputDir.value,
      })
      buildLogs.value.push(`📦 已复制到: ${outputDir.value}`)
    } catch (e) {
      buildLogs.value.push(`❌ 复制到输出目录失败: ${e}`)
    }
  }

  function resetBuild() {
    buildStatus.value = 'idle'
    buildLogs.value = []
    buildDuration.value = 0
    copiedFilePaths = []
  }

  // 清理事件监听器（组件卸载时调用）
  function cleanup() {
    if (unlistenLog) { unlistenLog(); unlistenLog = null }
    if (unlistenDone) { unlistenDone(); unlistenDone = null }
  }

  return {
    // 数据
    projects,
    servers,
    mavenConfig,
    currentProject,
    modules,
    leafModules,
    selectedModules,
    selectedProfile,
    skipTests,
    extraArgs,
    buildStatus,
    buildLogs,
    buildDuration,
    mavenVersion,
    loadingModules,
    outputDir,
    buildScope,
    autoUpload,
    showSettings,
    settingsTab,
    selectedServerIds,
    activeServers,
    mavenScanResults,
    jdkScanResults,
    scanning,
    // 方法
    checkMaven,
    updateMavenConfig,
    scanInstallations,
    selectMavenPath,
    selectJavaHome,
    addServer,
    updateServer,
    removeServer,
    exportServers,
    importServers,
    addProject,
    removeProject,
    updateProject,
    selectProject,
    loadModules,
    toggleModule,
    clearSelection,
    setOutputDir,
    toggleServer,
    upload,
    build,
    resetBuild,
    cleanup,
  }
}
