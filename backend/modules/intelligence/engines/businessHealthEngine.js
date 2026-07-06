const { clamp, number } = require("./math");

function calculateHealth(context, kpis, risks) {
  const riskPenalty = risks.filter((risk) => risk.severity === "HIGH").length * 12 +
    risks.filter((risk) => risk.severity === "MEDIUM").length * 6;
  const positiveTrend = kpis.filter((item) => item.trend > 0).length;
  const negativeTrend = kpis.filter((item) => item.trend < 0).length;
  const base = 76 + positiveTrend * 3 - negativeTrend * 4 - riskPenalty;
  const dataCoverage = Object.keys(context.visibleKpis || {}).length + Object.keys(context.charts || {}).length;

  return {
    score: clamp(base + Math.min(dataCoverage, 10), 0, 100),
    dataCoverage,
    confidence: clamp(45 + dataCoverage * 7, 35, 95),
    financial: clamp(70 + number(context.visibleKpis.netProfit || context.visibleKpis.profitMargin) / 100000),
    operations: clamp(76 - riskPenalty / 2),
    workforce: clamp(75 + number(context.visibleKpis.totalEmployees || context.visibleKpis.employees) / 20),
  };
}

module.exports = {
  calculateHealth,
};
