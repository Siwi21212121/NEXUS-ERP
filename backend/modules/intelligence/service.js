const pool = require("../../src/config/db");
const analyticsService = require("../../src/services/analyticsService");
const financeService = require("../../src/services/financeService");
const hrService = require("../../src/services/hrService");
const inventoryService = require("../../src/services/inventoryService");
const procurementService = require("../../src/services/procurementService");
const { buildContext } = require("./engines/contextEngine");
const { observe } = require("./engines/observationEngine");
const { analyzeKpis } = require("./engines/kpiAnalyzer");
const { predict } = require("./engines/predictionEngine");
const { detectRisks } = require("./engines/riskIntelligenceEngine");
const { detectOpportunities } = require("./engines/opportunityEngine");
const { calculateHealth } = require("./engines/businessHealthEngine");
const { simulate } = require("./engines/simulationEngine");
const { explain } = require("./engines/explainabilityEngine");
const { createAlerts } = require("./engines/alertEngine");
const { recommend } = require("./engines/recommendationEngine");
const { generateSummary } = require("./engines/reportGenerator");
const { learn } = require("./engines/learningEngine");

let schemaReady = false;

const ACCESS = {
  executive: ["OWNER"],
  analytics: ["OWNER"],
  finance: ["OWNER", "FINANCE_MANAGER"],
  hr: ["OWNER", "HR_MANAGER"],
  inventory: ["OWNER", "PROJECT_MANAGER"],
  procurement: ["OWNER", "PROJECT_MANAGER"],
  crm: ["OWNER", "FINANCE_MANAGER"],
};

async function ensureSchema() {
  if (schemaReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS enterprise_intelligence_observations (
      id BIGSERIAL PRIMARY KEY,
      module VARCHAR(60) NOT NULL,
      role VARCHAR(60),
      health_score INTEGER,
      insight JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_enterprise_intelligence_module_created
      ON enterprise_intelligence_observations(module, created_at DESC);
  `);
  schemaReady = true;
}

async function getIntelligence(moduleKey, user) {
  await ensureSchema();
  assertAccess(moduleKey, user);
  const rawData = await collectModuleData(moduleKey);
  const context = buildContext(moduleKey, rawData, user);
  const observations = observe(context);
  const kpis = analyzeKpis(context);
  const predictions = predict(context);
  const risks = detectRisks(context, kpis, predictions);
  const opportunities = detectOpportunities(context, kpis, predictions);
  const health = calculateHealth(context, kpis, risks);
  const recommendations = recommend(context, risks, opportunities, predictions);
  const explanations = explain(context, kpis, predictions);
  const alerts = createAlerts(risks, predictions);
  const report = generateSummary(context, health, risks, opportunities);
  const payload = {
    module: moduleKey,
    context: {
      role: context.role,
      observedAt: context.observedAt,
      filters: context.filters,
      dataSources: Object.keys(rawData),
    },
    dashboardSummary: report.summary,
    observations,
    kpis,
    predictions,
    risks,
    opportunities,
    recommendations,
    explanations,
    alerts,
    businessHealth: health,
    report,
  };
  payload.learning = learn(context, payload);
  await logObservation(moduleKey, user, payload);
  return payload;
}

async function runSimulation(moduleKey, scenario, user) {
  await ensureSchema();
  assertAccess(moduleKey, user);
  const rawData = await collectModuleData(moduleKey);
  const context = buildContext(moduleKey, rawData, user);
  return simulate(context, scenario);
}

function assertAccess(moduleKey, user) {
  const role = user?.role || "EMPLOYEE";
  const allowed = ACCESS[moduleKey] || ACCESS.executive;
  if (!allowed.includes(role)) {
    const error = new Error(`Access denied. ${role} cannot view ${moduleKey} intelligence.`);
    error.statusCode = 403;
    throw error;
  }
}

async function collectModuleData(moduleKey) {
  if (moduleKey === "finance") {
    const [dashboard, profitLoss, cashFlow, budgets, invoices, payments] = await Promise.all([
      financeService.getFinanceDashboardData(),
      financeService.getProfitAndLoss(),
      financeService.getCashFlowStatement(),
      financeService.listBudgets(),
      financeService.listInvoices(),
      financeService.listPayments(),
    ]);
    return {
      ...dashboard,
      cards: { ...dashboard.cards, ...profitLoss, netCashFlow: cashFlow.netCashFlow },
      tables: { budgets, invoices, payments },
      history: { previous: await getFinancePrevious() },
    };
  }

  if (moduleKey === "hr") {
    const [dashboard, attendance, leaves, payroll] = await Promise.all([
      hrService.getDashboardData(),
      hrService.getAttendanceSummary(),
      hrService.listLeaves(),
      hrService.getMonthlyPayroll(),
    ]);
    return {
      ...dashboard,
      charts: {
        departmentDistribution: dashboard.departmentDistribution,
        attendanceTrend: dashboard.attendanceTrend,
        joiningTrend: dashboard.joiningTrend,
      },
      tables: { attendance, leaves, payroll },
      history: { previous: await getHrPrevious() },
    };
  }

  if (moduleKey === "inventory") {
    const [dashboard, alerts, products, movements] = await Promise.all([
      inventoryService.getInventoryDashboardData(),
      inventoryService.getLowStockAlerts(),
      inventoryService.listProducts({ page: 1, limit: 10, offset: 0, search: "", categoryId: null }),
      inventoryService.listMovements(),
    ]);
    return {
      ...dashboard,
      tables: { alerts, products: products.data, movements },
      history: { previous: await getInventoryPrevious() },
    };
  }

  if (moduleKey === "procurement") {
    const [dashboard, vendors, requests, orders] = await Promise.all([
      procurementService.getDashboardData(),
      procurementService.listVendors(),
      procurementService.listRequests(),
      procurementService.listOrders(),
    ]);
    return {
      ...dashboard,
      tables: { vendors, requests, orders },
      history: { previous: await getProcurementPrevious() },
    };
  }

  if (moduleKey === "crm") {
    return getCrmData();
  }

  const executive = await analyticsService.getExecutiveAnalytics();
  return {
    cards: executive.kpis,
    charts: executive.charts,
    ...executive,
    history: { previous: {} },
  };
}

async function getFinancePrevious() {
  const rows = await queryIfTable("finance_transactions", `
    SELECT
      COALESCE(SUM(CASE WHEN transaction_type = 'REVENUE' THEN amount ELSE 0 END), 0) AS "totalRevenue",
      COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS "totalExpenses"
    FROM finance_transactions
    WHERE transaction_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
      AND transaction_date < DATE_TRUNC('month', CURRENT_DATE)
  `);
  const row = rows[0] || {};
  return { totalRevenue: Number(row.totalRevenue || 0), totalExpenses: Number(row.totalExpenses || 0) };
}

async function getHrPrevious() {
  const rows = await queryIfTable("hr_employees", `
    SELECT COUNT(*)::INTEGER AS "totalEmployees"
    FROM hr_employees
    WHERE employment_status <> 'TERMINATED'
      AND created_at < DATE_TRUNC('month', CURRENT_DATE)
  `);
  return { totalEmployees: Number(rows[0]?.totalEmployees || 0) };
}

async function getInventoryPrevious() {
  const rows = await queryIfTable("inventory_stock", `
    SELECT COALESCE(SUM(s.quantity * p.unit_cost), 0) AS "inventoryValue"
    FROM inventory_stock s
    JOIN inventory_products p ON p.id = s.product_id
    WHERE s.updated_at < DATE_TRUNC('month', CURRENT_DATE)
  `);
  return { inventoryValue: Number(rows[0]?.inventoryValue || 0) };
}

async function getProcurementPrevious() {
  const rows = await queryIfTable("procurement_orders", `
    SELECT COALESCE(SUM(total_cost), 0) AS "purchaseCost"
    FROM procurement_orders
    WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
      AND created_at < DATE_TRUNC('month', CURRENT_DATE)
  `);
  return { purchaseCost: Number(rows[0]?.purchaseCost || 0) };
}

async function getCrmData() {
  const customers = await queryIfTable("finance_invoices", `
    SELECT customer_name AS name, COALESCE(SUM(total_amount), 0) AS value, COUNT(*)::INTEGER AS orders
    FROM finance_invoices
    GROUP BY customer_name
    ORDER BY value DESC
    LIMIT 20
  `);
  const revenue = customers.reduce((sum, item) => sum + Number(item.value || 0), 0);
  return {
    cards: {
      customers: customers.length,
      customerRevenue: revenue,
      averageOrderValue: customers.length ? Math.round(revenue / customers.length) : 0,
    },
    charts: { topCustomers: customers },
    tables: { customers },
    history: { previous: {} },
  };
}

async function queryIfTable(tableName, sql) {
  const exists = await pool.query("SELECT to_regclass($1) AS table_name", [tableName]);
  if (!exists.rows[0]?.table_name) return [];
  const result = await pool.query(sql);
  return result.rows;
}

async function logObservation(moduleKey, user, payload) {
  await pool.query(
    `
    INSERT INTO enterprise_intelligence_observations (module, role, health_score, insight)
    VALUES ($1, $2, $3, $4)
    `,
    [moduleKey, user?.role || "EMPLOYEE", payload.businessHealth.score, payload]
  );
}

module.exports = {
  getIntelligence,
  runSimulation,
};
