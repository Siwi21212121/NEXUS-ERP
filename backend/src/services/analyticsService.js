const pool = require("../config/db");
const financeService = require("./financeService");
const inventoryService = require("./inventoryService");
const procurementService = require("./procurementService");
const hrService = require("./hrService");

async function tableExists(tableName) {
  const result = await pool.query("SELECT to_regclass($1) AS table_name", [tableName]);
  return Boolean(result.rows[0]?.table_name);
}

async function queryOrDefault(tableName, sql, fallback) {
  if (!(await tableExists(tableName))) return fallback;
  const result = await pool.query(sql);
  return result.rows;
}

async function getExecutiveAnalytics() {
  await warmModuleSchemas();

  const financeRows = await queryOrDefault(
    "finance_transactions",
    `
    SELECT
      COALESCE(SUM(CASE WHEN transaction_type = 'REVENUE' THEN amount ELSE 0 END), 0) AS revenue,
      COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expenses
    FROM finance_transactions
    `,
    [{ revenue: 0, expenses: 0 }]
  );

  const revenueTrend = await queryOrDefault(
    "finance_transactions",
    `
    SELECT TO_CHAR(DATE_TRUNC('month', transaction_date), 'MON') AS month,
      COALESCE(SUM(CASE WHEN transaction_type = 'REVENUE' THEN amount ELSE 0 END), 0) AS revenue,
      COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS expenses
    FROM finance_transactions
    GROUP BY DATE_TRUNC('month', transaction_date)
    ORDER BY DATE_TRUNC('month', transaction_date)
    `,
    []
  );

  const employees = await queryOrDefault(
    "hr_employees",
    "SELECT COUNT(*)::INTEGER AS total FROM hr_employees WHERE employment_status <> 'TERMINATED'",
    [{ total: 0 }]
  );

  const topDepartments = await queryOrDefault(
    "hr_employees",
    `
    SELECT COALESCE(d.name, 'Unassigned') AS name, COUNT(e.id)::INTEGER AS value
    FROM hr_employees e
    LEFT JOIN hr_departments d ON d.id = e.department_id
    WHERE e.employment_status <> 'TERMINATED'
    GROUP BY d.name
    ORDER BY value DESC
    LIMIT 5
    `,
    []
  );

  const inventory = await queryOrDefault(
    "inventory_stock",
    `
    SELECT COALESCE(SUM(s.quantity * p.unit_cost), 0) AS value,
      COALESCE(SUM(s.quantity), 0) AS units
    FROM inventory_stock s
    JOIN inventory_products p ON p.id = s.product_id
    `,
    [{ value: 0, units: 0 }]
  );

  const topProducts = await queryOrDefault(
    "inventory_movements",
    `
    SELECT p.name, COALESCE(SUM(m.quantity), 0)::INTEGER AS value
    FROM inventory_products p
    JOIN inventory_movements m ON m.product_id = p.id
    WHERE m.movement_type = 'DISPATCH'
    GROUP BY p.id, p.name
    ORDER BY value DESC
    LIMIT 5
    `,
    []
  );

  const procurement = await queryOrDefault(
    "procurement_orders",
    "SELECT COALESCE(SUM(total_cost), 0) AS cost, COUNT(*)::INTEGER AS orders FROM procurement_orders",
    [{ cost: 0, orders: 0 }]
  );

  const topVendors = await queryOrDefault(
    "procurement_vendors",
    `
    SELECT name, rating AS value
    FROM procurement_vendors
    ORDER BY rating DESC
    LIMIT 5
    `,
    []
  );

  const topCustomers = await queryOrDefault(
    "finance_invoices",
    `
    SELECT customer_name AS name, COALESCE(SUM(total_amount), 0) AS value
    FROM finance_invoices
    GROUP BY customer_name
    ORDER BY value DESC
    LIMIT 5
    `,
    []
  );

  const customerGrowth = await queryOrDefault(
    "finance_invoices",
    `
    SELECT TO_CHAR(DATE_TRUNC('month', invoice_date), 'MON') AS month,
      COUNT(DISTINCT customer_name)::INTEGER AS customers,
      COALESCE(SUM(total_amount), 0) AS revenue
    FROM finance_invoices
    GROUP BY DATE_TRUNC('month', invoice_date)
    ORDER BY DATE_TRUNC('month', invoice_date)
    `,
    []
  );

  const finance = financeRows[0] || {};
  const revenue = Number(finance.revenue || 0);
  const expenses = Number(finance.expenses || 0);
  const profit = revenue - expenses;
  const inventoryUnits = Number(inventory[0]?.units || 0);
  const procurementCost = Number(procurement[0]?.cost || 0);

  return {
    kpis: {
      revenue,
      expenses,
      employees: Number(employees[0]?.total || 0),
      inventoryValue: Number(inventory[0]?.value || 0),
      procurementCost,
      customerGrowth: calculateGrowth(customerGrowth, "customers"),
      profitMargin: revenue > 0 ? Math.round((profit / revenue) * 100) : 0,
      revenueGrowth: calculateGrowth(revenueTrend, "revenue"),
      inventoryTurnover: inventoryUnits > 0 ? Number((revenue / inventoryUnits).toFixed(2)) : 0,
      employeeProductivity: Number(employees[0]?.total || 0) > 0
        ? Math.round(revenue / Number(employees[0]?.total || 1))
        : 0,
      customerSatisfaction: topVendors.length
        ? Math.round(topVendors.reduce((sum, item) => sum + Number(item.value || 0), 0) / topVendors.length * 20)
        : 0,
    },
    charts: {
      revenueTrend: revenueTrend.map((row) => ({
        month: row.month,
        revenue: Number(row.revenue || 0),
        expenses: Number(row.expenses || 0),
      })),
      moduleMix: [
        { name: "Revenue", value: revenue },
        { name: "Expenses", value: expenses },
        { name: "Inventory", value: Number(inventory[0]?.value || 0) },
        { name: "Procurement", value: procurementCost },
      ],
      heatmap: buildHeatmap(revenueTrend),
      topProducts: topProducts.map((row) => ({ ...row, value: Number(row.value || 0) })),
      topVendors: topVendors.map((row) => ({ ...row, value: Number(row.value || 0) })),
      topDepartments,
      topCustomers: topCustomers.map((row) => ({ ...row, value: Number(row.value || 0) })),
      customerGrowth: customerGrowth.map((row) => ({
        month: row.month,
        customers: Number(row.customers || 0),
        revenue: Number(row.revenue || 0),
      })),
    },
  };
}

async function warmModuleSchemas() {
  await Promise.allSettled([
    financeService.getFinanceDashboardData(),
    inventoryService.getInventoryDashboardData(),
    procurementService.getDashboardData(),
    hrService.getDashboardData(),
  ]);
}

function calculateGrowth(rows, field) {
  if (!rows.length) return 0;
  const first = Number(rows[0]?.[field] || 0);
  const last = Number(rows[rows.length - 1]?.[field] || 0);
  if (first <= 0) return last > 0 ? 100 : 0;
  return Math.round(((last - first) / first) * 100);
}

function buildHeatmap(rows) {
  return rows.map((row, index) => ({
    label: row.month || `P${index + 1}`,
    value: Number(row.revenue || 0) - Number(row.expenses || 0),
  }));
}

module.exports = {
  getExecutiveAnalytics,
};
