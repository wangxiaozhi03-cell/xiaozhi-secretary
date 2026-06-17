export type SqlDialect = "sql" | "mysql" | "postgresql" | "mariadb";
export type KeywordCase = "upper" | "lower" | "preserve";
export type IndentStyle = "standard" | "tabularLeft" | "tabularRight";

export interface SqlFormatOptions {
  dialect: SqlDialect;
  tabWidth: number;
  keywordCase: KeywordCase;
  indentStyle: IndentStyle;
}

export const DEFAULT_OPTIONS: SqlFormatOptions = {
  dialect: "mysql",
  tabWidth: 2,
  keywordCase: "upper",
  indentStyle: "standard",
};

export const DIALECT_LABELS: Record<SqlDialect, string> = {
  sql: "Standard SQL",
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  mariadb: "MariaDB",
};

export const EXAMPLE_SQL = `-- 用户订单统计查询
SELECT u.id, u.username, u.email,
  COUNT(o.id) AS order_count,
  SUM(o.total_amount) AS total_spent,
  MAX(o.created_at) AS last_order
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
  AND o.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.id, u.username, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_spent DESC
LIMIT 100;

-- 商品库存更新
UPDATE products p
INNER JOIN order_items oi ON p.id = oi.product_id
SET p.stock = p.stock - oi.quantity,
    p.updated_at = NOW()
WHERE oi.order_id IN (
  SELECT id FROM orders
  WHERE status = 'confirmed'
    AND processed = 0
);`;
