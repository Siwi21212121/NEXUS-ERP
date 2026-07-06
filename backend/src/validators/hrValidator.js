const EMPLOYEE_STATUSES = ["ACTIVE", "REMOTE", "ON_LEAVE", "TERMINATED"];
const LEAVE_TYPES = ["ANNUAL", "SICK", "CASUAL", "UNPAID"];

function normalizeEmployee(body) {
  return {
    employeeCode: body.employeeCode?.trim(),
    firstName: body.firstName?.trim(),
    lastName: body.lastName?.trim(),
    email: body.email?.trim()?.toLowerCase(),
    phone: body.phone?.trim() || null,
    jobTitle: body.jobTitle?.trim(),
    employmentStatus: body.employmentStatus?.trim()?.toUpperCase() || "ACTIVE",
    departmentId: body.departmentId ? Number(body.departmentId) : null,
    managerId: body.managerId ? Number(body.managerId) : null,
    hireDate: body.hireDate,
  };
}

function validateEmployee(body) {
  const payload = normalizeEmployee(body);
  const errors = [];

  if (!payload.employeeCode) errors.push("Employee code is required");
  if (!payload.firstName) errors.push("First name is required");
  if (!payload.lastName) errors.push("Last name is required");
  if (!payload.email || !payload.email.includes("@")) errors.push("Valid email is required");
  if (!payload.jobTitle) errors.push("Job title is required");
  if (!EMPLOYEE_STATUSES.includes(payload.employmentStatus)) {
    errors.push(`Employment status must be one of: ${EMPLOYEE_STATUSES.join(", ")}`);
  }
  if (!payload.hireDate) errors.push("Hire date is required");

  return {
    ok: errors.length === 0,
    errors,
    payload,
  };
}

function parseEmployeeFilters(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 50);

  return {
    page,
    limit,
    offset: (page - 1) * limit,
    search: query.search?.trim() || "",
    departmentId: query.departmentId ? Number(query.departmentId) : null,
    status: EMPLOYEE_STATUSES.includes(query.status?.trim()?.toUpperCase())
      ? query.status.trim().toUpperCase()
      : "",
  };
}

function validateLeave(body) {
  const payload = {
    employeeId: Number(body.employeeId),
    leaveType: body.leaveType?.trim()?.toUpperCase(),
    startDate: body.startDate,
    endDate: body.endDate,
    reason: body.reason?.trim() || null,
  };
  const errors = [];

  if (!Number.isFinite(payload.employeeId)) errors.push("Employee is required");
  if (!LEAVE_TYPES.includes(payload.leaveType)) {
    errors.push(`Leave type must be one of: ${LEAVE_TYPES.join(", ")}`);
  }
  if (!payload.startDate) errors.push("Start date is required");
  if (!payload.endDate) errors.push("End date is required");
  if (payload.startDate && payload.endDate && payload.endDate < payload.startDate) {
    errors.push("End date must be after start date");
  }

  return {
    ok: errors.length === 0,
    errors,
    payload,
  };
}

function validateSalary(body) {
  const payload = {
    employeeId: Number(body.employeeId),
    baseSalary: Number(body.baseSalary),
    housingAllowance: Number(body.housingAllowance || 0),
    transportAllowance: Number(body.transportAllowance || 0),
    bonus: Number(body.bonus || 0),
    taxDeduction: Number(body.taxDeduction || 0),
    effectiveFrom: body.effectiveFrom,
  };
  const errors = [];

  if (!Number.isFinite(payload.employeeId)) errors.push("Employee is required");
  if (!Number.isFinite(payload.baseSalary) || payload.baseSalary < 0) {
    errors.push("Base salary must be a valid amount");
  }
  if (!payload.effectiveFrom) errors.push("Effective date is required");

  return {
    ok: errors.length === 0,
    errors,
    payload,
  };
}

module.exports = {
  EMPLOYEE_STATUSES,
  LEAVE_TYPES,
  parseEmployeeFilters,
  validateEmployee,
  validateLeave,
  validateSalary,
};
