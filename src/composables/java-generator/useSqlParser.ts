/**
 * SQL 解析器
 * 解析 CREATE TABLE 语句，提取表结构信息
 */
import type {
  TableDefinition,
  SqlField,
  TableRelation,
  SqlParseResult,
  SqlParseError,
  DatabaseType,
} from './types'

export function useSqlParser() {
  /**
   * 解析 SQL 文本
   */
  function parseSql(sql: string, dbType: DatabaseType = 'mysql'): SqlParseResult {
    const result: SqlParseResult = {
      tables: [],
      relations: [],
      errors: [],
    }

    try {
      // 预处理 SQL
      const normalizedSql = normalizeSql(sql)

      // 提取所有 CREATE TABLE 语句
      const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?[`"']?(\w+)[`"']?\s*\(([\s\S]*)\)\s*(?:ENGINE\s*=\s*\w+)?[^;]*;/gi

      let match: RegExpExecArray | null
      while ((match = createTableRegex.exec(normalizedSql)) !== null) {
        try {
          const tableName = match[1]
          const tableBody = match[2]
          const table = parseTableDefinition(tableName, tableBody, dbType)
          result.tables.push(table)
        } catch (error) {
          result.errors.push({
            message: `解析表 ${match[1]} 时出错: ${error instanceof Error ? error.message : '未知错误'}`,
            severity: 'error',
          })
        }
      }

      // 如果没有匹配到标准格式，尝试宽松解析
      if (result.tables.length === 0) {
        const looseResult = looseParseSql(sql, dbType)
        result.tables = looseResult.tables
        result.errors = [...result.errors, ...looseResult.errors]
      }

      // 分析表关系
      result.relations = analyzeRelations(result.tables)

      // 验证结果
      if (result.tables.length === 0 && result.errors.length === 0) {
        result.errors.push({
          message: '未找到有效的 CREATE TABLE 语句',
          severity: 'warning',
        })
      }
    } catch (error) {
      result.errors.push({
        message: `SQL 解析失败: ${error instanceof Error ? error.message : '未知错误'}`,
        severity: 'error',
      })
    }

    return result
  }

  /**
   * 标准化 SQL 文本
   */
  function normalizeSql(sql: string): string {
    return sql
      // 移除单行注释
      .replace(/--.*$/gm, '')
      // 移除多行注释
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // 标准化空白字符（保留换行符）
      .replace(/[^\S\n]+/g, ' ')
      // 移除行首行尾空白
      .replace(/^\s+|\s+$/gm, '')
      .trim()
  }

  /**
   * 解析单个表定义
   */
  function parseTableDefinition(
    tableName: string,
    tableBody: string,
    dbType: DatabaseType
  ): TableDefinition {
    const table: TableDefinition = {
      name: tableName,
      fields: [],
      indexes: [],
      foreignKeys: [],
    }

    // 分割字段和约束
    const parts = splitTableBody(tableBody)

    for (const part of parts) {
      const trimmed = part.trim()
      if (!trimmed) continue

      const upperTrimmed = trimmed.toUpperCase()

      if (upperTrimmed.startsWith('PRIMARY KEY')) {
        handlePrimaryKey(trimmed, table)
      } else if (upperTrimmed.startsWith('UNIQUE') || upperTrimmed.startsWith('INDEX') || upperTrimmed.startsWith('KEY')) {
        handleIndex(trimmed, table)
      } else if (upperTrimmed.startsWith('CONSTRAINT') && upperTrimmed.includes('FOREIGN KEY')) {
        handleForeignKey(trimmed, table)
      } else if (upperTrimmed.startsWith('FOREIGN KEY')) {
        handleForeignKey(trimmed, table)
      } else if (!upperTrimmed.startsWith('PRIMARY') && !upperTrimmed.startsWith('UNIQUE') && !upperTrimmed.startsWith('INDEX') && !upperTrimmed.startsWith('KEY') && !upperTrimmed.startsWith('CONSTRAINT')) {
        // 普通字段定义
        const field = parseFieldDefinition(trimmed, dbType)
        if (field) {
          table.fields.push(field)
        }
      }
    }

    // 提取表注释
    const commentMatch = tableBody.match(/COMMENT\s*=\s*['"]([^'"]+)['"]/i)
    if (commentMatch) {
      table.comment = commentMatch[1]
    }

    return table
  }

  /**
   * 分割表体内容
   */
  function splitTableBody(body: string): string[] {
    const parts: string[] = []
    let current = ''
    let depth = 0
    let inString = false
    let stringChar = ''

    for (let i = 0; i < body.length; i++) {
      const char = body[i]

      if (inString) {
        current += char
        // 处理转义的引号
        if (char === '\\' && i + 1 < body.length) {
          current += body[i + 1]
          i++
          continue
        }
        if (char === stringChar) {
          inString = false
        }
        continue
      }

      if (char === "'" || char === '"' || char === '`') {
        inString = true
        stringChar = char
        current += char
        continue
      }

      if (char === '(') {
        depth++
        current += char
      } else if (char === ')') {
        depth--
        current += char
      } else if (char === ',' && depth === 0) {
        parts.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }

    if (current.trim()) {
      parts.push(current.trim())
    }

    return parts
  }

  /**
   * 解析字段定义
   */
  function parseFieldDefinition(definition: string, _dbType: DatabaseType): SqlField | null {
    // 字段定义正则表达式 - 支持反引号、CHARACTER SET、COLLATE 等
    const fieldRegex = /^[`"']?(\w+)[`"']?\s+(\w+)(?:\((\d+)(?:,\s*(\d+))?\))?/i
    const match = definition.match(fieldRegex)

    if (!match) return null

    const fieldName = match[1]
    const fieldType = match[2].toLowerCase()
    const length = match[3] ? parseInt(match[3]) : undefined
    const scale = match[4] ? parseInt(match[4]) : undefined

    const upperDef = definition.toUpperCase()

    const field: SqlField = {
      name: fieldName,
      type: fieldType,
      length,
      scale,
      nullable: !upperDef.includes('NOT NULL'),
      isPrimary: upperDef.includes('PRIMARY KEY'),
      isAutoIncrement: upperDef.includes('AUTO_INCREMENT') || upperDef.includes('SERIAL'),
      defaultValue: extractDefault(definition),
      comment: extractComment(definition),
    }

    return field
  }

  /**
   * 提取默认值
   */
  function extractDefault(definition: string): string | undefined {
    const defaultRegex = /DEFAULT\s+(['"]?[^'"',\s]+['"]?)/i
    const match = definition.match(defaultRegex)
    return match ? match[1].replace(/['"]/g, '') : undefined
  }

  /**
   * 提取注释
   */
  function extractComment(definition: string): string | undefined {
    // 支持单引号、双引号，以及中文括号等特殊字符
    const commentRegex = /COMMENT\s+['"](.+?)['"]/i
    const match = definition.match(commentRegex)
    return match ? match[1].trim() : undefined
  }

  /**
   * 处理主键约束
   */
  function handlePrimaryKey(definition: string, table: TableDefinition): void {
    const pkRegex = /PRIMARY\s+KEY\s*\(([^)]+)\)/i
    const match = definition.match(pkRegex)

    if (match) {
      const fields = match[1].split(',').map(f => f.trim().replace(/[`"']/g, ''))
      for (const fieldName of fields) {
        const field = table.fields.find(f => f.name === fieldName)
        if (field) {
          field.isPrimary = true
        }
      }
    }
  }

  /**
   * 处理索引
   */
  function handleIndex(definition: string, table: TableDefinition): void {
    const indexRegex = /(?:UNIQUE\s+)?(?:INDEX|KEY)\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)/i
    const match = definition.match(indexRegex)

    if (match && table.indexes) {
      table.indexes.push({
        name: match[1],
        fields: match[2].split(',').map(f => f.trim().replace(/[`"']/g, '')),
        isUnique: definition.toUpperCase().includes('UNIQUE'),
      })
    }
  }

  /**
   * 处理外键约束
   */
  function handleForeignKey(definition: string, table: TableDefinition): void {
    const fkRegex = /(?:CONSTRAINT\s+[`"']?\w+[`"']?\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s*REFERENCES\s+[`"']?(\w+)[`"']?\s*\(([^)]+)\)/i
    const match = definition.match(fkRegex)

    if (match && table.foreignKeys) {
      table.foreignKeys.push({
        name: `fk_${table.name}_${match[1]}`,
        field: match[1].trim().replace(/[`"']/g, ''),
        referencedTable: match[2],
        referencedField: match[3].trim().replace(/[`"']/g, ''),
      })
    }
  }

  /**
   * 宽松解析 SQL（支持更多格式）
   */
  function looseParseSql(sql: string, dbType: DatabaseType): SqlParseResult {
    const result: SqlParseResult = {
      tables: [],
      relations: [],
      errors: [],
    }

    // 尝试匹配 CREATE TABLE，即使格式不完全标准
    const tableRegex = /CREATE\s+TABLE\s+[`"']?(\w+)[`"']?\s*\(([\s\S]*?)\)/gi
    let match: RegExpExecArray | null

    while ((match = tableRegex.exec(sql)) !== null) {
      try {
        const tableName = match[1]
        const tableBody = match[2]
        const table = parseTableDefinition(tableName, tableBody, dbType)

        if (table.fields.length > 0) {
          result.tables.push(table)
        }
      } catch (error) {
        result.errors.push({
          message: `宽松解析表 ${match[1]} 时出错: ${error instanceof Error ? error.message : '未知错误'}`,
          severity: 'warning',
        })
      }
    }

    return result
  }

  /**
   * 分析表关系
   */
  function analyzeRelations(tables: TableDefinition[]): TableRelation[] {
    const relations: TableRelation[] = []

    for (const table of tables) {
      // 分析外键关系
      if (table.foreignKeys) {
        for (const fk of table.foreignKeys) {
          relations.push({
            fromTable: table.name,
            fromField: fk.field,
            toTable: fk.referencedTable,
            toField: fk.referencedField,
            type: 'many-to-one',
          })
        }
      }

      // 分析关联表（多对多关系）
      if (table.name.includes('_') && table.fields.length <= 5) {
        const parts = table.name.split('_')
        if (parts.length === 2) {
          const table1 = tables.find(t => t.name === parts[0] || t.name === parts[0] + 's')
          const table2 = tables.find(t => t.name === parts[1] || t.name === parts[1] + 's')

          if (table1 && table2) {
            relations.push({
              fromTable: table1.name,
              fromField: `${parts[1]}_id`,
              toTable: table.name,
              toField: 'id',
              type: 'one-to-many',
            })
            relations.push({
              fromTable: table2.name,
              fromField: `${parts[0]}_id`,
              toTable: table.name,
              toField: 'id',
              type: 'one-to-many',
            })
          }
        }
      }
    }

    return relations
  }

  /**
   * 格式化 SQL
   */
  function formatSql(sql: string): string {
    let formatted = sql

    // 关键字大写
    const keywords = [
      'CREATE', 'TABLE', 'IF', 'NOT', 'EXISTS', 'PRIMARY', 'KEY', 'FOREIGN',
      'REFERENCES', 'INDEX', 'UNIQUE', 'DEFAULT', 'NULL', 'AUTO_INCREMENT',
      'COMMENT', 'ENGINE', 'CHARSET', 'COLLATE', 'INSERT', 'INTO', 'VALUES',
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'ORDER', 'BY', 'GROUP', 'HAVING',
      'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AS', 'SET', 'UPDATE',
      'DELETE', 'DROP', 'ALTER', 'ADD', 'COLUMN', 'CONSTRAINT', 'CHECK',
    ]

    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      formatted = formatted.replace(regex, keyword)
    }

    // 在逗号后换行
    formatted = formatted.replace(/,/g, ',\n  ')

    // 在括号前后换行
    formatted = formatted.replace(/\(/g, '(\n  ')
    formatted = formatted.replace(/\)/g, '\n)')

    // 移除多余空行
    formatted = formatted.replace(/\n\s*\n/g, '\n')

    return formatted.trim()
  }

  /**
   * 验证 SQL 语法（基础验证）
   */
  function validateSql(sql: string): SqlParseError[] {
    const errors: SqlParseError[] = []

    // 检查是否为空
    if (!sql.trim()) {
      errors.push({
        message: 'SQL 内容不能为空',
        severity: 'error',
      })
      return errors
    }

    // 检查括号匹配
    const openParens = (sql.match(/\(/g) || []).length
    const closeParens = (sql.match(/\)/g) || []).length
    if (openParens !== closeParens) {
      errors.push({
        message: `括号不匹配: 左括号 ${openParens} 个, 右括号 ${closeParens} 个`,
        severity: 'error',
      })
    }

    // 检查引号匹配
    const singleQuotes = (sql.match(/'/g) || []).length
    if (singleQuotes % 2 !== 0) {
      errors.push({
        message: '单引号不匹配',
        severity: 'error',
      })
    }

    // 检查是否有 CREATE TABLE
    if (!sql.toUpperCase().includes('CREATE TABLE')) {
      errors.push({
        message: '未找到 CREATE TABLE 语句',
        severity: 'warning',
      })
    }

    return errors
  }

  return {
    parseSql,
    formatSql,
    validateSql,
  }
}
