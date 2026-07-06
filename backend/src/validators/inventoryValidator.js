const MOVEMENT_TYPES = ["RECEIPT", "DISPATCH", "TRANSFER", "ADJUSTMENT"];

function parseListFilters(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 50);

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    search: query.search?.trim() || "",
    categoryId: query.categoryId ? Number(query.categoryId) : null,
    warehouseId: query.warehouseId ? Number(query.warehouseId) : null,
  };
}

function validateProduct(body) {
  const payload = {
    sku: body.sku?.trim(),
    name: body.name?.trim(),
    categoryId: body.categoryId ? Number(body.categoryId) : null,
    supplierId: body.supplierId ? Number(body.supplierId) : null,
    unitCost: Number(body.unitCost),
    reorderLevel: Number(body.reorderLevel || 0),
  };
  const errors = [];

  if (!payload.sku) errors.push("SKU is required");
  if (!payload.name) errors.push("Product name is required");
  if (!Number.isFinite(payload.unitCost) || payload.unitCost < 0) errors.push("Unit cost must be valid");
  if (!Number.isInteger(payload.reorderLevel) || payload.reorderLevel < 0) errors.push("Reorder level must be valid");

  return { ok: errors.length === 0, errors, payload };
}

function validateMovement(body) {
  const payload = {
    productId: Number(body.productId),
    sourceWarehouseId: body.sourceWarehouseId ? Number(body.sourceWarehouseId) : null,
    destinationWarehouseId: body.destinationWarehouseId ? Number(body.destinationWarehouseId) : null,
    movementType: body.movementType?.trim()?.toUpperCase(),
    quantity: Number(body.quantity),
    referenceNumber: body.referenceNumber?.trim(),
    notes: body.notes?.trim() || null,
  };
  const errors = [];

  if (!Number.isFinite(payload.productId)) errors.push("Product is required");
  if (!MOVEMENT_TYPES.includes(payload.movementType)) errors.push(`Movement type must be one of: ${MOVEMENT_TYPES.join(", ")}`);
  if (!Number.isInteger(payload.quantity) || payload.quantity <= 0) errors.push("Quantity must be greater than zero");
  if (!payload.referenceNumber) errors.push("Reference number is required");
  if (["DISPATCH", "TRANSFER"].includes(payload.movementType) && !payload.sourceWarehouseId) errors.push("Source warehouse is required");
  if (["RECEIPT", "TRANSFER"].includes(payload.movementType) && !payload.destinationWarehouseId) errors.push("Destination warehouse is required");

  return { ok: errors.length === 0, errors, payload };
}

module.exports = {
  MOVEMENT_TYPES,
  parseListFilters,
  validateMovement,
  validateProduct,
};
