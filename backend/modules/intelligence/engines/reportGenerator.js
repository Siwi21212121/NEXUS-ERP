function generateSummary(context, health, risks, opportunities) {
  return {
    title: `${context.module.toUpperCase()} Intelligence Brief`,
    generatedAt: context.observedAt,
    summary: `${context.module} health is ${health.score}/100 with ${health.confidence}% confidence from ${health.dataCoverage} observed data groups.`,
    topRisks: risks.slice(0, 3),
    topOpportunities: opportunities.slice(0, 3),
  };
}

module.exports = {
  generateSummary,
};
