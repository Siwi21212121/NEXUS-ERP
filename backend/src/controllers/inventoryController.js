const inventoryService = require("../services/inventoryService");
const {
  parseListFilters,
  validateMovement,
  validateProduct,
} = require("../validators/inventoryValidator");

function handleError(res, label, error) {
  if (error.statusCode) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  if (error.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "Duplicate inventory record detected",
    });
  }

  console.error(label, error);

  return res.status(500).json({
    success: false,
    message: "Inventory service request failed",
  });
}

function validationError(res, validation) {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: validation.errors,
  });
}

async function getInventoryDashboard(req, res) {
  try {
    return res.json({
      success: true,
      data: await inventoryService.getInventoryDashboardData(),
    });
  } catch (error) {
    return handleError(res, "Inventory Dashboard Error:", error);
  }
}

async function getCategories(req, res) {
  try {
    return res.json({ success: true, data: await inventoryService.listCategories() });
  } catch (error) {
    return handleError(res, "Inventory Categories Error:", error);
  }
}

async function getSuppliers(req, res) {
  try {
    return res.json({ success: true, data: await inventoryService.listSuppliers() });
  } catch (error) {
    return handleError(res, "Inventory Suppliers Error:", error);
  }
}

async function getWarehouses(req, res) {
  try {
    return res.json({ success: true, data: await inventoryService.listWarehouses() });
  } catch (error) {
    return handleError(res, "Inventory Warehouses Error:", error);
  }
}

async function getProducts(req, res) {
  try {
    return res.json({
      success: true,
      ...(await inventoryService.listProducts(parseListFilters(req.query))),
    });
  } catch (error) {
    return handleError(res, "Inventory Products Error:", error);
  }
}

async function postProduct(req, res) {
  try {
    const validation = validateProduct(req.body);
    if (!validation.ok) return validationError(res, validation);

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: await inventoryService.createProduct(validation.payload),
    });
  } catch (error) {
    return handleError(res, "Create Product Error:", error);
  }
}

async function getAlerts(req, res) {
  try {
    return res.json({ success: true, data: await inventoryService.getLowStockAlerts() });
  } catch (error) {
    return handleError(res, "Inventory Alerts Error:", error);
  }
}

async function getMovements(req, res) {
  try {
    return res.json({ success: true, data: await inventoryService.listMovements() });
  } catch (error) {
    return handleError(res, "Inventory Movements Error:", error);
  }
}

async function postMovement(req, res) {
  try {
    const validation = validateMovement(req.body);
    if (!validation.ok) return validationError(res, validation);

    return res.status(201).json({
      success: true,
      message: "Inventory movement recorded",
      data: await inventoryService.createMovement(validation.payload),
    });
  } catch (error) {
    return handleError(res, "Create Inventory Movement Error:", error);
  }
}

function getInventoryDocs(req, res) {
  return res.json({
    module: "Inventory",
    basePath: "/api/inventory",
    roles: ["OWNER", "PROJECT_MANAGER"],
    endpoints: [
      "GET /dashboard",
      "GET /products",
      "POST /products",
      "GET /categories",
      "GET /warehouses",
      "GET /suppliers",
      "GET /alerts/low-stock",
      "GET /movements",
      "POST /movements",
      "GET /docs",
    ],
  });
}

module.exports = {
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
};
