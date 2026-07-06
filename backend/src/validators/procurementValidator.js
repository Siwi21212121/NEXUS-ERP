function validateVendor(body) {
  const payload = {
    name: body.name?.trim(),
    category: body.category?.trim() || "General",
    location: body.location?.trim() || null,
    contactEmail: body.contactEmail?.trim() || null,
    rating: Number(body.rating || 4),
    deliveryPerformance: Number(body.deliveryPerformance || 90),
    qualityScore: Number(body.qualityScore || 90),
  };
  const errors = [];
  if (!payload.name) errors.push("Vendor name is required");
  return { ok: errors.length === 0, errors, payload };
}

function validateRequest(body) {
  const payload = {
    requestNumber: body.requestNumber?.trim(),
    requester: body.requester?.trim(),
    department: body.department?.trim(),
    itemName: body.itemName?.trim(),
    quantity: Number(body.quantity),
    estimatedCost: Number(body.estimatedCost || 0),
  };
  const errors = [];
  if (!payload.requestNumber) errors.push("Request number is required");
  if (!payload.requester) errors.push("Requester is required");
  if (!payload.department) errors.push("Department is required");
  if (!payload.itemName) errors.push("Item name is required");
  if (!Number.isInteger(payload.quantity) || payload.quantity <= 0) errors.push("Quantity must be greater than zero");
  return { ok: errors.length === 0, errors, payload };
}

function validateOrder(body) {
  const payload = {
    poNumber: body.poNumber?.trim(),
    vendorId: Number(body.vendorId),
    requestId: body.requestId ? Number(body.requestId) : null,
    itemName: body.itemName?.trim(),
    quantity: Number(body.quantity),
    unitCost: Number(body.unitCost),
    expectedDelivery: body.expectedDelivery || null,
  };
  const errors = [];
  if (!payload.poNumber) errors.push("PO number is required");
  if (!Number.isFinite(payload.vendorId)) errors.push("Vendor is required");
  if (!payload.itemName) errors.push("Item name is required");
  if (!Number.isInteger(payload.quantity) || payload.quantity <= 0) errors.push("Quantity must be greater than zero");
  if (!Number.isFinite(payload.unitCost) || payload.unitCost < 0) errors.push("Unit cost must be valid");
  return { ok: errors.length === 0, errors, payload };
}

function validateReceipt(body) {
  const payload = {
    receiptNumber: body.receiptNumber?.trim(),
    orderId: Number(body.orderId),
    receivedQuantity: Number(body.receivedQuantity),
    receivedDate: body.receivedDate,
    status: body.status?.trim()?.toUpperCase() || "COMPLETE",
  };
  const errors = [];
  if (!payload.receiptNumber) errors.push("Receipt number is required");
  if (!Number.isFinite(payload.orderId)) errors.push("Order is required");
  if (!Number.isInteger(payload.receivedQuantity) || payload.receivedQuantity <= 0) errors.push("Received quantity must be greater than zero");
  if (!payload.receivedDate) errors.push("Received date is required");
  return { ok: errors.length === 0, errors, payload };
}

function validateInvoice(body) {
  const payload = {
    invoiceNumber: body.invoiceNumber?.trim(),
    orderId: Number(body.orderId),
    invoiceAmount: Number(body.invoiceAmount),
    invoiceDate: body.invoiceDate,
  };
  const errors = [];
  if (!payload.invoiceNumber) errors.push("Invoice number is required");
  if (!Number.isFinite(payload.orderId)) errors.push("Order is required");
  if (!Number.isFinite(payload.invoiceAmount) || payload.invoiceAmount < 0) errors.push("Invoice amount must be valid");
  if (!payload.invoiceDate) errors.push("Invoice date is required");
  return { ok: errors.length === 0, errors, payload };
}

module.exports = {
  validateInvoice,
  validateOrder,
  validateReceipt,
  validateRequest,
  validateVendor,
};
