function generateExecutiveReport(executive, health) {
  const kpis = executive.kpis || {};
  const charts = executive.charts || {};
  const risks = [];
  if (Number(kpis.profitMargin || 0) < 15) risks.push("Profit margin is below the enterprise target.");
  if (Number(kpis.inventoryValue || 0) <= 0) risks.push("Inventory value is unavailable or zero.");
  if (!risks.length) risks.push("No critical executive risks detected from available ERP data.");

  return {
    title: "ClarioNex ERP Executive Report",
    generatedAt: new Date().toISOString(),
    format: "json-printable",
    sections: {
      executiveSummary: `Business health is ${health.score}/100 with revenue score ${health.revenue}, finance ${health.finance}, inventory ${health.inventory}, HR ${health.hr}, operations ${health.operations}, and procurement ${health.procurement}.`,
      revenue: { value: Number(kpis.revenue || 0), growth: Number(kpis.revenueGrowth || 0) },
      expenses: { value: Number(kpis.expenses || 0) },
      profit: { margin: Number(kpis.profitMargin || 0) },
      inventory: { value: Number(kpis.inventoryValue || 0), turnover: Number(kpis.inventoryTurnover || 0) },
      employees: { count: Number(kpis.employees || 0), productivity: Number(kpis.employeeProductivity || 0) },
      procurement: { cost: Number(kpis.procurementCost || 0), vendorScore: Number(kpis.customerSatisfaction || 0) },
      risks,
      recommendations: buildRecommendations(kpis, risks),
      charts: {
        revenueTrend: charts.revenueTrend || [],
        topProducts: charts.topProducts || [],
        topVendors: charts.topVendors || [],
        topDepartments: charts.topDepartments || [],
        topCustomers: charts.topCustomers || [],
      },
    },
  };
}

function buildRecommendations(kpis, risks) {
  const recommendations = ["Review pending approvals before month-end close."];
  if (Number(kpis.profitMargin || 0) < 15) recommendations.push("Reduce discretionary expenses and renegotiate high-cost vendors.");
  if (Number(kpis.inventoryTurnover || 0) === 0) recommendations.push("Validate inventory movement data for turnover reporting.");
  if (risks.length > 0) recommendations.push("Assign owners for each risk and track mitigation weekly.");
  return recommendations;
}

module.exports = {
  generateExecutiveReport,
  generateExecutiveReportPdf,
};

function generateExecutiveReportPdf(report) {
  const lines = [
    report.title,
    `Generated: ${report.generatedAt}`,
    "",
    "Executive Summary",
    report.sections.executiveSummary,
    "",
    `Revenue: ${report.sections.revenue.value}`,
    `Revenue Growth: ${report.sections.revenue.growth}%`,
    `Expenses: ${report.sections.expenses.value}`,
    `Profit Margin: ${report.sections.profit.margin}%`,
    `Inventory Value: ${report.sections.inventory.value}`,
    `Inventory Turnover: ${report.sections.inventory.turnover}`,
    `Employees: ${report.sections.employees.count}`,
    `Procurement Cost: ${report.sections.procurement.cost}`,
    "",
    "Risks",
    ...report.sections.risks.map((item) => `- ${item}`),
    "",
    "AI Recommendations",
    ...report.sections.recommendations.map((item) => `- ${item}`),
    "",
    "Chart Data Included",
    `Revenue Trend Points: ${report.sections.charts.revenueTrend.length}`,
    `Top Products: ${report.sections.charts.topProducts.length}`,
    `Top Vendors: ${report.sections.charts.topVendors.length}`,
  ];

  const content = [
    "BT",
    "/F1 11 Tf",
    "50 780 Td",
    "14 TL",
    ...lines.slice(0, 48).map((line) => `(${escapePdfText(line)}) Tj T*`),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`,
  ];

  let body = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(body));
    body += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(body);
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(body);
}

function escapePdfText(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}
