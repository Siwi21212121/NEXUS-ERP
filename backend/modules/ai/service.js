const pool = require("../../src/config/db");
const analyticsService = require("../../src/services/analyticsService");
const { analyze, calculateBusinessHealth } = require("./analyticsEngine");
const cache = require("./cacheManager");
const { detectIntent } = require("./intentDetector");
const { assertCanAccess } = require("./permissionEngine");
const { buildQuery } = require("./queryBuilder");
const { formatResponse } = require("./responseFormatter");
const { generateExecutiveReport, generateExecutiveReportPdf } = require("./reportGenerator");

let aiSchemaReady = false;

async function ensureAiSchema() {
  if (aiSchemaReady) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ai_copilot_interactions (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT,
      role VARCHAR(60),
      question TEXT NOT NULL,
      intent VARCHAR(80) NOT NULL,
      response JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_ai_copilot_interactions_role_created
      ON ai_copilot_interactions(role, created_at DESC);

    CREATE TABLE IF NOT EXISTS ai_support_tickets (
      id BIGSERIAL PRIMARY KEY,
      ticket_number VARCHAR(40) UNIQUE NOT NULL,
      user_id BIGINT,
      role VARCHAR(60),
      department VARCHAR(80) NOT NULL,
      question TEXT NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
      priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_ai_support_tickets_department_status
      ON ai_support_tickets(department, status, created_at DESC);
  `);
  aiSchemaReady = true;
}

async function ask(question, user) {
  await ensureAiSchema();
  const role = user?.role || "EMPLOYEE";
  const detection = detectIntent(question, role);
  const permission = assertCanAccess(role, detection.intent);

  if (!permission.allowed) {
    const error = new Error(permission.message);
    error.statusCode = 403;
    throw error;
  }

  if (detection.intent === "generate_report") {
    return generateReport(user);
  }

  const key = cache.buildKey(["ask", role, detection.intent, detection.dateRange]);
  const cached = cache.get(key);
  if (cached) return cached;

  const executive = await analyticsService.getExecutiveAnalytics();
  const rows = await executeIntentQuery(detection);
  const analysis = detection.intent === "business_health" || detection.intent === "company_kpis"
    ? analyze(detection.intent, rows, executive)
    : analyze(detection.intent, rows, executive);
  const response = {
    detection,
    ...formatResponse(detection, analysis),
    cached: false,
  };

  await logInteraction(user, detection, response);
  cache.set(key, response);
  return response;
}

async function executeIntentQuery(detection) {
  const query = buildQuery(detection.intent, detection.dateRange);
  if (!query) return [];

  const ready = await requiredTablesExist(query.requiredTables);
  if (!ready) return [];

  const result = await pool.query({
    text: query.sql,
    values: query.values,
  });
  return result.rows;
}

async function requiredTablesExist(tables = []) {
  if (!tables.length) return true;
  const result = await pool.query(
    "SELECT COUNT(*)::INTEGER AS count FROM pg_class WHERE relkind IN ('r','p') AND relname = ANY($1)",
    [tables]
  );
  return Number(result.rows[0]?.count || 0) === tables.length;
}

async function getBusinessHealth() {
  const executive = await analyticsService.getExecutiveAnalytics();
  return {
    health: calculateBusinessHealth(executive),
    kpis: executive.kpis,
    charts: executive.charts,
  };
}

async function getHistory(user, limit = 20) {
  await ensureAiSchema();
  const result = await pool.query(
    `
    SELECT id, question, intent, created_at AS "createdAt"
    FROM ai_copilot_interactions
    WHERE role = $1
    ORDER BY created_at DESC
    LIMIT $2
    `,
    [user?.role || "EMPLOYEE", limit]
  );
  return result.rows;
}

async function generateReport(user) {
  const role = user?.role || "EMPLOYEE";
  const permission = assertCanAccess(role, "generate_report");
  if (!permission.allowed) {
    const error = new Error(permission.message);
    error.statusCode = 403;
    throw error;
  }
  const executive = await analyticsService.getExecutiveAnalytics();
  const health = calculateBusinessHealth(executive);
  return {
    detection: {
      intent: "generate_report",
      role,
      dateRange: { label: "this month" },
    },
    title: "Executive Report",
    summary: `Business health is ${health.score}/100.`,
    report: generateExecutiveReport(executive, health),
    businessHealth: health,
  };
}

async function generateReportPdf(user) {
  const reportResponse = await generateReport(user);
  return generateExecutiveReportPdf(reportResponse.report);
}

async function logInteraction(user, detection, response) {
  await pool.query(
    `
    INSERT INTO ai_copilot_interactions (user_id, role, question, intent, response)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [user?.id || null, user?.role || "EMPLOYEE", detection.question, detection.intent, response]
  );
}

async function createTicket(question, user, reason = "Copilot escalation requested") {
  await ensureAiSchema();
  const ticketNumber = `AIT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const department = detectDepartment(question);
  const result = await pool.query(
    `
    INSERT INTO ai_support_tickets (ticket_number, user_id, role, department, question, priority)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, ticket_number AS "ticketNumber", department, status, priority, created_at AS "createdAt"
    `,
    [
      ticketNumber,
      user?.id || null,
      user?.role || "EMPLOYEE",
      department,
      `${question}\n\nEscalation reason: ${reason}`,
      department === "Finance" || department === "Supply Chain" ? "HIGH" : "MEDIUM",
    ]
  );
  return result.rows[0];
}

function detectDepartment(question = "") {
  const text = question.toLowerCase();
  if (/(revenue|expense|profit|cash|invoice|payment|budget|finance)/.test(text)) return "Finance";
  if (/(employee|attendance|leave|payroll|salary|hr)/.test(text)) return "HR";
  if (/(inventory|stock|warehouse|product|supply chain|shipment)/.test(text)) return "Supply Chain";
  if (/(vendor|purchase|procurement|supplier|po)/.test(text)) return "Procurement";
  if (/(customer|lead|order|sales|crm)/.test(text)) return "CRM";
  return "Executive Office";
}

module.exports = {
  ask,
  ensureAiSchema,
  createTicket,
  generateReport,
  generateReportPdf,
  getBusinessHealth,
  getHistory,
};
