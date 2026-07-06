const aiService = require("./service");
const { suggestedPrompts } = require("./promptTemplates");

function handleError(res, error) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "AI Copilot request failed",
  });
}

async function ask(req, res) {
  try {
    const question = req.body?.question?.trim();
    if (!question) {
      return res.status(400).json({ success: false, message: "Question is required" });
    }
    const data = await aiService.ask(question, req.user);
    return res.json({ success: true, data });
  } catch (error) {
    return handleError(res, error);
  }
}

async function businessHealth(req, res) {
  try {
    return res.json({ success: true, data: await aiService.getBusinessHealth() });
  } catch (error) {
    return handleError(res, error);
  }
}

async function history(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 50);
    return res.json({ success: true, data: await aiService.getHistory(req.user, limit) });
  } catch (error) {
    return handleError(res, error);
  }
}

async function report(req, res) {
  try {
    return res.json({ success: true, data: await aiService.generateReport(req.user) });
  } catch (error) {
    return handleError(res, error);
  }
}

async function reportPdf(req, res) {
  try {
    const buffer = await aiService.generateReportPdf(req.user);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="clarionex-executive-report.pdf"');
    return res.send(buffer);
  } catch (error) {
    return handleError(res, error);
  }
}

async function ticket(req, res) {
  try {
    const question = req.body?.question?.trim();
    if (!question) {
      return res.status(400).json({ success: false, message: "Question is required" });
    }
    const data = await aiService.createTicket(question, req.user, req.body?.reason);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return handleError(res, error);
  }
}

function prompts(req, res) {
  return res.json({ success: true, data: suggestedPrompts });
}

module.exports = {
  ask,
  businessHealth,
  history,
  prompts,
  report,
  reportPdf,
  ticket,
};
