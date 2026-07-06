const express = require("express");
const verifyToken = require("../../src/middleware/authMiddleware");
const {
  ask,
  businessHealth,
  history,
  prompts,
  report,
  reportPdf,
  ticket,
} = require("./controller");

const router = express.Router();

router.use(verifyToken);
router.post("/ask", ask);
router.get("/business-health", businessHealth);
router.get("/history", history);
router.get("/suggested-prompts", prompts);
router.post("/report", report);
router.get("/report.pdf", reportPdf);
router.post("/tickets", ticket);

module.exports = router;
