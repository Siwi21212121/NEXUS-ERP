const VALID_TYPES = ["REVENUE", "EXPENSE", "RECEIVABLE", "PAYABLE"];
const VALID_STATUSES = ["PAID", "PENDING", "OVERDUE", "APPROVED", "DRAFT"];
const INVOICE_STATUSES = ["DRAFT", "SENT", "PARTIAL", "PAID", "OVERDUE"];
const PAYMENT_DIRECTIONS = ["INCOMING", "OUTGOING"];
const PAYMENT_STATUSES = ["PENDING", "COMPLETED", "FAILED"];
const BUDGET_STATUSES = ["APPROVED", "REVIEW", "LOCKED"];

function normalizeTransactionPayload(body) {
  return {
    transactionNumber: body.transactionNumber?.trim(),
    counterparty: body.counterparty?.trim(),
    transactionType: body.transactionType?.trim()?.toUpperCase(),
    status: body.status?.trim()?.toUpperCase() || "DRAFT",
    category: body.category?.trim() || "General",
    amount: Number(body.amount),
    transactionDate: body.transactionDate,
    dueDate: body.dueDate || null,
    notes: body.notes?.trim() || null,
  };
}

function validateTransaction(body) {
  const payload = normalizeTransactionPayload(body);
  const errors = [];

  if (!payload.transactionNumber) errors.push("Transaction number is required");
  if (!payload.counterparty) errors.push("Counterparty is required");
  if (!VALID_TYPES.includes(payload.transactionType)) {
    errors.push(`Transaction type must be one of: ${VALID_TYPES.join(", ")}`);
  }
  if (!VALID_STATUSES.includes(payload.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(", ")}`);
  }
  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    errors.push("Amount must be greater than zero");
  }
  if (!payload.transactionDate) errors.push("Transaction date is required");

  return {
    ok: errors.length === 0,
    errors,
    payload,
  };
}

function validateBudget(body) {
  const payload = {
    department: body.department?.trim(),
    fiscalYear: Number(body.fiscalYear),
    allocatedAmount: Number(body.allocatedAmount),
    spentAmount: Number(body.spentAmount || 0),
    status: body.status?.trim()?.toUpperCase() || "REVIEW",
  };
  const errors = [];

  if (!payload.department) errors.push("Department is required");
  if (!Number.isInteger(payload.fiscalYear)) errors.push("Fiscal year is required");
  if (!Number.isFinite(payload.allocatedAmount) || payload.allocatedAmount < 0) {
    errors.push("Allocated amount must be valid");
  }
  if (!BUDGET_STATUSES.includes(payload.status)) {
    errors.push(`Budget status must be one of: ${BUDGET_STATUSES.join(", ")}`);
  }

  return { ok: errors.length === 0, errors, payload };
}

function validateInvoice(body) {
  const subtotal = Number(body.subtotal);
  const taxAmount = Number(body.taxAmount || 0);
  const totalAmount = Number(body.totalAmount || subtotal + taxAmount);
  const payload = {
    invoiceNumber: body.invoiceNumber?.trim(),
    customerName: body.customerName?.trim(),
    invoiceDate: body.invoiceDate,
    dueDate: body.dueDate,
    subtotal,
    taxAmount,
    totalAmount,
    paidAmount: Number(body.paidAmount || 0),
    status: body.status?.trim()?.toUpperCase() || "DRAFT",
  };
  const errors = [];

  if (!payload.invoiceNumber) errors.push("Invoice number is required");
  if (!payload.customerName) errors.push("Customer name is required");
  if (!payload.invoiceDate) errors.push("Invoice date is required");
  if (!payload.dueDate) errors.push("Due date is required");
  if (!Number.isFinite(payload.subtotal) || payload.subtotal < 0) errors.push("Subtotal must be valid");
  if (!Number.isFinite(payload.totalAmount) || payload.totalAmount < 0) errors.push("Total amount must be valid");
  if (!INVOICE_STATUSES.includes(payload.status)) {
    errors.push(`Invoice status must be one of: ${INVOICE_STATUSES.join(", ")}`);
  }

  return { ok: errors.length === 0, errors, payload };
}

function validatePayment(body) {
  const payload = {
    paymentNumber: body.paymentNumber?.trim(),
    invoiceId: body.invoiceId ? Number(body.invoiceId) : null,
    counterparty: body.counterparty?.trim(),
    paymentDirection: body.paymentDirection?.trim()?.toUpperCase(),
    paymentMethod: body.paymentMethod?.trim() || "BANK_TRANSFER",
    amount: Number(body.amount),
    paymentDate: body.paymentDate,
    status: body.status?.trim()?.toUpperCase() || "PENDING",
  };
  const errors = [];

  if (!payload.paymentNumber) errors.push("Payment number is required");
  if (!payload.counterparty) errors.push("Counterparty is required");
  if (!PAYMENT_DIRECTIONS.includes(payload.paymentDirection)) {
    errors.push(`Payment direction must be one of: ${PAYMENT_DIRECTIONS.join(", ")}`);
  }
  if (!Number.isFinite(payload.amount) || payload.amount <= 0) errors.push("Amount must be greater than zero");
  if (!payload.paymentDate) errors.push("Payment date is required");
  if (!PAYMENT_STATUSES.includes(payload.status)) {
    errors.push(`Payment status must be one of: ${PAYMENT_STATUSES.join(", ")}`);
  }

  return { ok: errors.length === 0, errors, payload };
}

function parseTransactionFilters(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 50);
  const status = query.status?.trim()?.toUpperCase();
  const type = query.type?.trim()?.toUpperCase();

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    search: query.search?.trim() || "",
    status: VALID_STATUSES.includes(status) ? status : "",
    type: VALID_TYPES.includes(type) ? type : "",
  };
}

module.exports = {
  BUDGET_STATUSES,
  INVOICE_STATUSES,
  PAYMENT_DIRECTIONS,
  PAYMENT_STATUSES,
  VALID_TYPES,
  VALID_STATUSES,
  parseTransactionFilters,
  validateBudget,
  validateInvoice,
  validatePayment,
  validateTransaction,
};
