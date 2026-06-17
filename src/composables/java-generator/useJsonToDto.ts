/**
 * JSON 转 Java DTO 生成器
 * 根据 JSON 结构生成 Java DTO 类
 */
import type { JsonFieldInfo, JsonToDtoConfig, GeneratedFile, SwaggerVersion } from './types'

export function useJsonToDto() {
  /**
   * 解析 JSON 字符串，提取字段结构
   */
  function parseJson(jsonStr: string): JsonFieldInfo[] {
    // 移除注释（// 风格）
    const cleanJson = jsonStr.replace(/\/\/.*$/gm, '')

    try {
      const obj = JSON.parse(cleanJson)
      return extractFields(obj)
    } catch (e) {
      throw new Error(`JSON 解析失败: ${e}`)
    }
  }

  /**
   * 提取对象字段
   */
  function extractFields(obj: any): JsonFieldInfo[] {
    const fields: JsonFieldInfo[] = []

    for (const [key, value] of Object.entries(obj)) {
      const field: JsonFieldInfo = {
        name: key,
        type: getJsonType(value),
        javaType: getJavaType(value),
        isArray: Array.isArray(value),
        isNested: false,
      }

      // 处理数组类型
      if (Array.isArray(value)) {
        if (value.length > 0) {
          const firstItem = value[0]
          if (typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem)) {
            // 对象数组
            field.isNested = true
            field.nestedFields = extractFields(firstItem)
            field.javaType = 'List<' + toPascalCase(key) + 'Item>'
          } else {
            // 基本类型数组
            field.javaType = 'List<' + getJavaType(firstItem) + '>'
          }
        } else {
          field.javaType = 'List<Object>'
        }
      }
      // 处理嵌套对象
      else if (typeof value === 'object' && value !== null) {
        field.isNested = true
        field.nestedFields = extractFields(value)
        field.javaType = toPascalCase(key)
      }

      fields.push(field)
    }

    return fields
  }

  /**
   * 获取 JSON 值类型
   */
  function getJsonType(value: any): string {
    if (value === null) return 'null'
    if (Array.isArray(value)) return 'array'
    return typeof value
  }

  /**
   * 根据 JSON 值获取 Java 类型
   */
  function getJavaType(value: any): string {
    if (value === null) return 'Object'
    if (Array.isArray(value)) {
      if (value.length > 0) {
        return 'List<' + getJavaType(value[0]) + '>'
      }
      return 'List<Object>'
    }

    switch (typeof value) {
      case 'string':
        return 'String'
      case 'number':
        // 判断是整数还是浮点数
        if (Number.isInteger(value)) {
          // 根据数值大小判断使用 Long 还是 Integer
          if (value > 2147483647 || value < -2147483648) {
            return 'Long'
          }
          return 'Integer'
        }
        return 'Double'
      case 'boolean':
        return 'Boolean'
      default:
        return 'Object'
    }
  }

  /**
   * 从 JSON 字符串中提取注释
   */
  function extractComments(jsonStr: string): Map<string, string> {
    const comments = new Map<string, string>()
    const lines = jsonStr.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      // 匹配 "key": value // comment 格式
      const match = line.match(/"(\w+)"\s*:\s*.*?\/\/\s*(.+)$/)
      if (match) {
        comments.set(match[1], match[2].trim())
      }
      // 匹配独立的注释行 "// comment"，下一行是字段
      else if (line.startsWith('//')) {
        const comment = line.replace(/^\/\/\s*/, '').trim()
        const nextLine = lines[i + 1]?.trim()
        if (nextLine) {
          const nextMatch = nextLine.match(/"(\w+)"\s*:/)
          if (nextMatch) {
            comments.set(nextMatch[1], comment)
          }
        }
      }
    }

    return comments
  }

  /**
   * 生成 DTO 代码
   */
  function generateDtoCode(
    jsonStr: string,
    config: JsonToDtoConfig
  ): { swagger2: GeneratedFile; swagger3: GeneratedFile } {
    // 提取注释
    const comments = extractComments(jsonStr)

    // 解析 JSON
    const fields = parseJson(jsonStr)

    // 为字段添加注释
    fields.forEach(field => {
      if (comments.has(field.name)) {
        field.comment = comments.get(field.name)
      }
    })

    // 根据用户配置的 swaggerVersion 生成对应的代码
    const selectedVersion = config.swaggerVersion || 'swagger3'

    // 生成用户选择的版本
    const selectedContent = generateCode(fields, config, selectedVersion, comments)

    // 同时生成另一个版本作为对比
    const otherVersion = selectedVersion === 'swagger2' ? 'swagger3' : 'swagger2'
    const otherContent = generateCode(fields, config, otherVersion, comments)

    return {
      swagger2: {
        name: `${config.className}.java (Swagger2)`,
        path: `dto/${config.className}_swagger2.java`,
        content: selectedVersion === 'swagger2' ? selectedContent : otherContent,
        type: 'dto',
      },
      swagger3: {
        name: `${config.className}.java (Swagger3)`,
        path: `dto/${config.className}_swagger3.java`,
        content: selectedVersion === 'swagger3' ? selectedContent : otherContent,
        type: 'dto',
      },
    }
  }

  /**
   * 生成代码
   */
  function generateCode(
    fields: JsonFieldInfo[],
    config: JsonToDtoConfig,
    swaggerVersion: SwaggerVersion,
    _comments: Map<string, string>
  ): string {
    const imports = new Set<string>()
    const nestedClasses: string[] = []

    // 添加 Lombok 导入
    if (config.useLombok) {
      imports.add('import lombok.Data;')
      imports.add('import lombok.EqualsAndHashCode;')
    }

    // 添加 Swagger 导入（swaggerVersion 为 'none' 时不添加）
    if (config.useSwagger && swaggerVersion !== 'none') {
      if (swaggerVersion === 'swagger3') {
        imports.add('import io.swagger.v3.oas.annotations.media.Schema;')
      } else {
        imports.add('import io.swagger.annotations.ApiModel;')
        imports.add('import io.swagger.annotations.ApiModelProperty;')
      }
    }

    // 添加父类导入
    if (config.extendPageLimit) {
      imports.add('import com.vstecs.cloud.common.core.util.PageLimit;')
    }

    // 检查是否需要 List 导入
    const hasList = fields.some(f => f.isArray || f.javaType.startsWith('List<'))
    if (hasList) {
      imports.add('import java.util.List;')
    }

    // 检查是否需要 Set 导入
    const hasSet = fields.some(f => f.javaType.startsWith('Set<'))
    if (hasSet) {
      imports.add('import java.util.Set;')
    }

    // 生成嵌套类
    fields.forEach(field => {
      if (field.isNested && field.nestedFields) {
        nestedClasses.push(generateNestedClass(field, config, swaggerVersion))
      }
    })

    // 生成字段代码
    const fieldsCode = fields.map(field => generateFieldCode(field, config, swaggerVersion)).join('\n\n')

    // 构建类
    const content = `package ${config.packageName}.dto;

${Array.from(imports).join('\n')}

/**
 * ${config.className}
 *
 * @author ${config.author}
 * @date ${new Date().toISOString().split('T')[0]}
 */
${config.extendPageLimit ? '@EqualsAndHashCode(callSuper = true)' : ''}
@Data
${config.useSwagger && swaggerVersion !== 'none' ? (swaggerVersion === 'swagger3' ? `@Schema(description = "${config.className}")` : `@ApiModel("${config.className}")`) : ''}
public class ${config.className}${config.extendPageLimit ? ' extends PageLimit' : ''} {

${fieldsCode}
}
${nestedClasses.length > 0 ? '\n' + nestedClasses.join('\n') : ''}`

    return content
  }

  /**
   * 生成嵌套类
   */
  function generateNestedClass(
    field: JsonFieldInfo,
    config: JsonToDtoConfig,
    swaggerVersion: SwaggerVersion
  ): string {
    if (!field.nestedFields) return ''

    const imports = new Set<string>()

    // 添加 Lombok 导入
    if (config.useLombok) {
      imports.add('import lombok.Data;')
    }

    // 添加 Swagger 导入（swaggerVersion 为 'none' 时不添加）
    if (config.useSwagger && swaggerVersion !== 'none') {
      if (swaggerVersion === 'swagger3') {
        imports.add('import io.swagger.v3.oas.annotations.media.Schema;')
      } else {
        imports.add('import io.swagger.annotations.ApiModel;')
        imports.add('import io.swagger.annotations.ApiModelProperty;')
      }
    }

    // 检查是否需要 List 导入
    const hasList = field.nestedFields.some(f => f.isArray || f.javaType.startsWith('List<'))
    if (hasList) {
      imports.add('import java.util.List;')
    }

    const fieldsCode = field.nestedFields.map(f => generateFieldCode(f, config, swaggerVersion)).join('\n\n')

    const className = toPascalCase(field.name) + 'Item'

    return `
/**
 * ${className}
 *
 * @author ${config.author}
 * @date ${new Date().toISOString().split('T')[0]}
 */
@Data
${config.useSwagger && swaggerVersion !== 'none' ? (swaggerVersion === 'swagger3' ? `@Schema(description = "${className}")` : `@ApiModel("${className}")`) : ''}
class ${className} {

${fieldsCode}
}`
  }

  /**
   * 生成字段代码
   */
  function generateFieldCode(
    field: JsonFieldInfo,
    config: JsonToDtoConfig,
    swaggerVersion: SwaggerVersion
  ): string {
    const lines: string[] = []
    const fieldName = toCamelCase(field.name)

    // 添加注释
    if (field.comment) {
      lines.push(`    /**`)
      lines.push(`     * ${field.comment}`)
      lines.push(`     */`)
    }

    // 添加 Swagger 注解（swaggerVersion 为 'none' 时不添加）
    if (config.useSwagger && swaggerVersion !== 'none') {
      if (swaggerVersion === 'swagger3') {
        lines.push(`    @Schema(description = "${field.comment || field.name}")`)
      } else {
        lines.push(`    @ApiModelProperty(value = "${field.comment || field.name}")`)
      }
    }

    // 处理嵌套类型名称
    let javaType = field.javaType
    if (field.isNested && !field.isArray) {
      javaType = toPascalCase(field.name)
    } else if (field.isNested && field.isArray) {
      javaType = 'List<' + toPascalCase(field.name) + 'Item>'
    }

    lines.push(`    private ${javaType} ${fieldName};`)

    return lines.join('\n')
  }

  /**
   * 转换为 PascalCase
   */
  function toPascalCase(str: string): string {
    // 处理连续大写字母（如 ownerId -> OwnerId）
    const words = str
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(/[\s_-]+/)

    return words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
  }

  /**
   * 转换为 camelCase
   */
  function toCamelCase(str: string): string {
    const pascal = toPascalCase(str)
    return pascal.charAt(0).toLowerCase() + pascal.slice(1)
  }

  /**
   * 复制代码到剪贴板
   */
  async function copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // 降级方案
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      return true
    }
  }

  /**
   * 格式化 JSON
   */
  function formatJson(jsonStr: string): string {
    try {
      // 移除注释
      const cleanJson = jsonStr.replace(/\/\/.*$/gm, '')
      const obj = JSON.parse(cleanJson)
      return JSON.stringify(obj, null, 2)
    } catch (e) {
      throw new Error(`JSON 格式化失败: ${e}`)
    }
  }

  /**
   * 验证 JSON
   */
  function validateJson(jsonStr: string): { valid: boolean; error?: string } {
    try {
      // 移除注释
      const cleanJson = jsonStr.replace(/\/\/.*$/gm, '')
      JSON.parse(cleanJson)
      return { valid: true }
    } catch (e) {
      return { valid: false, error: String(e) }
    }
  }

  return {
    parseJson,
    generateDtoCode,
    formatJson,
    validateJson,
    copyToClipboard,
  }
}
