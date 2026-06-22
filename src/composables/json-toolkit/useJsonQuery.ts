import { ref, computed } from "vue";
import { JSONPath } from "jsonpath-plus";
import jmespath from "jmespath";
import { safeParse } from "./safeParse";

export interface QueryResult {
  path: string;
  value: unknown;
}

export function useJsonQuery() {
  const queryExpr = ref("");
  const queryError = ref("");
  const queryResults = ref<QueryResult[]>([]);
  const queryMode = ref<"jsonpath" | "jmespath">("jsonpath");

  const hasResults = computed(() => queryResults.value.length > 0);
  const resultCount = computed(() => queryResults.value.length);

  function executeQuery(jsonString: string): QueryResult[] {
    queryError.value = "";
    queryResults.value = [];
    const expr = queryExpr.value.trim();
    if (!expr || !jsonString.trim()) return [];

    let parsed: unknown;
    try {
      parsed = safeParse(jsonString);
    } catch {
      queryError.value = "无效的 JSON";
      return [];
    }

    if (queryMode.value === "jsonpath") {
      return executeJsonPath(parsed, expr);
    } else {
      return executeJmesPath(parsed, expr);
    }
  }

  function executeJsonPath(data: unknown, expr: string): QueryResult[] {
    try {
      const results = JSONPath({
        path: expr,
        json: data as object,
        resultType: "all",
      });

      const mapped: QueryResult[] = (results as Array<{ path: string; value: unknown }>).map(
        (r) => ({
          path: r.path,
          value: r.value,
        })
      );

      queryResults.value = mapped;
      return mapped;
    } catch (e: unknown) {
      queryError.value = e instanceof Error ? e.message : "JSONPath 表达式无效";
      return [];
    }
  }

  function executeJmesPath(data: unknown, expr: string): QueryResult[] {
    try {
      const result = jmespath.search(data, expr);
      if (result !== undefined && result !== null) {
        const mapped: QueryResult[] = Array.isArray(result)
          ? result.map((v, i) => ({ path: `$[${i}]`, value: v }))
          : [{ path: "$", value: result }];
        queryResults.value = mapped;
        return mapped;
      }
      queryResults.value = [];
      return [];
    } catch (e: unknown) {
      queryError.value = e instanceof Error ? e.message : "JMESPath 表达式无效";
      return [];
    }
  }

  function clearQuery() {
    queryExpr.value = "";
    queryError.value = "";
    queryResults.value = [];
  }

  return {
    queryExpr,
    queryError,
    queryResults,
    queryMode,
    hasResults,
    resultCount,
    executeQuery,
    clearQuery,
  };
}
