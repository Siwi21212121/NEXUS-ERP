function explain(context, kpis, predictions) {
  const explanations = kpis.map((item) => ({
    key: item.key,
    whatItMeans: `${item.key} is a live operating indicator on the ${context.module} dashboard.`,
    whyItHappened: item.previous ? `It changed ${item.trend}% versus the comparison baseline.` : "There is not enough baseline data yet for a full variance explanation.",
    whyItMatters: "It affects operating decisions, capacity planning, risk prioritization, or executive reporting.",
    expectedOutcome: predictionFor(item.key, predictions),
    recommendedNextStep: item.status === "risk" || item.status === "watch" ? "Investigate source records and resolve exceptions." : "Continue monitoring and protect the current trend.",
  }));

  return explanations;
}

function predictionFor(key, predictions) {
  const match = predictions.find((item) => item.key.toLowerCase().includes(key.toLowerCase()));
  if (!match) return "Future outcome depends on new PostgreSQL history as it accumulates.";
  return `${match.key} is forecast ${match.trend} with ${match.confidence}% confidence.`;
}

module.exports = {
  explain,
};
