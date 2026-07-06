const { number, percentChange } = require("./math");

function analyzeKpis(context) {
  const current = context.visibleKpis || {};
  const previous = context.history?.previous || {};

  return Object.entries(current).map(([key, value]) => {
    const currentValue = number(value);
    const previousValue = number(previous[key]);
    const trend = previousValue ? percentChange(currentValue, previousValue) : 0;
    return {
      key,
      value: currentValue,
      previous: previousValue,
      trend,
      status: getStatus(key, currentValue, trend),
      explanation: `${key} is ${trend >= 0 ? "above or equal to" : "below"} the comparison baseline by ${Math.abs(trend)}%.`,
    };
  });
}

function getStatus(key, value, trend) {
  const lowerKey = key.toLowerCase();
  if (lowerKey.includes("risk") || lowerKey.includes("expense") || lowerKey.includes("pending") || lowerKey.includes("outofstock")) {
    return trend > 10 || value > 0 ? "watch" : "healthy";
  }
  if (trend < -10) return "risk";
  if (trend > 10) return "growth";
  return "stable";
}

module.exports = {
  analyzeKpis,
};
