const {
  createBudget,
  createInvoice,
  createPayment,
  createTransaction,
  getCashFlowStatement,
  getFinanceDashboardData,
  getProfitAndLoss,
  listBudgets,
  listFinanceNotifications,
  listInvoices,
  listPayments,
  listTransactions,
} = require("../services/financeService");

const {
  parseTransactionFilters,
  validateBudget,
  validateInvoice,
  validatePayment,
  validateTransaction,
} = require("../validators/financeValidator");

const getFinanceDashboard = async (req, res) => {
  try {
    const data = await getFinanceDashboardData();

    return res.status(200).json({
      success: true,
      dashboard: "Finance Dashboard",
      accessBy: req.user.role,
      data,
    });
  } catch (error) {
    console.error("Finance Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load finance dashboard",
    });
  }
};

const getFinanceTransactions = async (req, res) => {
  try {
    const filters = parseTransactionFilters(req.query);
    const result = await listTransactions(filters);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Finance Transactions Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load finance transactions",
    });
  }
};

const postFinanceTransaction = async (req, res) => {
  try {
    const validation = validateTransaction(req.body);

    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const transaction = await createTransaction(validation.payload);

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Transaction number already exists",
      });
    }

    console.error("Create Finance Transaction Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create finance transaction",
    });
  }
};

const getFinanceNotifications = async (req, res) => {
  try {
    const notifications = await listFinanceNotifications();

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("Finance Notifications Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load finance notifications",
    });
  }
};

function validationError(res, validation) {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: validation.errors,
  });
}

async function getBudgets(req, res) {
  try {
    return res.json({ success: true, data: await listBudgets() });
  } catch (error) {
    console.error("Finance Budgets Error:", error);
    return res.status(500).json({ success: false, message: "Unable to load budgets" });
  }
}

async function postBudget(req, res) {
  try {
    const validation = validateBudget(req.body);
    if (!validation.ok) return validationError(res, validation);
    return res.status(201).json({ success: true, data: await createBudget(validation.payload) });
  } catch (error) {
    console.error("Create Budget Error:", error);
    return res.status(500).json({ success: false, message: "Unable to save budget" });
  }
}

async function getInvoices(req, res) {
  try {
    return res.json({ success: true, data: await listInvoices() });
  } catch (error) {
    console.error("Finance Invoices Error:", error);
    return res.status(500).json({ success: false, message: "Unable to load invoices" });
  }
}

async function postInvoice(req, res) {
  try {
    const validation = validateInvoice(req.body);
    if (!validation.ok) return validationError(res, validation);
    return res.status(201).json({ success: true, data: await createInvoice(validation.payload) });
  } catch (error) {
    console.error("Create Invoice Error:", error);
    return res.status(500).json({ success: false, message: "Unable to create invoice" });
  }
}

async function getPayments(req, res) {
  try {
    return res.json({ success: true, data: await listPayments() });
  } catch (error) {
    console.error("Finance Payments Error:", error);
    return res.status(500).json({ success: false, message: "Unable to load payments" });
  }
}

async function postPayment(req, res) {
  try {
    const validation = validatePayment(req.body);
    if (!validation.ok) return validationError(res, validation);
    return res.status(201).json({ success: true, data: await createPayment(validation.payload) });
  } catch (error) {
    console.error("Create Payment Error:", error);
    return res.status(500).json({ success: false, message: "Unable to create payment" });
  }
}

async function getProfitLoss(req, res) {
  try {
    return res.json({ success: true, data: await getProfitAndLoss() });
  } catch (error) {
    console.error("Profit and Loss Error:", error);
    return res.status(500).json({ success: false, message: "Unable to load profit and loss" });
  }
}

async function getCashFlow(req, res) {
  try {
    return res.json({ success: true, data: await getCashFlowStatement() });
  } catch (error) {
    console.error("Cash Flow Error:", error);
    return res.status(500).json({ success: false, message: "Unable to load cash flow" });
  }
}

const getFinanceApiDocs = (req, res) => {
  return res.status(200).json({
    module: "Finance",
    basePath: "/api/finance",
    authentication: "Bearer JWT token required",
    roles: ["OWNER", "FINANCE_MANAGER"],
    endpoints: [
      {
        method: "GET",
        path: "/dashboard",
        description: "Returns database-backed finance cards and revenue trend chart data.",
      },
      {
        method: "GET",
        path: "/transactions",
        description: "Returns paginated finance transactions with optional search, status, and type filters.",
        query: {
          page: "number, default 1",
          limit: "number, default 10, max 50",
          search: "transaction number, counterparty, or category",
          status: "PAID | PENDING | OVERDUE | APPROVED | DRAFT",
          type: "REVENUE | EXPENSE | RECEIVABLE | PAYABLE",
        },
      },
      {
        method: "POST",
        path: "/transactions",
        description: "Creates a finance transaction.",
        body: {
          transactionNumber: "string",
          counterparty: "string",
          transactionType: "REVENUE | EXPENSE | RECEIVABLE | PAYABLE",
          status: "PAID | PENDING | OVERDUE | APPROVED | DRAFT",
          category: "string",
          amount: "number",
          transactionDate: "YYYY-MM-DD",
          dueDate: "YYYY-MM-DD optional",
          notes: "string optional",
        },
      },
      {
        method: "GET",
        path: "/notifications",
        description: "Returns recent finance notifications.",
      },
      { method: "GET", path: "/budgets", description: "List budgets." },
      { method: "POST", path: "/budgets", description: "Create or update a budget." },
      { method: "GET", path: "/invoices", description: "List invoices." },
      { method: "POST", path: "/invoices", description: "Create an invoice." },
      { method: "GET", path: "/payments", description: "List payments." },
      { method: "POST", path: "/payments", description: "Create a payment." },
      { method: "GET", path: "/profit-loss", description: "Monthly P&L statement." },
      { method: "GET", path: "/cash-flow", description: "Monthly cash flow statement." },
      {
        method: "GET",
        path: "/docs",
        description: "Returns this API documentation.",
      },
    ],
  });
};

module.exports = {
  getBudgets,
  getCashFlow,
  getFinanceApiDocs,
  getFinanceDashboard,
  getFinanceNotifications,
  getFinanceTransactions,
  getInvoices,
  getPayments,
  getProfitLoss,
  postBudget,
  postFinanceTransaction,
  postInvoice,
  postPayment,
};
