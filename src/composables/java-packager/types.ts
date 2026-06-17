/** Maven 模块信息 */
export interface MavenModule {
  name: string
  path: string
  is_aggregator: boolean
  children: MavenModule[]
}

/** SSH 服务器配置 */
export interface SshServer {
  /** 唯一 ID */
  id: string
  /** 显示名称 */
  name: string
  /** 服务器地址 */
  host: string
  /** SSH 端口 */
  port: number
  /** 用户名 */
  username: string
  /** 密码（为空则使用免密登录） */
  password: string
  /** 远程目录 */
  remotePath: string
}

/** 项目配置 */
export interface ProjectConfig {
  name: string
  path: string
  profiles: string[]
  defaultProfile: string
}

/** Maven 配置 */
export interface MavenConfig {
  /** 自定义 Maven 路径（为空则使用系统 PATH） */
  customPath: string
  /** 自定义 JAVA_HOME 路径（为空则使用系统环境变量） */
  javaHome: string
}

/** 扫描结果项 */
export interface ScanResult {
  /** 显示名称（包含版本信息） */
  label: string
  /** 实际路径 */
  path: string
  /** 来源（system, sdkman, jenv, brew 等） */
  source: string
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
