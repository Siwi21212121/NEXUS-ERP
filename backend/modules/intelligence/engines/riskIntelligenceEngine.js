function detectRisks(context, kpis, predictions) {
  const risks = [];

  kpis.forEach((item) => {
    if (item.status === "risk" || item.status === "watch") {
      risks.push({
        key: item.key,
        severity: item.status === "risk" ? "HIGH" : "MEDIUM",
        message: `${item.key} needs attention based on current value and comparison trend.`,
        action: "Review the underlying records and assign a mitigation owner.",
      });
    }
  });

  predictions.forEach((item) => {
    if (item.trend === "down" && item.confidence >= 40) {
      risks.push({
        key: item.key,
        severity: "MEDIUM",
        message: `${item.key} is forecast to decline.`,
        action: item.recommendedAction,
      });
    }
  });

  if (!risks.length) {
    risks.push({
      key: "operating_risk",
      severity: "INFO",
      message: "No critical risks were detected from available PostgreSQL data.",
      action: "Continue automated monitoring.",
    });
  }

  return risks;
}

module.exports = {
  detectRisks,
};
