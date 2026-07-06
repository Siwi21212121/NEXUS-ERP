function number(value) {
  return Number(value || 0);
}

function growth(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function analyze(intent, rows, executive = {}) {
  const first = rows[0] || {};
  const kpis = executive.kpis || {};
  const revenue = number(first.revenue ?? kpis.revenue);
  const expenses = number(first.expenses ?? kpis.expenses);
  const profit = revenue - expenses;

  const metrics = {
    revenue,
    expenses,
    profit,
    profitMargin: revenue > 0 ? Math.round((profit / revenue) * 100) : number(kpis.profitMargin),
    revenueGrowth: number(kpis.revenueGrowth),
    inventoryTurnover: number(kpis.inventoryTurnover),
    procurementCost: number(kpis.procurementCost),
    employeeProductivity: number(kpis.employeeProductivity),
    customerSatisfaction: number(kpis.customerSatisfaction),
  };

  return {
    intent,
    rows,
    metrics,
    businessHealth: calculateBusinessHealth(executive),
    insights: buildInsights(intent, rows, metrics),
    recommendations: buildRecommendations(intent, rows, metrics),
  };
}

function calculateBusinessHealth(executive = {}) {
  const kpis = executive.kpis || {};
  const revenueScore = clamp(70 + number(kpis.revenueGrowth));
  const financeScore = clamp(number(kpis.profitMargin) > 0 ? 75 + number(kpis.profitMargin) : 55);
  const inventoryScore = clamp(number(kpis.inventoryValue) > 0 ? 88 : 60);
  const operationsScore = clamp(number(kpis.inventoryTurnover) > 0 ? 84 : 65);
  const hrScore = clamp(number(kpis.employees) > 0 ? 90 : 60);
  const procurementScore = clamp(number(kpis.customerSatisfaction) || 72);

  const score = Math.round(
    revenueScore * 0.2 +
      financeScore * 0.2 +
      inventoryScore * 0.2 +
      operationsScore * 0.15 +
      hrScore * 0.15 +
      procurementScore * 0.1
  );

  return {
    score,
    revenue: revenueScore,
    finance: financeScore,
    inventory: inventoryScore,
    operations: operationsScore,
    hr: hrScore,
    procurement: procurementScore,
  };
}

function buildInsights(intent, rows, metrics) {
  const insights = [];
  if (metrics.revenue > 0) insights.push(`Revenue is ${formatMoney(metrics.revenue)} for the selected period.`);
  if (metrics.expenses > 0) insights.push(`Expenses are ${formatMoney(metrics.expenses)}, with profit margin at ${metrics.profitMargin}%.`);
  if (intent.includes("inventory") && rows.length) insights.push(`${rows.length} inventory records require executive attention.`);
  if (intent.includes("vendor") && rows.length) insights.push(`Top vendor rating is ${Number(rows[0].rating || 0).toFixed(1)}.`);
  if (!insights.length) insights.push("No critical movement was found for the selected ERP data slice.");
  return insights;
}

function buildRecommendations(intent, rows, metrics) {
  const recommendations = [];
  if (metrics.profitMargin < 15 && metrics.revenue > 0) recommendations.push("Review expense categories and delay non-critical purchases.");
  if (intent === "inventory_low" && rows.length) recommendations.push("Increase safety stock for the lowest-stock products.");
  if (intent === "top_vendors" && rows.length) recommendations.push("Shift urgent orders toward vendors with stronger delivery performance.");
  if (intent === "purchase_orders") recommendations.push("Prioritize approvals for high-value pending purchase orders.");
  if (!recommendations.length) recommendations.push("Continue monitoring KPIs and act on exceptions before month-end close.");
  return recommendations;
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value || 0)));
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(number(value));
}

module.exports = {
  analyze,
  calculateBusinessHealth,
  growth,
};
