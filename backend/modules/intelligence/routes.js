const express = require("express");
const verifyToken = require("../../src/middleware/authMiddleware");
const { getModuleIntelligence, simulateModule } = require("./controller");

const router = express.Router();

router.use(verifyToken);
router.get("/:module", getModuleIntelligence);
router.post("/:module/simulate", simulateModule);

module.exports = router;
