import { ref, watch, computed } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import type { MavenModule, BuildStatus, BuildScope, ProjectConfig, SshServer, BuildLogEvent, BuildDoneEvent } from './types'

const PROJECTS_KEY = 'java-packager-projects'
const SERVERS_KEY = 'java-packager-servers'

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

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

export function useMavenBuilder() {
  // ── 数据 ──
  const projects = ref<ProjectConfig[]>(loadProjects())
  const servers = ref<SshServer[]>(loadServers())
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
  const settingsTab = ref<'projects' | 'servers'>('projects')

  // 选中的上传服务器 ID
  const selectedServerIds = ref<string[]>([])

  let copiedFilePaths: string[] = []
  let unlistenLog: (() => void) | null = null
  let unlistenDone: (() => void) | null = null

  // 持久化
  watch(projects, (v) => saveProjects(v), { deep: true })
  watch(servers, (v) => saveServers(v), { deep: true })

  // 当前选中的上传服务器
  const activeServers = computed(() =>
    servers.value.filter(s => selectedServerIds.value.includes(s.id))
  )

  // ── Maven ──
  async function checkMaven() {
    try {
      mavenVersion.value = await invoke<string>('check_maven_available')
      return true
    } catch {
      mavenVersion.value = ''
      return false
    }
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

    unlistenLog = await listen<BuildLogEvent>('build-log', (event) => {
      const { line } = event.payload
      buildLogs.value.push(line)

      const copyMatch = line.match(/📦 已复制到: (.+\.jar)/)
      if (copyMatch) {
        copiedFilePaths.push(copyMatch[1])
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

      if (success && autoUpload.value && selectedServerIds.value.length > 0 && copiedFilePaths.length > 0) {
        upload()
      }
    })

    // 如果选了上传服务器但没有设置输出目录，自动使用项目根目录下的 output 目录（避免被 mvn clean 清除）
    const hasServers = selectedServerIds.value.length > 0
    const effectiveOutputDir = outputDir.value || (hasServers ? `${currentProject.value.path}/output` : null)

    try {
      await invoke('start_build', {
        projectPath: currentProject.value.path,
        modulePaths: selectedModules.value.map(m => m.path),
        moduleNames: selectedModules.value.map(m => m.name),
        profile: selectedProfile.value,
        extraArgs: extraArgs.value || null,
        skipTests: skipTests.value,
        outputDir: effectiveOutputDir,
        buildScope: buildScope.value,
      })
    } catch (e) {
      buildLogs.value.push(`❌ 启动构建失败: ${e}`)
      buildStatus.value = 'error'
      if (unlistenLog) { unlistenLog(); unlistenLog = null }
      if (unlistenDone) { unlistenDone(); unlistenDone = null }
    }
  }

  function resetBuild() {
    buildStatus.value = 'idle'
    buildLogs.value = []
    buildDuration.value = 0
    copiedFilePaths = []
  }

  return {
    // 数据
    projects,
    servers,
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
    // 方法
    checkMaven,
    addServer,
    updateServer,
    removeServer,
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
  }
}
