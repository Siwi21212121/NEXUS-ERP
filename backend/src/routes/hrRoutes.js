const express = require("express");

const verifyToken =
  require("../middleware/authMiddleware");

const authorize =
  require("../middleware/roleMiddleware");

const {
  getHRDashboard,
} = require("../controllers/hrController");

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,
  authorize(
    "HR_MANAGER",
    "OWNER"
  ),
  getHRDashboard
);

module.exports = router;