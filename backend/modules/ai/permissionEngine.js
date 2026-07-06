const ROLE_PERMISSIONS = {
  CEO: ["*"],
  ADMIN: ["*"],
  OWNER: ["*"],
  HR: ["hr", "general"],
  HR_MANAGER: ["hr", "general"],
  FINANCE: ["finance", "general"],
  FINANCE_MANAGER: ["finance", "general"],
  INVENTORY: ["inventory", "general"],
  PROCUREMENT: ["procurement", "general"],
  PROJECT_MANAGER: ["inventory", "procurement", "operations", "general"],
  CRM: ["crm", "general"],
  EMPLOYEE: ["general"],
};

const INTENT_DOMAINS = {
  attendance_today: "hr",
  employee_count: "hr",
  leave_today: "hr",
  payroll: "hr",
  cash_flow: "finance",
  expenses: "finance",
  profit: "finance",
  revenue: "finance",
  top_customers: "finance",
  inventory: "inventory",
  inventory_low: "inventory",
  top_products: "inventory",
  purchase_orders: "procurement",
  top_vendors: "procurement",
  business_health: "general",
  company_kpis: "general",
  generate_report: "general",
  notifications: "general",
};

function assertCanAccess(role, intent) {
  const normalizedRole = role || "EMPLOYEE";
  const permissions = ROLE_PERMISSIONS[normalizedRole] || [];
  const domain = INTENT_DOMAINS[intent] || "general";

  if (permissions.includes("*") || permissions.includes(domain)) {
    return { allowed: true, domain };
  }

  return {
    allowed: false,
    domain,
    message: `Access denied. ${normalizedRole} cannot view ${domain} insights.`,
  };
}

module.exports = {
  INTENT_DOMAINS,
  assertCanAccess,
};
