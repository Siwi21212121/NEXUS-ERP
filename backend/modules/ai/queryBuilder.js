const QUERY_CATALOG = {
  revenue: {
    requiredTables: ["finance_transactions"],
    usesDateRange: true,
    sql: `
      SELECT COALESCE(SUM(amount), 0) AS revenue
      FROM finance_transactions
      WHERE transaction_type = 'REVENUE'
        AND transaction_date BETWEEN $1::date AND $2::date
    `,
  },
  expenses: {
    requiredTables: ["finance_transactions"],
    usesDateRange: true,
    sql: `
      SELECT COALESCE(SUM(amount), 0) AS expenses
      FROM finance_transactions
      WHERE transaction_type = 'EXPENSE'
        AND transaction_date BETWEEN $1::date AND $2::date
    `,
  },
  profit: {
    requiredTables: ["finance_transactions"],
    usesDateRange: true,
    sql: `
      SELECT
        COALESCE(SUM(CASE WHEN transaction_type = 'REVENUE' THEN amount ELSE 0 END), 0) AS revenue,
        COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expenses
      FROM finance_transactions
      WHERE transaction_date BETWEEN $1::date AND $2::date
    `,
  },
  cash_flow: {
    requiredTables: ["finance_transactions"],
    usesDateRange: true,
    sql: `
      SELECT
        TO_CHAR(DATE_TRUNC('month', transaction_date), 'MON') AS label,
        COALESCE(SUM(CASE WHEN transaction_type = 'REVENUE' THEN amount ELSE 0 END), 0) AS inflow,
        COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS outflow
      FROM finance_transactions
      WHERE transaction_date BETWEEN $1::date AND $2::date
      GROUP BY DATE_TRUNC('month', transaction_date)
      ORDER BY DATE_TRUNC('month', transaction_date)
    `,
  },
  inventory_low: {
    requiredTables: ["inventory_products", "inventory_stock"],
    sql: `
      SELECT p.sku, p.name, p.reorder_level AS "reorderLevel",
        COALESCE(SUM(s.quantity), 0)::INTEGER AS stock
      FROM inventory_products p
      LEFT JOIN inventory_stock s ON s.product_id = p.id
      WHERE p.is_active = TRUE
      GROUP BY p.id
      HAVING COALESCE(SUM(s.quantity), 0) <= p.reorder_level
      ORDER BY stock ASC
      LIMIT 10
    `,
  },
  inventory: {
    requiredTables: ["inventory_products", "inventory_stock"],
    sql: `
      SELECT COUNT(DISTINCT p.id)::INTEGER AS products,
        COALESCE(SUM(s.quantity * p.unit_cost), 0) AS value,
        COALESCE(SUM(s.quantity), 0)::INTEGER AS units
      FROM inventory_products p
      LEFT JOIN inventory_stock s ON s.product_id = p.id
      WHERE p.is_active = TRUE
    `,
  },
  top_products: {
    requiredTables: ["inventory_products", "inventory_stock"],
    sql: `
      SELECT p.name, COALESCE(SUM(s.quantity), 0)::INTEGER AS value
      FROM inventory_products p
      LEFT JOIN inventory_stock s ON s.product_id = p.id
      WHERE p.is_active = TRUE
      GROUP BY p.id, p.name
      ORDER BY value DESC
      LIMIT 10
    `,
  },
  purchase_orders: {
    requiredTables: ["procurement_orders"],
    sql: `
      SELECT status, COUNT(*)::INTEGER AS count, COALESCE(SUM(total_cost), 0) AS cost
      FROM procurement_orders
      GROUP BY status
      ORDER BY status
    `,
  },
  top_vendors: {
    requiredTables: ["procurement_vendors"],
    sql: `
      SELECT name, rating, on_time_delivery_pct AS "deliveryPerformance", quality_score AS "qualityScore"
      FROM procurement_vendors
      ORDER BY rating DESC, on_time_delivery_pct DESC
      LIMIT 10
    `,
  },
  employee_count: {
    requiredTables: ["hr_employees"],
    sql: `
      SELECT COUNT(*)::INTEGER AS employees
      FROM hr_employees
      WHERE employment_status <> 'TERMINATED'
    `,
  },
  attendance_today: {
    requiredTables: ["hr_attendance"],
    sql: `
      SELECT status, COUNT(*)::INTEGER AS count
      FROM hr_attendance
      WHERE attendance_date = CURRENT_DATE
      GROUP BY status
      ORDER BY status
    `,
  },
  leave_today: {
    requiredTables: ["hr_leave_requests"],
    sql: `
      SELECT status, COUNT(*)::INTEGER AS count
      FROM hr_leave_requests
      WHERE CURRENT_DATE BETWEEN start_date AND end_date
      GROUP BY status
      ORDER BY status
    `,
  },
  payroll: {
    requiredTables: ["hr_payroll_runs"],
    sql: `
      SELECT status, COUNT(*)::INTEGER AS count, COALESCE(SUM(net_pay), 0) AS amount
      FROM hr_payroll_runs
      GROUP BY status
      ORDER BY status
    `,
  },
  top_customers: {
    requiredTables: ["finance_invoices"],
    sql: `
      SELECT customer_name AS name, COALESCE(SUM(total_amount), 0) AS value
      FROM finance_invoices
      GROUP BY customer_name
      ORDER BY value DESC
      LIMIT 10
    `,
  },
  notifications: {
    requiredTables: ["module_notifications"],
    sql: `
      SELECT module, title, message, severity, created_at AS "createdAt"
      FROM module_notifications
      ORDER BY created_at DESC
      LIMIT 10
    `,
  },
};

function buildQuery(intent, dateRange) {
  const query = QUERY_CATALOG[intent] || QUERY_CATALOG.company_kpis;
  if (!query) return null;

  return {
    ...query,
    values: query.usesDateRange ? [dateRange.startDate, dateRange.endDate] : [],
  };
}

module.exports = {
  QUERY_CATALOG,
  buildQuery,
};
