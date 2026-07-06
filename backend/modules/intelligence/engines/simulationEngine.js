const { clamp, number } = require("./math");

function simulate(context, scenario = "") {
  const text = String(scenario || "").toLowerCase();
  const percent = extractPercent(text);
  const kpis = context.visibleKpis || {};
  const revenue = number(kpis.totalRevenue || kpis.monthlyRevenue || kpis.revenue);
  const expenses = number(kpis.totalExpenses || kpis.expenses || kpis.purchaseCost || kpis.monthlyPayroll);
  const payroll = number(kpis.monthlyPayroll);
  const inventory = number(kpis.inventoryValue);

  const multipliers = {
    revenue: text.includes("revenue") || text.includes("marketing") || text.includes("sales") ? percent : 0,
    expenses: text.includes("expense") || text.includes("salary") || text.includes("hire") ? percent : 0,
    payroll: text.includes("hire") || text.includes("salary") || text.includes("workforce") ? percent : 0,
    inventory: text.includes("demand") || text.includes("warehouse") || text.includes("supplier") ? percent : 0,
  };

  const projectedRevenue = revenue * (1 + multipliers.revenue / 100);
  const projectedExpenses = expenses * (1 + multipliers.expenses / 100);
  const projectedPayroll = payroll * (1 + multipliers.payroll / 100);
  const projectedInventory = inventory * (1 - Math.max(multipliers.inventory, 0) / 100);
  const projectedProfit = projectedRevenue - projectedExpenses - Math.max(0, projectedPayroll - payroll);

  return {
    scenario: scenario || "No scenario provided",
    assumptions: {
      detectedPercent: percent,
      doesNotModifyProductionData: true,
    },
    projection: {
      revenue: Math.round(projectedRevenue),
      expenses: Math.round(projectedExpenses),
      payroll: Math.round(projectedPayroll),
      inventory: Math.round(Math.max(projectedInventory, 0)),
      profit: Math.round(projectedProfit),
      businessHealth: clamp(70 + projectedProfit / Math.max(projectedRevenue || 1, 1) * 30),
    },
    risks: projectedProfit < 0 ? ["Scenario may create negative profit."] : ["Scenario impact is within observable tolerance."],
    recommendation: projectedProfit < revenue - expenses ? "Run a staged rollout and monitor cash flow weekly." : "Scenario appears financially viable based on current ERP data.",
  };
}

function extractPercent(text) {
  const match = text.match(/(\d+(?:\.\d+)?)\s*%/);
  if (match) return Number(match[1]);
  if (text.includes("drops") || text.includes("reduce") || text.includes("delay")) return -10;
  if (text.includes("increase") || text.includes("hire") || text.includes("open")) return 10;
  return 0;
}

module.exports = {
  simulate,
};
