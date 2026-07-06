const { getDateRange } = require("./utils/dateRange");

const INTENTS = [
  { intent: "generate_report", patterns: ["generate report", "monthly report", "executive report", "report"] },
  { intent: "business_health", patterns: ["business health", "health score", "company health", "risk analysis", "risks"] },
  { intent: "cash_flow", patterns: ["cash flow", "cashflow"] },
  { intent: "profit", patterns: ["profit", "margin", "p&l", "profit and loss"] },
  { intent: "expenses", patterns: ["expense", "expenses", "spend", "costs"] },
  { intent: "revenue", patterns: ["revenue", "income", "sales"] },
  { intent: "inventory_low", patterns: ["low stock", "out of stock", "inventory shortage", "shortage"] },
  { intent: "inventory", patterns: ["inventory", "stock", "products", "warehouse"] },
  { intent: "top_products", patterns: ["top products", "best products", "selling products"] },
  { intent: "purchase_orders", patterns: ["purchase order", "purchase orders", "pending orders", "approvals"] },
  { intent: "top_vendors", patterns: ["top vendors", "vendor performance", "supplier rating", "vendors"] },
  { intent: "employee_count", patterns: ["employee count", "employees", "headcount"] },
  { intent: "attendance_today", patterns: ["attendance today", "show attendance", "attendance"] },
  { intent: "leave_today", patterns: ["leave today", "employees on leave", "leave requests", "leave"] },
  { intent: "payroll", patterns: ["payroll", "salary", "payslip"] },
  { intent: "top_customers", patterns: ["top customers", "customers", "customer growth"] },
  { intent: "company_kpis", patterns: ["kpi", "kpis", "company kpis", "executive dashboard"] },
  { intent: "notifications", patterns: ["notifications", "alerts", "today's alerts", "today alerts"] },
];

function detectIntent(question, role) {
  const text = String(question || "").trim();
  const normalized = text.toLowerCase();
  const match = INTENTS.find((item) => item.patterns.some((pattern) => normalized.includes(pattern)));
  const intent = match?.intent || "company_kpis";

  return {
    intent,
    entities: extractEntities(normalized),
    dateRange: getDateRange(normalized),
    filters: {},
    role,
    question: text,
  };
}

function extractEntities(text) {
  return {
    department: extractAfter(text, "department"),
    vendor: extractAfter(text, "vendor"),
    product: extractAfter(text, "product"),
  };
}

function extractAfter(text, marker) {
  const index = text.indexOf(marker);
  if (index < 0) return null;
  const value = text.slice(index + marker.length).replace(/[:#]/g, "").trim();
  return value ? value.split(/\s+/).slice(0, 4).join(" ") : null;
}

module.exports = {
  detectIntent,
};
