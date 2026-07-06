function createAlerts(risks, predictions) {
  return [
    ...risks.filter((risk) => risk.severity !== "INFO").map((risk) => ({
      severity: risk.severity,
      title: risk.key,
      message: risk.message,
    })),
    ...predictions.filter((item) => item.trend === "down" && item.confidence >= 60).map((item) => ({
      severity: "WARNING",
      title: `${item.key} forecast`,
      message: `${item.key} is forecast to decline with ${item.confidence}% confidence.`,
    })),
  ].slice(0, 8);
}

module.exports = {
  createAlerts,
};
