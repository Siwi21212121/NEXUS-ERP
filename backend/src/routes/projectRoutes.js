const express = require("express");

const verifyToken =
  require("../middleware/authMiddleware");

const authorize =
  require("../middleware/roleMiddleware");

const {
  getProjectDashboard,
} = require("../controllers/projectController");

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,
  authorize(
    "PROJECT_MANAGER",
    "OWNER"
  ),
  getProjectDashboard
);

module.exports = router;