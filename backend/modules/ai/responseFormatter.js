function formatResponse(detection, analysis) {
  const title = titleForIntent(detection.intent, detection.dateRange.label);
  const summary = buildSummary(detection.intent, analysis);

  return {
    title,
    summary,
    answer: `${title}\n\n${summary}`,
    insights: analysis.insights,
    recommendations: analysis.recommendations,
    businessHealth: analysis.businessHealth,
    metrics: analysis.metrics,
    data: analysis.rows,
  };
}

function titleForIntent(intent, label) {
  const names = {
    revenue: "Revenue",
    expenses: "Expenses",
    profit: "Profit",
    cash_flow: "Cash Flow",
    inventory: "Inventory",
    inventory_low: "Low Stock Products",
    top_products: "Top Products",
    purchase_orders: "Purchase Orders",
    top_vendors: "Top Vendors",
    employee_count: "Employee Count",
    attendance_today: "Attendance Today",
    leave_today: "Leave Status",
    payroll: "Payroll",
    top_customers: "Top Customers",
    business_health: "Business Health",
    company_kpis: "Company KPIs",
    notifications: "Notifications",
    generate_report: "Executive Report",
  };
  return `${names[intent] || "Executive Insight"} - ${label}`;
}

function buildSummary(intent, analysis) {
  const metrics = analysis.metrics || {};
  if (intent === "business_health" || intent === "company_kpis") {
    return `Business health is ${analysis.businessHealth.score}/100. Revenue score ${analysis.businessHealth.revenue}, finance ${analysis.businessHealth.finance}, inventory ${analysis.businessHealth.inventory}, HR ${analysis.businessHealth.hr}, operations ${analysis.businessHealth.operations}.`;
  }
  if (intent === "profit") {
    return `Revenue is ${money(metrics.revenue)}, expenses are ${money(metrics.expenses)}, and profit is ${money(metrics.profit)} with ${metrics.profitMargin}% margin.`;
  }
  if (intent === "revenue") return `Revenue is ${money(metrics.revenue)} for the selected period.`;
  if (intent === "expenses") return `Expenses are ${money(metrics.expenses)} for the selected period.`;
  if (intent === "cash_flow") return `Cash flow includes ${analysis.rows.length} monthly data points for inflow and outflow.`;
  if (intent === "inventory") {
    const row = analysis.rows[0] || {};
    return `Inventory has ${row.products || 0} active products, ${row.units || 0} units on hand, and total stock value of ${money(row.value)}.`;
  }
  if (intent === "inventory_low") {
    if (!analysis.rows.length) return "No low-stock products are currently detected from inventory records.";
    return `${analysis.rows.length} products are at or below reorder level. The most urgent item is ${analysis.rows[0]?.name || "the first listed product"} with ${analysis.rows[0]?.stock || 0} units.`;
  }
  if (intent === "top_products") return listSummary("Top products", analysis.rows, "value");
  if (intent === "top_customers") return listSummary("Top customers", analysis.rows, "value", money);
  if (intent === "top_vendors") {
    if (!analysis.rows.length) return "No vendor performance records are available yet.";
    return `Top vendor is ${analysis.rows[0].name} with rating ${Number(analysis.rows[0].rating || 0).toFixed(1)} and ${Number(analysis.rows[0].deliveryPerformance || 0)}% delivery performance.`;
  }
  if (intent === "purchase_orders") {
    if (!analysis.rows.length) return "No purchase order records are available yet.";
    return `Purchase orders are grouped across ${analysis.rows.length} statuses. Total committed cost is ${money(analysis.rows.reduce((sum, row) => sum + Number(row.cost || 0), 0))}.`;
  }
  if (intent === "leave_today") return `${totalCount(analysis.rows)} leave records are active today, grouped by approval status.`;
  if (intent === "attendance_today") return `${totalCount(analysis.rows)} attendance records are captured today.`;
  if (intent === "employee_count") return `${analysis.rows[0]?.employees || 0} active employees are currently recorded.`;
  if (intent === "payroll") return `${totalCount(analysis.rows)} payroll records are available by status.`;
  if (intent === "notifications") return analysis.rows.length ? `${analysis.rows.length} recent alerts are available. Latest: ${analysis.rows[0]?.title}.` : "No recent alerts are available.";
  return `${analysis.rows.length} ERP records matched this request.`;
}

function totalCount(rows) {
  return (rows || []).reduce((sum, row) => sum + Number(row.count || 0), 0);
}

function listSummary(title, rows, valueKey, formatter = (value) => value) {
  if (!rows?.length) return `${title} are not available yet because no matching PostgreSQL records were found.`;
  return `${title}: ${rows
    .slice(0, 3)
    .map((row, index) => `${index + 1}. ${row.name} (${formatter(Number(row[valueKey] || 0))})`)
    .join("; ")}.`;
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

module.exports = {
  formatResponse,
};
