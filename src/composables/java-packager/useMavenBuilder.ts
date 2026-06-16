import { ref, watch } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import type { MavenModule, BuildStatus, BuildScope, ProjectConfig, BuildLogEvent, BuildDoneEvent } from './types'

const CONFIG_KEY = 'java-packager-projects'

/** 从本地文件加载项目配置 */
function loadProjects(): ProjectConfig[] {
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

/** 保存项目配置到本地 */
function saveProjects(projects: ProjectConfig[]) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(projects))
}

export function useMavenBuilder() {
  const projects = ref<ProjectConfig[]>(loadProjects())
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
  const showSettings = ref(false)

  let unlistenLog: (() => void) | null = null
  let unlistenDone: (() => void) | null = null

  // 持久化
  watch(projects, (v) => saveProjects(v), { deep: true })

  /** 检查 Maven 是否可用 */
  async function checkMaven() {
    try {
      mavenVersion.value = await invoke<string>('check_maven_available')
      return true
    } catch {
      mavenVersion.value = ''
      return false
    }
  }

  /** 添加项目 */
  function addProject(name: string, path: string, profiles: string[], defaultProfile: string) {
    projects.value.push({ name, path, profiles, defaultProfile })
  }

  /** 删除项目 */
  function removeProject(index: number) {
    const removed = projects.value[index]
    projects.value.splice(index, 1)
    if (currentProject.value?.path === removed.path) {
      currentProject.value = null
      selectedModules.value = []
      modules.value = []
      leafModules.value = []
    }
  }

  /** 更新项目 */
  function updateProject(index: number, data: ProjectConfig) {
    const oldPath = projects.value[index].path
    projects.value[index] = data
    if (currentProject.value?.path === oldPath) {
      currentProject.value = data
    }
  }

  /** 选择项目并加载模块 */
  async function selectProject(project: ProjectConfig) {
    currentProject.value = project
    selectedProfile.value = project.defaultProfile
    selectedModules.value = []
    buildLogs.value = []
    buildStatus.value = 'idle'
    await loadModules()
  }

  /** 加载项目的模块列表 */
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

  /** 切换模块选中状态 */
  function toggleModule(mod: MavenModule) {
    const idx = selectedModules.value.findIndex(m => m.path === mod.path)
    if (idx >= 0) {
      selectedModules.value.splice(idx, 1)
    } else {
      selectedModules.value.push(mod)
    }
  }

  /** 清空选择 */
  function clearSelection() {
    selectedModules.value = []
  }

  /** 设置输出目录 */
  function setOutputDir(dir: string) {
    outputDir.value = dir
  }

  /** 开始后台构建 */
  async function build() {
    if (!currentProject.value || selectedModules.value.length === 0) return

    buildStatus.value = 'building'
    buildLogs.value = []
    buildDuration.value = 0

    if (unlistenLog) unlistenLog()
    if (unlistenDone) unlistenDone()

    unlistenLog = await listen<BuildLogEvent>('build-log', (event) => {
      const { line } = event.payload
      buildLogs.value.push(line)
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
    })

    try {
      await invoke('start_build', {
        projectPath: currentProject.value.path,
        modulePaths: selectedModules.value.map(m => m.path),
        moduleNames: selectedModules.value.map(m => m.name),
        profile: selectedProfile.value,
        extraArgs: extraArgs.value || null,
        skipTests: skipTests.value,
        outputDir: outputDir.value || null,
        buildScope: buildScope.value,
      })
    } catch (e) {
      buildLogs.value.push(`❌ 启动构建失败: ${e}`)
      buildStatus.value = 'error'
      if (unlistenLog) { unlistenLog(); unlistenLog = null }
      if (unlistenDone) { unlistenDone(); unlistenDone = null }
    }
  }

  /** 重置构建状态 */
  function resetBuild() {
    buildStatus.value = 'idle'
    buildLogs.value = []
    buildDuration.value = 0
  }

  return {
    projects,
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
    showSettings,
    checkMaven,
    addProject,
    removeProject,
    updateProject,
    selectProject,
    loadModules,
    toggleModule,
    clearSelection,
    setOutputDir,
    build,
    resetBuild,
  }
}
