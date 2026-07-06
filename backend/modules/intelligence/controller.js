const intelligenceService = require("./service");

function handleError(res, error) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Enterprise intelligence request failed",
  });
}

async function getModuleIntelligence(req, res) {
  try {
    const data = await intelligenceService.getIntelligence(req.params.module, req.user);
    return res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error);
  }
}

async function simulateModule(req, res) {
  try {
    const data = await intelligenceService.runSimulation(req.params.module, req.body?.scenario, req.user);
    return res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error);
  }
}

module.exports = {
  getModuleIntelligence,
  simulateModule,
};
