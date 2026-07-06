const { linearForecast } = require("./math");

function predict(context) {
  const forecasts = [];
  Object.entries(context.charts || {}).forEach(([key, rows]) => {
    const series = extractSeries(rows);
    if (!series.length) return;
    const forecast = linearForecast(series);
    forecasts.push({
      key,
      prediction: forecast.prediction,
      confidence: forecast.confidence,
      model: forecast.model,
      trend: forecast.trend,
      businessImpact: forecast.trend === "down" ? "Potential performance deterioration if no action is taken." : "Positive trajectory can be protected with proactive execution.",
      recommendedAction: forecast.trend === "down" ? "Investigate root causes and assign an owner before the next operating review." : "Maintain current controls and monitor capacity constraints.",
    });
  });

  return forecasts;
}

function extractSeries(rows) {
  return (rows || []).map((row) => {
    const valueKey = ["value", "revenue", "expenses", "present", "count", "cost", "net", "receipts", "orders"]
      .find((key) => row[key] !== undefined);
    return { label: row.month || row.day || row.status || row.name, value: row[valueKey] };
  }).filter((point) => point.value !== undefined);
}

module.exports = {
  predict,
};
