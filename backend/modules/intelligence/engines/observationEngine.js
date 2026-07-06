const { number } = require("./math");

function observe(context) {
  const kpis = context.visibleKpis || {};
  const observations = Object.entries(kpis).map(([key, value]) => ({
    type: "kpi",
    key,
    value: number(value),
    message: `${label(key)} is currently ${formatValue(value)}.`,
  }));

  Object.entries(context.charts || {}).forEach(([key, rows]) => {
    if (Array.isArray(rows) && rows.length) {
      observations.push({
        type: "chart",
        key,
        value: rows.length,
        message: `${label(key)} contains ${rows.length} historical data points.`,
      });
    }
  });

  return observations;
}

function label(key) {
  return String(key).replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
}

function formatValue(value) {
  return typeof value === "number" ? value.toLocaleString("en-US") : String(value ?? 0);
}

module.exports = {
  observe,
};
