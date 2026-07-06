const express = require("express");

const verifyToken =
  require("../middleware/authMiddleware");

const authorize =
  require("../middleware/roleMiddleware");

const {
  getBudgets,
  getCashFlow,
  getFinanceDashboard,
  getFinanceTransactions,
  postFinanceTransaction,
  getFinanceNotifications,
  getFinanceApiDocs,
  getInvoices,
  getPayments,
  getProfitLoss,
  postBudget,
  postInvoice,
  postPayment,
} = require("../controllers/financeController");

const router = express.Router();
const financeAccess = [
  "FINANCE_MANAGER",
  "OWNER"
];

router.get(
  "/dashboard",
  verifyToken,
  authorize(...financeAccess),
  getFinanceDashboard
);

router.get(
  "/transactions",
  verifyToken,
  authorize(...financeAccess),
  getFinanceTransactions
);

router.post(
  "/transactions",
  verifyToken,
  authorize(...financeAccess),
  postFinanceTransaction
);

router.get("/budgets", verifyToken, authorize(...financeAccess), getBudgets);
router.post("/budgets", verifyToken, authorize(...financeAccess), postBudget);
router.get("/invoices", verifyToken, authorize(...financeAccess), getInvoices);
router.post("/invoices", verifyToken, authorize(...financeAccess), postInvoice);
router.get("/payments", verifyToken, authorize(...financeAccess), getPayments);
router.post("/payments", verifyToken, authorize(...financeAccess), postPayment);
router.get("/profit-loss", verifyToken, authorize(...financeAccess), getProfitLoss);
router.get("/cash-flow", verifyToken, authorize(...financeAccess), getCashFlow);

router.get(
  "/notifications",
  verifyToken,
  authorize(...financeAccess),
  getFinanceNotifications
);

router.get(
  "/docs",
  verifyToken,
  authorize(...financeAccess),
  getFinanceApiDocs
);

module.exports = router;
