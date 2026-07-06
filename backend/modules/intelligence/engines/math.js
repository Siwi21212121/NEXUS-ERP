function number(value) {
  return Number(value || 0);
}

function percentChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(number(value))));
}

function linearForecast(points, periods = 1) {
  const values = (points || []).map((point) => number(point.value)).filter((value) => Number.isFinite(value));
  if (!values.length) {
    return { prediction: 0, confidence: 0, model: "insufficient_data", trend: "flat" };
  }

  if (values.length === 1) {
    return { prediction: values[0], confidence: 35, model: "naive_last_observation", trend: "flat" };
  }

  const n = values.length;
  const xs = values.map((_, index) => index + 1);
  const avgX = xs.reduce((sum, value) => sum + value, 0) / n;
  const avgY = values.reduce((sum, value) => sum + value, 0) / n;
  const numerator = xs.reduce((sum, x, index) => sum + (x - avgX) * (values[index] - avgY), 0);
  const denominator = xs.reduce((sum, x) => sum + (x - avgX) ** 2, 0) || 1;
  const slope = numerator / denominator;
  const prediction = Math.max(0, avgY + slope * (n + periods - avgX));
  const volatility = values.reduce((sum, value) => sum + Math.abs(value - avgY), 0) / Math.max(avgY, 1) / n;
  const confidence = clamp(85 - volatility * 100 + Math.min(n, 12), 25, 92);

  return {
    prediction: Math.round(prediction * 100) / 100,
    confidence,
    model: n >= 6 ? "linear_regression" : "moving_trend",
    trend: slope > 0 ? "up" : slope < 0 ? "down" : "flat",
  };
}

module.exports = {
  clamp,
  linearForecast,
  number,
  percentChange,
};
