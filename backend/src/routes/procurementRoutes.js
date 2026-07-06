const express = require("express");

const verifyToken = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const {
  approveOrder,
  getDashboard,
  getDocs,
  getOrders,
  getRequests,
  getVendors,
  postInvoiceMatch,
  postOrder,
  postReceipt,
  postRequest,
  postVendor,
  rejectOrder,
} = require("../controllers/procurementController");

const router = express.Router();
const procurementAccess = ["OWNER", "PROJECT_MANAGER"];

router.get("/dashboard", verifyToken, authorize(...procurementAccess), getDashboard);
router.get("/vendors", verifyToken, authorize(...procurementAccess), getVendors);
router.post("/vendors", verifyToken, authorize(...procurementAccess), postVendor);
router.get("/requests", verifyToken, authorize(...procurementAccess), getRequests);
router.post("/requests", verifyToken, authorize(...procurementAccess), postRequest);
router.get("/orders", verifyToken, authorize(...procurementAccess), getOrders);
router.post("/orders", verifyToken, authorize(...procurementAccess), postOrder);
router.patch("/orders/:id/approve", verifyToken, authorize(...procurementAccess), approveOrder);
router.patch("/orders/:id/reject", verifyToken, authorize(...procurementAccess), rejectOrder);
router.post("/receipts", verifyToken, authorize(...procurementAccess), postReceipt);
router.post("/invoice-matching", verifyToken, authorize(...procurementAccess), postInvoiceMatch);
router.get("/docs", verifyToken, authorize(...procurementAccess), getDocs);

module.exports = router;
