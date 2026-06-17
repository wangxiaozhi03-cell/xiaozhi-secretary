import { ref, computed, watch } from "vue";
import { format, type SqlLanguage } from "sql-formatter";
import type { SqlFormatOptions, SqlDialect } from "./types";
import { DEFAULT_OPTIONS, DIALECT_LABELS, EXAMPLE_SQL } from "./types";

export function useSqlFormatter() {
  const input = ref("");
  const output = ref("");
  const errorMsg = ref("");
  const options = ref<SqlFormatOptions>({ ...DEFAULT_OPTIONS });

  // SQL 方言映射到 sql-formatter 语言
  const dialectMap: Record<SqlDialect, SqlLanguage> = {
    sql: "sql",
    mysql: "mysql",
    postgresql: "postgresql",
    mariadb: "mariadb",
  };

  function formatSql() {
    errorMsg.value = "";
    const sql = input.value.trim();
    if (!sql) { output.value = ""; return; }
    try {
      output.value = format(sql, {
        language: dialectMap[options.value.dialect],
        tabWidth: options.value.tabWidth,
        keywordCase: options.value.keywordCase,
        indentStyle: options.value.indentStyle,
        linesBetweenQueries: 2,
      });
    } catch (e: unknown) {
      errorMsg.value = e instanceof Error ? e.message : "格式化失败";
    }
  }

  function minifySql() {
    errorMsg.value = "";
    const sql = input.value.trim();
    if (!sql) { output.value = ""; return; }
    try {
      // 先格式化再压缩
      const formatted = format(sql, {
        language: dialectMap[options.value.dialect],
        tabWidth: 0,
        keywordCase: options.value.keywordCase,
        linesBetweenQueries: 1,
      });
      // 移除注释，压缩空白
      output.value = formatted
        .replace(/--.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\s+/g, " ")
        .replace(/\s*([,;()])\s*/g, "$1")
        .replace(/\(\s+/g, "(")
        .replace(/\s+\)/g, ")")
        .trim();
    } catch (e: unknown) {
      errorMsg.value = e instanceof Error ? e.message : "压缩失败";
    }
  }

  function loadExample() {
    input.value = EXAMPLE_SQL;
    formatSql();
  }

  function clearAll() {
    input.value = "";
    output.value = "";
    errorMsg.value = "";
  }

  // SQL 语法高亮 tokenizer
  function highlightSql(sql: string): string {
    if (!sql) return "";
    // 按优先级匹配：注释 > 字符串 > 数字 > 关键字/函数 > 运算符 > 普通文本
    const re = /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\b\d+\.?\d*(?:[eE][+-]?\d+)?\b)|(\b(?:SELECT|FROM|WHERE|AND|OR|NOT|IN|ON|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|IF|EXISTS|BETWEEN|LIKE|IS|NULL|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|CASE|WHEN|THEN|ELSE|END|ASC|DESC|WITH|RECURSIVE|BEGIN|COMMIT|ROLLBACK|GRANT|REVOKE|TRUNCATE|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|DEFAULT|AUTO_INCREMENT|ENGINE|CHARSET|COLLATE|COMMENT|UNSIGNED|VARCHAR|CHAR|INT|BIGINT|SMALLINT|TINYINT|DECIMAL|FLOAT|DOUBLE|DATE|DATETIME|TIMESTAMP|TEXT|BLOB|BOOLEAN|ENUM|TRUE|FALSE)\b)|(\b(?:COUNT|SUM|AVG|MIN|MAX|COALESCE|IFNULL|NULLIF|CONCAT|SUBSTRING|TRIM|UPPER|LOWER|NOW|CURDATE|DATE_FORMAT|DATEDIFF|DATE_ADD|DATE_SUB|CAST|CONVERT|REPLACE|LENGTH|ROUND|CEIL|FLOOR|GROUP_CONCAT|ROW_NUMBER|RANK|DENSE_RANK)\b)|(<=|>=|<>|!=|=|<|>)|(\s+)|([^\s])/gi;

    let result = "";
    let match: RegExpExecArray | null;
    while ((match = re.exec(sql)) !== null) {
      const text = escapeHtml(match[0]);
      if (match[1]) result += `<span class="sql-comment">${text}</span>`;
      else if (match[2]) result += `<span class="sql-string">${text}</span>`;
      else if (match[3]) result += `<span class="sql-number">${text}</span>`;
      else if (match[4]) result += `<span class="sql-keyword">${text}</span>`;
      else if (match[5]) result += `<span class="sql-function">${text}</span>`;
      else if (match[6]) result += `<span class="sql-operator">${text}</span>`;
      else if (match[7]) result += text; // whitespace
      else if (match[8]) result += `<span class="sql-text">${text}</span>`;
    }
    return result;
  }

  function escapeHtml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // 自动格式化（防抖）
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  watch(input, () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    if (!input.value.trim()) { output.value = ""; return; }
    debounceTimer = setTimeout(formatSql, 300);
  });

  const lineCount = computed(() => {
    if (!input.value) return 1;
    return input.value.split("\n").length;
  });

  const outputLineCount = computed(() => {
    if (!output.value) return 0;
    return output.value.split("\n").length;
  });

  const charCount = computed(() => input.value.length);
  const dialectLabel = computed(() => DIALECT_LABELS[options.value.dialect]);

  return {
    input,
    output,
    errorMsg,
    options,
    lineCount,
    outputLineCount,
    charCount,
    dialectLabel,
    formatSql,
    minifySql,
    loadExample,
    clearAll,
    highlightSql,
  };
}
