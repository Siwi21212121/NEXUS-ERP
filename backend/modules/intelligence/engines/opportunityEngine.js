function detectOpportunities(context, kpis, predictions) {
  const opportunities = [];

  kpis.forEach((item) => {
    if (item.status === "growth") {
      opportunities.push({
        key: item.key,
        message: `${item.key} is trending positively.`,
        action: "Scale the responsible workflow while monitoring capacity and margin.",
        impact: "Growth acceleration",
      });
    }
  });

  predictions.forEach((item) => {
    if (item.trend === "up" && item.confidence >= 40) {
      opportunities.push({
        key: item.key,
        message: `${item.key} has a positive forecast.`,
        action: "Protect supply, staffing, and budget capacity to capture upside.",
        impact: "Potential KPI improvement",
      });
    }
  });

  if (!opportunities.length) {
    opportunities.push({
      key: "optimization",
      message: "The strongest opportunity is operational optimization rather than aggressive expansion.",
      action: "Reduce delays, approve pending work, and tune resource allocation.",
      impact: "Efficiency improvement",
    });
  }

  return opportunities;
}

module.exports = {
  detectOpportunities,
};
