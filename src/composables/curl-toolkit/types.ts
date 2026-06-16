export interface ParsedRequest {
  method: string
  url: string
  headers: Record<string, string>
  body: string | null
  query: Record<string, string>
  hostname: string
  port: string | null
  protocol: string
  path: string
}

export interface Environment {
  id: string
  name: string
  domain: string
  port: string | null
  protocol: "http" | "https"
  isActive: boolean
}

export interface HistoryItem {
  id: string
  method: string
  url: string
  status: number | null
  timestamp: number
  curl: string
}

export interface ResponseResult {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  size: number
  time: number
  error: string | null
}
