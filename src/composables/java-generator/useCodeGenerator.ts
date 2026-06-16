/**
 * Java 代码生成器
 * 根据表结构生成 Java 后端代码
 */
import type {
  TableDefinition,
  SqlField,
  GeneratorConfig,
  GeneratedFile,
  GenerationResult,
  DirectoryNode,
  GenerationType,
} from './types'
import { MYSQL_TYPE_MAPPING } from './types'

// MySQL 保留关键词列表
const MYSQL_RESERVED_WORDS = new Set([
  'accessible', 'add', 'all', 'alter', 'analyze', 'and', 'as', 'asc',
  'asensitive', 'before', 'between', 'bigint', 'binary', 'blob', 'both',
  'by', 'call', 'cascade', 'case', 'change', 'char', 'character', 'check',
  'collate', 'column', 'condition', 'constraint', 'continue', 'convert',
  'create', 'cross', 'current_date', 'current_time', 'current_timestamp',
  'current_user', 'cursor', 'database', 'databases', 'day_hour',
  'day_microsecond', 'day_minute', 'day_second', 'dec', 'decimal', 'declare',
  'default', 'delayed', 'delete', 'desc', 'describe', 'deterministic',
  'distinct', 'distinctrow', 'div', 'double', 'drop', 'dual', 'each',
  'else', 'elseif', 'enclosed', 'escaped', 'exists', 'exit', 'explain',
  'false', 'fetch', 'float', 'float4', 'float8', 'for', 'force', 'foreign',
  'from', 'fulltext', 'generated', 'get', 'grant', 'group', 'having',
  'high_priority', 'hour_microsecond', 'hour_minute', 'hour_second', 'if',
  'ignore', 'in', 'index', 'infile', 'inner', 'inout', 'insensitive',
  'insert', 'int', 'int1', 'int2', 'int3', 'int4', 'int8', 'integer',
  'interval', 'into', 'io_after_gtids', 'io_before_gtids', 'iterate',
  'join', 'key', 'keys', 'kill', 'leading', 'leave', 'left', 'like',
  'limit', 'linear', 'lines', 'load', 'localtime', 'localtimestamp',
  'lock', 'long', 'longblob', 'longtext', 'loop', 'low_priority',
  'master_bind', 'master_ssl_verify_server_cert', 'match', 'maxvalue',
  'mediumblob', 'mediumint', 'mediumtext', 'middleint', 'minute_microsecond',
  'minute_second', 'mod', 'modifies', 'natural', 'not', 'no_write_to_binlog',
  'null', 'numeric', 'on', 'optimize', 'optimizer_costs', 'option',
  'optionally', 'or', 'order', 'out', 'outer', 'outfile', 'partition',
  'precision', 'primary', 'procedure', 'purge', 'range', 'read', 'reads',
  'read_write', 'real', 'references', 'regexp', 'release', 'rename', 'repeat',
  'replace', 'require', 'resignal', 'restrict', 'return', 'revoke', 'right',
  'rlike', 'schema', 'schemas', 'second_microsecond', 'select', 'sensitive',
  'separator', 'set', 'show', 'signal', 'smallint', 'spatial', 'specific',
  'sql', 'sqlexception', 'sqlstate', 'sqlwarning', 'sql_big_result',
  'sql_calc_found_rows', 'sql_small_result', 'ssl', 'starting', 'stored',
  'straight_join', 'table', 'terminated', 'then', 'tinyblob', 'tinyint',
  'tinytext', 'to', 'trailing', 'trigger', 'true', 'undo', 'union', 'unique',
  'unlock', 'unsigned', 'update', 'usage', 'use', 'using', 'utc_date',
  'utc_time', 'utc_timestamp', 'values', 'varbinary', 'varchar',
  'varcharacter', 'varying', 'virtual', 'when', 'where', 'while', 'with',
  'write', 'xor', 'year_month', 'zerofill',
  // 常用的非保留关键词也加上
  'action', 'bit', 'date', 'enum', 'no', 'text', 'time', 'timestamp',
  'datetime', 'year',
])

export function useCodeGenerator() {
  /**
   * 生成所有代码
   */
  function generateCode(tables: TableDefinition[], config: GeneratorConfig): GenerationResult {
    const files: GeneratedFile[] = []

    for (const table of tables) {
      const className = toPascalCase(table.name)
      const tableName = config.tablePrefix
        ? table.name.replace(new RegExp(`^${config.tablePrefix}`), '')
        : table.name

      // 生成 Entity
      if (config.generations.includes('entity')) {
        files.push(generateEntity(table, className, config))
      }

      // 生成 DTO（SaveReqDto 和 ResDto）
      if (config.generations.includes('dto')) {
        files.push(...generateDto(table, className, config))
      }

      // 生成 Mapper
      if (config.generations.includes('mapper')) {
        files.push(generateMapper(className, config))
      }

      // 生成 Mapper XML
      if (config.generations.includes('xml')) {
        files.push(generateMapperXml(table, className, config))
      }

      // 生成 Service
      if (config.generations.includes('service')) {
        files.push(generateService(className, config))
      }

      // 生成 ServiceImpl
      if (config.generations.includes('serviceImpl')) {
        files.push(generateServiceImpl(className, config))
      }

      // 生成 Controller
      if (config.generations.includes('controller')) {
        files.push(generateController(className, tableName, config))
      }
    }

    // 生成目录结构
    const directoryStructure = generateDirectoryStructure(tables, config)

    return {
      files,
      directoryStructure,
    }
  }

  /**
   * 生成 Entity 类
   */
  function generateEntity(
    table: TableDefinition,
    className: string,
    config: GeneratorConfig
  ): GeneratedFile {
    const imports = new Set<string>()
    const fields: string[] = []

    // 添加 Lombok 导入
    if (config.useLombok) {
      imports.add('import lombok.Getter;')
      imports.add('import lombok.Setter;')
      if (config.useBaseEntity) {
        imports.add('import lombok.EqualsAndHashCode;')
      }
    }

    // 添加表名注解
    if (config.ormType === 'mybatis-plus') {
      imports.add('import com.baomidou.mybatisplus.annotation.TableName;')
      imports.add('import com.baomidou.mybatisplus.annotation.TableId;')
      imports.add('import com.baomidou.mybatisplus.annotation.IdType;')
      // 检查是否有字段名是 MySQL 关键词
      const hasReservedWord = table.fields.some(f => MYSQL_RESERVED_WORDS.has(f.name.toLowerCase()))
      if (hasReservedWord) {
        imports.add('import com.baomidou.mybatisplus.annotation.TableField;')
      }
    }

    // 添加 Swagger 注解
    if (config.useSwagger) {
      if (config.swaggerVersion === 'swagger3') {
        imports.add('import io.swagger.v3.oas.annotations.media.Schema;')
      } else {
        imports.add('import io.swagger.annotations.ApiModel;')
        imports.add('import io.swagger.annotations.ApiModelProperty;')
      }
    }

    // 添加日期类型
    const hasDate = table.fields.some(f =>
      ['datetime', 'timestamp', 'date', 'time'].includes(f.type.toLowerCase())
    )
    if (hasDate) {
      if (config.dateType === 'LocalDateTime') {
        imports.add('import java.time.LocalDateTime;')
        imports.add('import java.time.LocalDate;')
        imports.add('import java.time.LocalTime;')
      } else {
        imports.add('import java.util.Date;')
      }
    }

    // 添加 BigDecimal
    const hasDecimal = table.fields.some(f =>
      ['decimal', 'numeric'].includes(f.type.toLowerCase())
    )
    if (hasDecimal) {
      imports.add('import java.math.BigDecimal;')
    }

    // 构建字段
    for (const field of table.fields) {
      const fieldCode = generateFieldCode(field, config)
      fields.push(fieldCode)
    }

    // 构建类
    const content = `package ${config.packageName}.entity;

${Array.from(imports).join('\n')}

/**
 * ${table.comment || className + ' 实体类'}
 *
 * @author ${config.author}
 * @date ${new Date().toISOString().split('T')[0]}
 */
${config.useLombok ? '@Getter\n@Setter' : ''}${config.useSwagger && config.swaggerVersion === 'swagger3' ? `\n@Schema(description = "${table.comment || className}")` : ''}${config.useSwagger && config.swaggerVersion !== 'swagger3' ? `\n@ApiModel("${table.comment || className}")` : ''}${config.ormType === 'mybatis-plus' ? `\n@TableName("${table.name}")` : ''}
${config.useBaseEntity ? `public class ${className} extends BaseEntity {` : `public class ${className} {`}
${fields.join('\n\n')}
${!config.useLombok ? generateGettersSetters(table.fields) : ''}
}
`

    return {
      name: `${className}.java`,
      path: `entity/${className}.java`,
      content,
      type: 'entity',
    }
  }

  /**
   * 生成字段代码
   */
  function generateFieldCode(field: SqlField, config: GeneratorConfig): string {
    const lines: string[] = []
    const javaType = getJavaType(field.type, config.dateType)
    const fieldName = toCamelCase(field.name)

    // 添加注释
    if (field.comment) {
      lines.push(`    /**`)
      lines.push(`     * ${field.comment}`)
      lines.push(`     */`)
    }

    // 添加 Swagger 注解
    if (config.useSwagger) {
      if (config.swaggerVersion === 'swagger3') {
        lines.push(`    @Schema(description = "${field.comment || field.name}"${field.isPrimary ? ', requiredMode = Schema.RequiredMode.REQUIRED' : ''})`)
      } else {
        lines.push(`    @ApiModelProperty(value = "${field.comment || field.name}"${field.isPrimary ? ', required = true' : ''})`)
      }
    }

    // 添加主键注解
    if (field.isPrimary && config.ormType === 'mybatis-plus') {
      lines.push(`    @TableId(value = "${field.name}", type = IdType.AUTO)`)
    }

    // 检查是否是 MySQL 关键词，如果是则添加 @TableField 注解
    if (!field.isPrimary && config.ormType === 'mybatis-plus' && MYSQL_RESERVED_WORDS.has(field.name.toLowerCase())) {
      lines.push(`    @TableField(\`${field.name}\`)`)
    }

    lines.push(`    private ${javaType} ${fieldName};`)

    return lines.join('\n')
  }

  /**
   * 生成 Mapper 接口
   */
  function generateMapper(className: string, config: GeneratorConfig): GeneratedFile {
    const content = `package ${config.packageName}.mapper;

import ${config.packageName}.entity.${className};
${config.ormType === 'mybatis-plus'
      ? 'import com.baomidou.mybatisplus.core.mapper.BaseMapper;'
      : 'import org.apache.ibatis.annotations.Mapper;'}
${config.useSwagger ? 'import org.apache.ibatis.annotations.Mapper;' : ''}

/**
 * ${className} Mapper 接口
 *
 * @author ${config.author}
 * @date ${new Date().toISOString().split('T')[0]}
 */
${config.ormType === 'mybatis-plus'
      ? `public interface ${className}Mapper extends BaseMapper<${className}> {`
      : `@Mapper
public interface ${className}Mapper {`
}

}
`

    return {
      name: `${className}Mapper.java`,
      path: `mapper/${className}Mapper.java`,
      content,
      type: 'mapper',
    }
  }

  /**
   * 生成 Mapper XML（仅包含自定义查询，基础 CRUD 由 MyBatis-Plus 提供）
   */
  function generateMapperXml(
    table: TableDefinition,
    className: string,
    config: GeneratorConfig
  ): GeneratedFile {
    const resultMap = generateResultMap(table, className)
    const baseColumnList = table.fields.map(f => {
      const columnName = MYSQL_RESERVED_WORDS.has(f.name.toLowerCase()) ? `\`${f.name}\`` : f.name
      return `        ${columnName}`
    }).join(',\n')

    const content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="${config.packageName}.mapper.${className}Mapper">

${resultMap}

    <sql id="Base_Column_List">
${baseColumnList}
    </sql>

</mapper>
`

    return {
      name: `${className}Mapper.xml`,
      path: `xml/${className}Mapper.xml`,
      content,
      type: 'xml',
    }
  }

  /**
   * 生成 ResultMap
   */
  function generateResultMap(table: TableDefinition, className: string): string {
    const lines = table.fields.map(f => {
      const property = toCamelCase(f.name)
      const columnName = MYSQL_RESERVED_WORDS.has(f.name.toLowerCase()) ? `\`${f.name}\`` : f.name
      if (f.isPrimary) {
        return `        <id property="${property}" column="${columnName}"/>`
      }
      return `        <result property="${property}" column="${columnName}"/>`
    })

    return `    <resultMap id="BaseResultMap" type="${className}">
${lines.join('\n')}
    </resultMap>`
  }

  /**
   * 生成 Service 接口
   */
  function generateService(className: string, config: GeneratorConfig): GeneratedFile {
    const content = `package ${config.packageName}.service;

import ${config.packageName}.entity.${className};
import ${config.packageName}.dto.${className}SaveReqDto;
import ${config.packageName}.dto.${className}PageReqDto;
import ${config.packageName}.dto.${className}ReqDto;
import com.baomidou.mybatisplus.core.metadata.IPage;
${config.ormType === 'mybatis-plus'
      ? 'import com.baomidou.mybatisplus.extension.service.IService;'
      : 'import java.util.List;'}

/**
 * ${className} Service 接口
 *
 * @author ${config.author}
 * @date ${new Date().toISOString().split('T')[0]}
 */
${config.ormType === 'mybatis-plus'
      ? `public interface ${className}Service extends IService<${className}> {

    /**
     * 分页查询
     */
    IPage<${className}> page(${className}PageReqDto pageReqDto);

    /**
     * 列表查询
     */
    List<${className}> list(${className}ReqDto reqDto);`
      : `public interface ${className}Service {

    /**
     * 根据 ID 查询
     */
    ${className} getById(Long id);

    /**
     * 分页查询
     */
    IPage<${className}> page(${className}PageReqDto pageReqDto);

    /**
     * 列表查询
     */
    List<${className}> list(${className}ReqDto reqDto);

    /**
     * 新增
     */
    boolean save(${className} entity);

    /**
     * 修改
     */
    boolean updateById(${className} entity);

    /**
     * 删除
     */
    boolean removeById(Long id);`
}

}
`

    return {
      name: `${className}Service.java`,
      path: `service/${className}Service.java`,
      content,
      type: 'service',
    }
  }

  /**
   * 生成 ServiceImpl
   */
  function generateServiceImpl(className: string, config: GeneratorConfig): GeneratedFile {
    const content = `package ${config.packageName}.service.impl;

import ${config.packageName}.entity.${className};
import ${config.packageName}.dto.${className}SaveReqDto;
import ${config.packageName}.dto.${className}PageReqDto;
import ${config.packageName}.dto.${className}ReqDto;
import ${config.packageName}.mapper.${className}Mapper;
import ${config.packageName}.service.${className}Service;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
${config.ormType === 'mybatis-plus'
      ? `import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;`
      : `import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;`}

/**
 * ${className} Service 实现类
 *
 * @author ${config.author}
 * @date ${new Date().toISOString().split('T')[0]}
 */
@Service
@RequiredArgsConstructor
${config.ormType === 'mybatis-plus'
      ? `public class ${className}ServiceImpl extends ServiceImpl<${className}Mapper, ${className}> implements ${className}Service {

    /**
     * 分页查询
     */
    @Override
    public IPage<${className}> page(${className}PageReqDto pageReqDto) {
        Page<${className}> page = new Page<>(pageReqDto.getPageNum(), pageReqDto.getPageSize());
        LambdaQueryWrapper<${className}> wrapper = new LambdaQueryWrapper<>();
        // TODO: 根据 pageReqDto 条件构建查询
        return this.page(page, wrapper);
    }

    /**
     * 列表查询
     */
    @Override
    public List<${className}> list(${className}ReqDto reqDto) {
        LambdaQueryWrapper<${className}> wrapper = new LambdaQueryWrapper<>();
        // TODO: 根据 reqDto 条件构建查询
        return this.list(wrapper);
    }`
      : `public class ${className}ServiceImpl implements ${className}Service {

    private final ${className}Mapper ${toCamelCase(className)}Mapper;

    /**
     * 根据 ID 查询
     */
    @Override
    public ${className} getById(Long id) {
        return ${toCamelCase(className)}Mapper.selectById(id);
    }

    /**
     * 分页查询
     */
    @Override
    public IPage<${className}> page(${className}PageReqDto pageReqDto) {
        Page<${className}> page = new Page<>(pageReqDto.getPageNum(), pageReqDto.getPageSize());
        QueryWrapper<${className}> wrapper = new QueryWrapper<>();
        // TODO: 根据 pageReqDto 条件构建查询
        return ${toCamelCase(className)}Mapper.selectPage(page, wrapper);
    }

    /**
     * 列表查询
     */
    @Override
    public List<${className}> list(${className}ReqDto reqDto) {
        QueryWrapper<${className}> wrapper = new QueryWrapper<>();
        // TODO: 根据 reqDto 条件构建查询
        return ${toCamelCase(className)}Mapper.selectList(wrapper);
    }

    /**
     * 新增
     */
    @Override
    public boolean save(${className} entity) {
        return ${toCamelCase(className)}Mapper.insert(entity) > 0;
    }

    /**
     * 修改
     */
    @Override
    public boolean updateById(${className} entity) {
        return ${toCamelCase(className)}Mapper.updateById(entity) > 0;
    }

    /**
     * 删除
     */
    @Override
    public boolean removeById(Long id) {
        return ${toCamelCase(className)}Mapper.deleteById(id) > 0;
    }`
}
}
`

    return {
      name: `${className}ServiceImpl.java`,
      path: `service/impl/${className}ServiceImpl.java`,
      content,
      type: 'serviceImpl',
    }
  }

  /**
   * 生成 Controller
   */
  function generateController(
    className: string,
    tableName: string,
    config: GeneratorConfig
  ): GeneratedFile {
    const pathName = tableName.replace(/_/g, '-')

    // 根据返回格式生成不同的代码
    const getResponseType = (type: string) => {
      switch (config.responseStyle) {
        case 'spring-blade':
          return `R<${type}>`
        case 'pigx':
          return `R<${type}>`
        case 'spring-boot':
        default:
          return `ResponseEntity<${type}>`
      }
    }

    const getReturnSuccess = (data: string) => {
      switch (config.responseStyle) {
        case 'spring-blade':
          return `R.data(${data})`
        case 'pigx':
          return `R.ok(${data})`
        case 'spring-boot':
        default:
          return `ResponseEntity.ok(${data})`
      }
    }

    const getImportByResponseStyle = () => {
      switch (config.responseStyle) {
        case 'spring-blade':
          return `import org.springblade.core.tool.api.R;`
        case 'pigx':
          return `import com.pig4cloud.pig.common.core.util.R;`
        case 'spring-boot':
        default:
          return `import org.springframework.http.ResponseEntity;`
      }
    }

    const content = `package ${config.packageName}.controller;

import ${config.packageName}.entity.${className};
import ${config.packageName}.dto.${className}PageReqDto;
import ${config.packageName}.dto.${className}ReqDto;
import ${config.packageName}.service.${className}Service;
import com.baomidou.mybatisplus.core.metadata.IPage;
${config.useSwagger && config.swaggerVersion === 'swagger3' ? `import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;` : ''}
${config.useSwagger && config.swaggerVersion !== 'swagger3' ? `import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;` : ''}
import lombok.RequiredArgsConstructor;
${getImportByResponseStyle()}
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * ${className} Controller
 *
 * @author ${config.author}
 * @date ${new Date().toISOString().split('T')[0]}
 */
@RestController
@RequestMapping("/${pathName}")
@RequiredArgsConstructor
${config.useSwagger && config.swaggerVersion === 'swagger3' ? `@Tag(name = "${className} 接口")` : ''}
${config.useSwagger && config.swaggerVersion !== 'swagger3' ? `@Api(tags = "${className} 接口")` : ''}
public class ${className}Controller {

    private final ${className}Service ${toCamelCase(className)}Service;

    /**
     * 根据 ID 查询
     *
     * @param id
     * @return
     */
    @GetMapping("/{id}")
    ${config.useSwagger ? (config.swaggerVersion === 'swagger3' ? '@Operation(summary = "根据 ID 查询")' : '@ApiOperation("根据 ID 查询")') : ''}
    public ${getResponseType(className)} getById(@PathVariable Long id) {
        return ${getReturnSuccess(`${toCamelCase(className)}Service.getById(id)`)};
    }

    /**
     * 分页查询
     *
     * @param pageReqDto
     * @return
     */
    @GetMapping("/page")
    ${config.useSwagger ? (config.swaggerVersion === 'swagger3' ? '@Operation(summary = "分页查询")' : '@ApiOperation("分页查询")') : ''}
    public ${getResponseType(`IPage<${className}>`)} page(${className}PageReqDto pageReqDto) {
        return ${getReturnSuccess(`${toCamelCase(className)}Service.page(pageReqDto)`)};
    }

    /**
     * 列表查询
     *
     * @param reqDto
     * @return
     */
    @GetMapping("/list")
    ${config.useSwagger ? (config.swaggerVersion === 'swagger3' ? '@Operation(summary = "列表查询")' : '@ApiOperation("列表查询")') : ''}
    public ${getResponseType(`List<${className}>`)} list(${className}ReqDto reqDto) {
        return ${getReturnSuccess(`${toCamelCase(className)}Service.list(reqDto)`)};
    }

    /**
     * 新增
     *
     * @param entity
     * @return
     */
    @PostMapping
    ${config.useSwagger ? (config.swaggerVersion === 'swagger3' ? '@Operation(summary = "新增")' : '@ApiOperation("新增")') : ''}
    public ${getResponseType('Boolean')} save(@RequestBody ${className} entity) {
        return ${getReturnSuccess(`${toCamelCase(className)}Service.save(entity)`)};
    }

    /**
     * 修改
     *
     * @param entity
     * @return
     */
    @PutMapping
    ${config.useSwagger ? (config.swaggerVersion === 'swagger3' ? '@Operation(summary = "修改")' : '@ApiOperation("修改")') : ''}
    public ${getResponseType('Boolean')} updateById(@RequestBody ${className} entity) {
        return ${getReturnSuccess(`${toCamelCase(className)}Service.updateById(entity)`)};
    }

    /**
     * 删除
     *
     * @param id
     * @return
     */
    @DeleteMapping("/{id}")
    ${config.useSwagger ? (config.swaggerVersion === 'swagger3' ? '@Operation(summary = "删除")' : '@ApiOperation("删除")') : ''}
    public ${getResponseType('Boolean')} removeById(@PathVariable Long id) {
        return ${getReturnSuccess(`${toCamelCase(className)}Service.removeById(id)`)};
    }
}
`

    return {
      name: `${className}Controller.java`,
      path: `controller/${className}Controller.java`,
      content,
      type: 'controller',
    }
  }

  /**
   * 生成 DTO 类（SaveReqDto 和 ResDto）
   */
  function generateDto(
    table: TableDefinition,
    className: string,
    config: GeneratorConfig
  ): GeneratedFile[] {
    const files: GeneratedFile[] = []

    // 生成 SaveReqDto（保存请求 DTO，不包含 id 和创建时间等自动字段）
    const saveReqFields = table.fields.filter(f =>
      !f.isAutoIncrement && !['created_at', 'updated_at', 'create_time', 'update_time'].includes(f.name.toLowerCase())
    )

    const saveReqContent = `package ${config.packageName}.dto;

import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;
${hasDateField(saveReqFields) ? (config.dateType === 'LocalDateTime' ? 'import java.time.LocalDateTime;\nimport java.time.LocalDate;\nimport java.time.LocalTime;' : 'import java.util.Date;') : ''}
${hasDecimalField(saveReqFields) ? 'import java.math.BigDecimal;' : ''}

/**
 * ${className} 保存请求 DTO
 *
 * @author ${config.author}
 * @date ${new Date().toISOString().split('T')[0]}
 */
@Getter
@Setter
public class ${className}SaveReqDto implements Serializable {

    private static final long serialVersionUID = 1L;

${saveReqFields.map(f => {
      const javaType = getJavaType(f.type, config.dateType)
      const fieldName = toCamelCase(f.name)
      return `    /**\n     * ${f.comment || f.name}\n     */\n    private ${javaType} ${fieldName};`
    }).join('\n\n')}
}
`

    files.push({
      name: `${className}SaveReqDto.java`,
      path: `dto/${className}SaveReqDto.java`,
      content: saveReqContent,
      type: 'dto',
    })

    // 生成 ResDto（响应 DTO，包含所有字段）
    const resContent = `package ${config.packageName}.dto;

import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;
${hasDateField(table.fields) ? (config.dateType === 'LocalDateTime' ? 'import java.time.LocalDateTime;\nimport java.time.LocalDate;\nimport java.time.LocalTime;' : 'import java.util.Date;') : ''}
${hasDecimalField(table.fields) ? 'import java.math.BigDecimal;' : ''}

/**
 * ${className} 响应 DTO
 *
 * @author ${config.author}
 * @date ${new Date().toISOString().split('T')[0]}
 */
@Getter
@Setter
public class ${className}ResDto implements Serializable {

    private static final long serialVersionUID = 1L;

${table.fields.map(f => {
      const javaType = getJavaType(f.type, config.dateType)
      const fieldName = toCamelCase(f.name)
      return `    /**\n     * ${f.comment || f.name}\n     */\n    private ${javaType} ${fieldName};`
    }).join('\n\n')}
}
`

    files.push({
      name: `${className}ResDto.java`,
      path: `dto/${className}ResDto.java`,
      content: resContent,
      type: 'dto',
    })

    // 生成 PageReqDto（分页查询请求 DTO）
    const pageReqContent = `package ${config.packageName}.dto;

import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;

/**
 * ${className} 分页查询请求 DTO
 *
 * @author ${config.author}
 * @date ${new Date().toISOString().split('T')[0]}
 */
@Getter
@Setter
public class ${className}PageReqDto implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 当前页码
     */
    private Integer pageNum = 1;

    /**
     * 每页数量
     */
    private Integer pageSize = 10;
}
`

    files.push({
      name: `${className}PageReqDto.java`,
      path: `dto/${className}PageReqDto.java`,
      content: pageReqContent,
      type: 'dto',
    })

    // 生成 ReqDto（列表查询请求 DTO，包含常用查询字段）
    const queryFields = table.fields.filter(f =>
      !f.isAutoIncrement &&
      !['id', 'created_at', 'updated_at', 'create_time', 'update_time', 'is_deleted'].includes(f.name.toLowerCase()) &&
      ['varchar', 'char', 'text', 'tinyint', 'int', 'bigint'].includes(f.type.toLowerCase())
    ).slice(0, 5) // 最多取5个字段作为查询条件

    const reqContent = `package ${config.packageName}.dto;

import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;
${hasDateField(queryFields) ? (config.dateType === 'LocalDateTime' ? 'import java.time.LocalDateTime;\nimport java.time.LocalDate;\nimport java.time.LocalTime;' : 'import java.util.Date;') : ''}
${hasDecimalField(queryFields) ? 'import java.math.BigDecimal;' : ''}

/**
 * ${className} 列表查询请求 DTO
 *
 * @author ${config.author}
 * @date ${new Date().toISOString().split('T')[0]}
 */
@Getter
@Setter
public class ${className}ReqDto implements Serializable {

    private static final long serialVersionUID = 1L;

${queryFields.map(f => {
      const javaType = getJavaType(f.type, config.dateType)
      const fieldName = toCamelCase(f.name)
      return `    /**\n     * ${f.comment || f.name}\n     */\n    private ${javaType} ${fieldName};`
    }).join('\n\n')}
}
`

    files.push({
      name: `${className}ReqDto.java`,
      path: `dto/${className}ReqDto.java`,
      content: reqContent,
      type: 'dto',
    })

    return files
  }

  /**
   * 生成目录结构
   */
  function generateDirectoryStructure(
    tables: TableDefinition[],
    config: GeneratorConfig
  ): DirectoryNode {
    const root: DirectoryNode = {
      name: config.packageName,
      type: 'directory',
      children: [],
    }

    // 添加实体类目录
    if (config.generations.includes('entity')) {
      root.children!.push({
        name: 'entity',
        type: 'directory',
        children: tables.map(t => ({
          name: `${toPascalCase(t.name)}.java`,
          type: 'file',
          fileType: 'entity',
        })),
      })
    }

    // 添加 Mapper 目录
    if (config.generations.includes('mapper')) {
      root.children!.push({
        name: 'mapper',
        type: 'directory',
        children: tables.map(t => ({
          name: `${toPascalCase(t.name)}Mapper.java`,
          type: 'file',
          fileType: 'mapper',
        })),
      })
    }

    // 添加 Service 目录
    if (config.generations.includes('service') || config.generations.includes('serviceImpl')) {
      const serviceNode: DirectoryNode = {
        name: 'service',
        type: 'directory',
        children: [],
      }

      if (config.generations.includes('service')) {
        serviceNode.children!.push(...tables.map(t => ({
          name: `${toPascalCase(t.name)}Service.java`,
          type: 'file' as const,
          fileType: 'service' as GenerationType,
        })))
      }

      if (config.generations.includes('serviceImpl')) {
        serviceNode.children!.push({
          name: 'impl',
          type: 'directory',
          children: tables.map(t => ({
            name: `${toPascalCase(t.name)}ServiceImpl.java`,
            type: 'file' as const,
            fileType: 'serviceImpl' as GenerationType,
          })),
        })
      }

      root.children!.push(serviceNode)
    }

    // 添加 Controller 目录
    if (config.generations.includes('controller')) {
      root.children!.push({
        name: 'controller',
        type: 'directory',
        children: tables.map(t => ({
          name: `${toPascalCase(t.name)}Controller.java`,
          type: 'file',
          fileType: 'controller',
        })),
      })
    }

    // 添加 XML 目录
    if (config.generations.includes('xml')) {
      root.children!.push({
        name: 'xml',
        type: 'directory',
        children: tables.map(t => ({
          name: `${toPascalCase(t.name)}Mapper.xml`,
          type: 'file',
          fileType: 'xml',
        })),
      })
    }

    // 添加 DTO 目录
    if (config.generations.includes('dto')) {
      root.children!.push({
        name: 'dto',
        type: 'directory',
        children: tables.flatMap(t => [
          {
            name: `${toPascalCase(t.name)}SaveReqDto.java`,
            type: 'file' as const,
            fileType: 'dto' as const,
          },
          {
            name: `${toPascalCase(t.name)}ResDto.java`,
            type: 'file' as const,
            fileType: 'dto' as const,
          },
          {
            name: `${toPascalCase(t.name)}PageReqDto.java`,
            type: 'file' as const,
            fileType: 'dto' as const,
          },
          {
            name: `${toPascalCase(t.name)}ReqDto.java`,
            type: 'file' as const,
            fileType: 'dto' as const,
          },
        ]),
      })
    }

    return root
  }

  /**
   * 检查字段列表是否包含日期类型
   */
  function hasDateField(fields: SqlField[]): boolean {
    return fields.some(f => ['datetime', 'timestamp', 'date', 'time'].includes(f.type.toLowerCase()))
  }

  /**
   * 检查字段列表是否包含小数类型
   */
  function hasDecimalField(fields: SqlField[]): boolean {
    return fields.some(f => ['decimal', 'numeric'].includes(f.type.toLowerCase()))
  }

  /**
   * 获取 Java 类型
   */
  function getJavaType(sqlType: string, dateType: string): string {
    const lowerType = sqlType.toLowerCase()
    let javaType = MYSQL_TYPE_MAPPING[lowerType] || 'String'

    // 处理日期类型
    if (['datetime', 'timestamp'].includes(lowerType)) {
      javaType = dateType === 'LocalDateTime' ? 'LocalDateTime' : 'Date'
    } else if (lowerType === 'date') {
      javaType = dateType === 'LocalDateTime' ? 'LocalDate' : 'Date'
    } else if (lowerType === 'time') {
      javaType = dateType === 'LocalDateTime' ? 'LocalTime' : 'Date'
    }

    return javaType
  }

  /**
   * 转换为 PascalCase
   */
  function toPascalCase(str: string): string {
    return str
      .split('_')
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
   * 生成 getter/setter 方法
   */
  function generateGettersSetters(fields: SqlField[]): string {
    const methods: string[] = []

    for (const field of fields) {
      const javaType = getJavaType(field.type, 'LocalDateTime')
      const fieldName = toCamelCase(field.name)
      const capitalizedField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1)

      // Getter
      methods.push(`    public ${javaType} get${capitalizedField}() {
        return ${fieldName};
    }`)

      // Setter
      methods.push(`    public void set${capitalizedField}(${javaType} ${fieldName}) {
        this.${fieldName} = ${fieldName};
    }`)
    }

    return '\n\n' + methods.join('\n\n')
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
   * 生成所有代码的完整文本
   */
  function generateAllCode(files: GeneratedFile[]): string {
    return files.map(f => f.content).join('\n\n')
  }

  return {
    generateCode,
    copyToClipboard,
    generateAllCode,
  }
}
