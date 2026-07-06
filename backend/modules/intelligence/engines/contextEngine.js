function buildContext(moduleKey, rawData, user) {
  return {
    module: moduleKey,
    role: user?.role || "EMPLOYEE",
    observedAt: new Date().toISOString(),
    rawData,
    visibleKpis: rawData.cards || rawData.kpis || {},
    charts: rawData.charts || pickCharts(rawData),
    tables: rawData.tables || {},
    filters: rawData.filters || {},
    history: rawData.history || {},
  };
}

function pickCharts(rawData) {
  const charts = {};
  Object.entries(rawData || {}).forEach(([key, value]) => {
    if (Array.isArray(value)) charts[key] = value;
  });
  return charts;
}

module.exports = {
  buildContext,
};
