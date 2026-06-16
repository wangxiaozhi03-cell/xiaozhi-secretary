/**
 * Java 代码生成工具类型定义
 */

// SQL 字段定义
export interface SqlField {
  name: string
  type: string
  length?: number
  precision?: number
  scale?: number
  nullable: boolean
  isPrimary: boolean
  isAutoIncrement: boolean
  defaultValue?: string
  comment?: string
}

// 表定义
export interface TableDefinition {
  name: string
  comment?: string
  fields: SqlField[]
  indexes?: TableIndex[]
  foreignKeys?: ForeignKey[]
}

// 表索引
export interface TableIndex {
  name: string
  fields: string[]
  isUnique: boolean
}

// 外键关系
export interface ForeignKey {
  name: string
  field: string
  referencedTable: string
  referencedField: string
}

// 表关系
export interface TableRelation {
  fromTable: string
  fromField: string
  toTable: string
  toField: string
  type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'
}

// 数据库类型
export type DatabaseType = 'mysql' | 'postgresql'

// ORM 类型
export type OrmType = 'mybatis' | 'mybatis-plus' | 'jpa'

// 日期类型
export type DateType = 'LocalDateTime' | 'Date'

// Swagger 版本
export type SwaggerVersion = 'swagger2' | 'swagger3' | 'knife4j' | 'none'

// Controller 返回格式
export type ResponseStyle = 'spring-blade' | 'pigx' | 'spring-boot' | 'custom'

// 生成内容类型
export type GenerationType =
  | 'entity'
  | 'mapper'
  | 'service'
  | 'serviceImpl'
  | 'controller'
  | 'xml'
  | 'dto'

// 代码生成配置
export interface GeneratorConfig {
  packageName: string
  moduleName: string
  author: string
  dateType: DateType
  ormType: OrmType
  swaggerVersion: SwaggerVersion
  responseStyle: ResponseStyle
  generations: GenerationType[]
  useLombok: boolean
  useSwagger: boolean
  useRestController: boolean
  useBaseEntity: boolean
  baseEntityPackage?: string
  tablePrefix?: string
}

// 生成的代码文件
export interface GeneratedFile {
  name: string
  path: string
  content: string
  type: GenerationType
}

// 代码生成结果
export interface GenerationResult {
  files: GeneratedFile[]
  directoryStructure: DirectoryNode
}

// 目录树节点
export interface DirectoryNode {
  name: string
  type: 'file' | 'directory'
  children?: DirectoryNode[]
  fileType?: GenerationType
}

// SQL 解析结果
export interface SqlParseResult {
  tables: TableDefinition[]
  relations: TableRelation[]
  errors: SqlParseError[]
}

// SQL 解析错误
export interface SqlParseError {
  line?: number
  message: string
  severity: 'error' | 'warning'
}

// JSON 字段信息
export interface JsonFieldInfo {
  name: string
  type: string
  javaType: string
  comment?: string
  isArray: boolean
  isNested: boolean
  nestedFields?: JsonFieldInfo[]
}

// JSON 转 DTO 配置
export interface JsonToDtoConfig {
  className: string
  packageName: string
  author: string
  useLombok: boolean
  useSwagger: boolean
  swaggerVersion: SwaggerVersion
  extendPageLimit: boolean
  numberType: 'Long' | 'Integer' | 'auto'
}

// 生成模式
export type GeneratorMode = 'sql-to-java' | 'json-to-dto'

// 类型映射规则
export type TypeMapping = Record<string, string>

// 默认 MySQL 类型映射
export const MYSQL_TYPE_MAPPING: TypeMapping = {
  'bigint': 'Long',
  'int': 'Integer',
  'integer': 'Integer',
  'smallint': 'Integer',
  'tinyint': 'Boolean',
  'mediumint': 'Integer',
  'float': 'Float',
  'double': 'Double',
  'decimal': 'BigDecimal',
  'numeric': 'BigDecimal',
  'varchar': 'String',
  'char': 'String',
  'text': 'String',
  'tinytext': 'String',
  'mediumtext': 'String',
  'longtext': 'String',
  'json': 'String',
  'date': 'LocalDate',
  'datetime': 'LocalDateTime',
  'timestamp': 'LocalDateTime',
  'time': 'LocalTime',
  'year': 'Integer',
  'boolean': 'Boolean',
  'bool': 'Boolean',
  'blob': 'byte[]',
  'tinyblob': 'byte[]',
  'mediumblob': 'byte[]',
  'longblob': 'byte[]',
  'binary': 'byte[]',
  'varbinary': 'byte[]',
  'enum': 'String',
  'set': 'String',
}

// 默认 PostgreSQL 类型映射
export const PG_TYPE_MAPPING: TypeMapping = {
  'bigint': 'Long',
  'int8': 'Long',
  'bigserial': 'Long',
  'serial8': 'Long',
  'integer': 'Integer',
  'int': 'Integer',
  'int4': 'Integer',
  'serial': 'Integer',
  'serial4': 'Integer',
  'smallint': 'Integer',
  'int2': 'Integer',
  'smallserial': 'Integer',
  'serial2': 'Integer',
  'decimal': 'BigDecimal',
  'numeric': 'BigDecimal',
  'real': 'Float',
  'float4': 'Float',
  'double precision': 'Double',
  'float8': 'Double',
  'varchar': 'String',
  'character varying': 'String',
  'char': 'String',
  'character': 'String',
  'text': 'String',
  'json': 'String',
  'jsonb': 'String',
  'uuid': 'String',
  'date': 'LocalDate',
  'timestamp': 'LocalDateTime',
  'timestamptz': 'LocalDateTime',
  'timestamp with time zone': 'LocalDateTime',
  'timestamp without time zone': 'LocalDateTime',
  'time': 'LocalTime',
  'timetz': 'LocalTime',
  'time with time zone': 'LocalTime',
  'time without time zone': 'LocalTime',
  'boolean': 'Boolean',
  'bool': 'Boolean',
  'bytea': 'byte[]',
}
