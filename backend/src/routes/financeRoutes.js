const express = require("express");

const verifyToken =
  require("../middleware/authMiddleware");

const authorize =
  require("../middleware/roleMiddleware");

const {
  getFinanceDashboard,
} = require("../controllers/financeController");

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,
  authorize(
    "FINANCE_MANAGER",
    "OWNER"
  ),
  getFinanceDashboard
);

module.exports = router;