const express = require("express");

const verifyToken =
  require("../middleware/authMiddleware");

const authorize =
  require("../middleware/roleMiddleware");

const {
  getOwnerDashboard,
} = require("../controllers/ownerController");

const router = express.Router();

router.get(
  "/dashboard",
  verifyToken,
  authorize("OWNER"),
  getOwnerDashboard
);

module.exports = router;