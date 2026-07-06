function learn(context, insights) {
  return {
    memorySignal: `${context.module}:${Object.keys(context.visibleKpis || {}).join(",")}`,
    learnedAt: context.observedAt,
    nextObservationFocus: insights.risks?.[0]?.key || insights.opportunities?.[0]?.key || "business_health",
  };
}

module.exports = {
  learn,
};
