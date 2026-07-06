const procurementService = require("../services/procurementService");
const {
  validateInvoice,
  validateOrder,
  validateReceipt,
  validateRequest,
  validateVendor,
} = require("../validators/procurementValidator");

function sendValidation(res, validation) {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: validation.errors,
  });
}

function handleError(res, label, error) {
  if (error.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "Duplicate procurement record detected",
    });
  }
  console.error(label, error);
  return res.status(500).json({
    success: false,
    message: "Procurement service request failed",
  });
}

async function getDashboard(req, res) {
  try {
    return res.json({ success: true, data: await procurementService.getDashboardData() });
  } catch (error) {
    return handleError(res, "Procurement Dashboard Error:", error);
  }
}

async function getVendors(req, res) {
  try {
    return res.json({ success: true, data: await procurementService.listVendors() });
  } catch (error) {
    return handleError(res, "Procurement Vendors Error:", error);
  }
}

async function postVendor(req, res) {
  try {
    const validation = validateVendor(req.body);
    if (!validation.ok) return sendValidation(res, validation);
    return res.status(201).json({ success: true, data: await procurementService.createVendor(validation.payload) });
  } catch (error) {
    return handleError(res, "Create Vendor Error:", error);
  }
}

async function getRequests(req, res) {
  try {
    return res.json({ success: true, data: await procurementService.listRequests() });
  } catch (error) {
    return handleError(res, "Procurement Requests Error:", error);
  }
}

async function postRequest(req, res) {
  try {
    const validation = validateRequest(req.body);
    if (!validation.ok) return sendValidation(res, validation);
    return res.status(201).json({ success: true, data: await procurementService.createRequest(validation.payload) });
  } catch (error) {
    return handleError(res, "Create Purchase Request Error:", error);
  }
}

async function getOrders(req, res) {
  try {
    return res.json({ success: true, data: await procurementService.listOrders() });
  } catch (error) {
    return handleError(res, "Procurement Orders Error:", error);
  }
}

async function postOrder(req, res) {
  try {
    const validation = validateOrder(req.body);
    if (!validation.ok) return sendValidation(res, validation);
    return res.status(201).json({ success: true, data: await procurementService.createOrder(validation.payload) });
  } catch (error) {
    return handleError(res, "Create Purchase Order Error:", error);
  }
}

async function approveOrder(req, res) {
  try {
    return res.json({ success: true, data: await procurementService.reviewOrder(req.params.id, "APPROVED") });
  } catch (error) {
    return handleError(res, "Approve Purchase Order Error:", error);
  }
}

async function rejectOrder(req, res) {
  try {
    return res.json({ success: true, data: await procurementService.reviewOrder(req.params.id, "REJECTED") });
  } catch (error) {
    return handleError(res, "Reject Purchase Order Error:", error);
  }
}

async function postReceipt(req, res) {
  try {
    const validation = validateReceipt(req.body);
    if (!validation.ok) return sendValidation(res, validation);
    return res.status(201).json({ success: true, data: await procurementService.receiveGoods(validation.payload) });
  } catch (error) {
    return handleError(res, "Goods Receipt Error:", error);
  }
}

async function postInvoiceMatch(req, res) {
  try {
    const validation = validateInvoice(req.body);
    if (!validation.ok) return sendValidation(res, validation);
    return res.status(201).json({ success: true, data: await procurementService.matchInvoice(validation.payload) });
  } catch (error) {
    return handleError(res, "Invoice Matching Error:", error);
  }
}

function getDocs(req, res) {
  return res.json({
    module: "Procurement",
    basePath: "/api/procurement",
    roles: ["OWNER", "PROJECT_MANAGER"],
    endpoints: [
      "GET /dashboard",
      "GET /vendors",
      "POST /vendors",
      "GET /requests",
      "POST /requests",
      "GET /orders",
      "POST /orders",
      "PATCH /orders/:id/approve",
      "PATCH /orders/:id/reject",
      "POST /receipts",
      "POST /invoice-matching",
      "GET /docs",
    ],
  });
}

module.exports = {
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
};
