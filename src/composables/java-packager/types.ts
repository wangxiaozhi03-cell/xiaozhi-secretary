/** Maven 模块信息 */
export interface MavenModule {
  name: string
  path: string
  is_aggregator: boolean
  children: MavenModule[]
}

/** 项目配置 */
export interface ProjectConfig {
  name: string
  path: string
  profiles: string[]
  defaultProfile: string
}

/** 构建状态 */
export type BuildStatus = 'idle' | 'building' | 'success' | 'error'

/** 构建范围 */
export type BuildScope = 'module' | 'with-deps' | 'project'

export const BUILD_SCOPE_OPTIONS: { value: BuildScope; label: string; desc: string }[] = [
  { value: 'module', label: '仅当前', desc: '最快，不构建依赖' },
  { value: 'with-deps', label: '含依赖', desc: '自动构建上游依赖模块' },
  { value: 'project', label: '整项目', desc: '最安全，全量构建' },
]

/** 实时日志事件 */
export interface BuildLogEvent {
  index: number
  total: number
  module_name: string
  line: string
  kind: 'stdout' | 'stderr' | 'info' | 'error' | 'success'
}

/** 构建完成事件 */
export interface BuildDoneEvent {
  success: boolean
  duration_ms: number
  message: string
  copy_result: string | null
}
