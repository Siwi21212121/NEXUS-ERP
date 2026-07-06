function recommend(context, risks, opportunities, predictions) {
  const actions = [];
  risks.forEach((risk) => actions.push({
    priority: risk.severity === "HIGH" ? "HIGH" : "MEDIUM",
    action: risk.action,
    businessImpact: risk.message,
  }));
  opportunities.forEach((opportunity) => actions.push({
    priority: "MEDIUM",
    action: opportunity.action,
    businessImpact: opportunity.impact,
  }));
  predictions.slice(0, 3).forEach((prediction) => actions.push({
    priority: prediction.trend === "down" ? "HIGH" : "LOW",
    action: prediction.recommendedAction,
    businessImpact: prediction.businessImpact,
  }));

  return actions.slice(0, 8);
}

module.exports = {
  recommend,
};
