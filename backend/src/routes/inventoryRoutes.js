const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  getAlerts,
  getCategories,
  getInventoryDashboard,
  getInventoryDocs,
  getMovements,
  getProducts,
  getSuppliers,
  getWarehouses,
  postMovement,
  postProduct,
} = require("../controllers/inventoryController");

const router = express.Router();
const inventoryAccess = [
  "PROJECT_MANAGER",
  "OWNER"
];

router.get("/dashboard", verifyToken, authorize(...inventoryAccess), getInventoryDashboard);
router.get("/products", verifyToken, authorize(...inventoryAccess), getProducts);
router.post("/products", verifyToken, authorize(...inventoryAccess), postProduct);
router.get("/categories", verifyToken, authorize(...inventoryAccess), getCategories);
router.get("/warehouses", verifyToken, authorize(...inventoryAccess), getWarehouses);
router.get("/suppliers", verifyToken, authorize(...inventoryAccess), getSuppliers);
router.get("/alerts/low-stock", verifyToken, authorize(...inventoryAccess), getAlerts);
router.get("/movements", verifyToken, authorize(...inventoryAccess), getMovements);
router.post("/movements", verifyToken, authorize(...inventoryAccess), postMovement);
router.get("/docs", verifyToken, authorize(...inventoryAccess), getInventoryDocs);

module.exports = router;
