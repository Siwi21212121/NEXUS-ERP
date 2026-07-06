const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  getAnalyticsDocs,
  getExecutiveDashboard,
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/executive-dashboard", verifyToken, authorize("OWNER"), getExecutiveDashboard);
router.get("/docs", verifyToken, authorize("OWNER"), getAnalyticsDocs);

module.exports = router;
