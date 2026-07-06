const pool = require("../config/db");

function mapEmployee(row) {
  if (!row) return null;

  return {
    id: row.id,
    employeeCode: row.employeeCode,
    firstName: row.firstName,
    lastName: row.lastName,
    fullName: `${row.firstName} ${row.lastName}`,
    email: row.email,
    phone: row.phone,
    jobTitle: row.jobTitle,
    employmentStatus: row.employmentStatus,
    hireDate: row.hireDate,
    department: row.departmentId
      ? {
          id: row.departmentId,
          name: row.departmentName,
          code: row.departmentCode,
        }
      : null,
    manager: row.managerId
      ? {
          id: row.managerId,
          name: row.managerName,
        }
      : null,
  };
}

const employeeSelect = `
  e.id,
  e.employee_code AS "employeeCode",
  e.first_name AS "firstName",
  e.last_name AS "lastName",
  e.email,
  e.phone,
  e.job_title AS "jobTitle",
  e.employment_status AS "employmentStatus",
  e.hire_date AS "hireDate",
  d.id AS "departmentId",
  d.name AS "departmentName",
  d.code AS "departmentCode",
  m.id AS "managerId",
  CONCAT(m.first_name, ' ', m.last_name) AS "managerName"
`;

async function getDashboardData() {
  const totalQuery = pool.query(`
    SELECT
      COUNT(*)::INTEGER AS total_employees,
      COUNT(*) FILTER (WHERE hire_date >= DATE_TRUNC('month', CURRENT_DATE))::INTEGER AS new_joiners
    FROM hr_employees
    WHERE employment_status <> 'TERMINATED'
  `);

  const departmentQuery = pool.query(`
    SELECT d.name, COUNT(e.id)::INTEGER AS value
    FROM hr_departments d
    LEFT JOIN hr_employees e ON e.department_id = d.id AND e.employment_status <> 'TERMINATED'
    GROUP BY d.id, d.name
    ORDER BY d.name
  `);

  const attendanceTodayQuery = pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'PRESENT')::INTEGER AS present,
      COUNT(*) FILTER (WHERE status = 'REMOTE')::INTEGER AS remote,
      COUNT(*) FILTER (WHERE status = 'ON_LEAVE')::INTEGER AS on_leave
    FROM hr_attendance
    WHERE attendance_date = CURRENT_DATE
  `);

  const leaveQuery = pool.query(`
    SELECT COUNT(*)::INTEGER AS pending
    FROM hr_leave_requests
    WHERE status = 'PENDING'
  `);

  const payrollQuery = pool.query(`
    SELECT COALESCE(SUM(net_pay), 0) AS monthly_payroll
    FROM hr_payroll_runs
    WHERE payroll_month = DATE_TRUNC('month', CURRENT_DATE)::DATE
  `);

  const attendanceTrendQuery = pool.query(`
    SELECT TO_CHAR(attendance_date, 'DD Mon') AS day, COUNT(*)::INTEGER AS present
    FROM hr_attendance
    WHERE attendance_date >= CURRENT_DATE - INTERVAL '14 days'
    GROUP BY attendance_date
    ORDER BY attendance_date
  `);

  const joiningTrendQuery = pool.query(`
    SELECT TO_CHAR(DATE_TRUNC('month', hire_date), 'MON') AS month, COUNT(*)::INTEGER AS count
    FROM hr_employees
    WHERE hire_date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months'
    GROUP BY DATE_TRUNC('month', hire_date)
    ORDER BY DATE_TRUNC('month', hire_date)
  `);

  const [
    totalResult,
    departmentResult,
    attendanceTodayResult,
    leaveResult,
    payrollResult,
    attendanceTrendResult,
    joiningTrendResult,
  ] = await Promise.all([
    totalQuery,
    departmentQuery,
    attendanceTodayQuery,
    leaveQuery,
    payrollQuery,
    attendanceTrendQuery,
    joiningTrendQuery,
  ]);

  return {
    cards: {
      totalEmployees: totalResult.rows[0]?.total_employees || 0,
      newJoiners: totalResult.rows[0]?.new_joiners || 0,
      todayAttendance: attendanceTodayResult.rows[0]?.present || 0,
      remoteToday: attendanceTodayResult.rows[0]?.remote || 0,
      leavesPending: leaveResult.rows[0]?.pending || 0,
      monthlyPayroll: Number(payrollResult.rows[0]?.monthly_payroll || 0),
    },
    departmentDistribution: departmentResult.rows,
    attendanceTrend: attendanceTrendResult.rows,
    joiningTrend: joiningTrendResult.rows,
  };
}

async function listDepartments() {
  const result = await pool.query(`
    SELECT id, name, code, location
    FROM hr_departments
    ORDER BY name
  `);

  return result.rows;
}

async function listEmployees(filters) {
  const conditions = ["e.employment_status <> 'TERMINATED'"];
  const values = [];

  if (filters.search) {
    values.push(`%${filters.search}%`);
    conditions.push(`(
      e.employee_code ILIKE $${values.length}
      OR e.first_name ILIKE $${values.length}
      OR e.last_name ILIKE $${values.length}
      OR e.email ILIKE $${values.length}
      OR e.job_title ILIKE $${values.length}
    )`);
  }

  if (filters.departmentId) {
    values.push(filters.departmentId);
    conditions.push(`e.department_id = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`e.employment_status = $${values.length}`);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;
  const countValues = [...values];
  values.push(filters.limit);
  const limitIndex = values.length;
  values.push(filters.offset);
  const offsetIndex = values.length;

  const dataQuery = pool.query(
    `
    SELECT ${employeeSelect}
    FROM hr_employees e
    LEFT JOIN hr_departments d ON d.id = e.department_id
    LEFT JOIN hr_employees m ON m.id = e.manager_id
    ${whereClause}
    ORDER BY e.created_at DESC, e.id DESC
    LIMIT $${limitIndex} OFFSET $${offsetIndex}
    `,
    values
  );

  const countQuery = pool.query(
    `SELECT COUNT(*)::INTEGER AS total FROM hr_employees e ${whereClause}`,
    countValues
  );

  const [dataResult, countResult] = await Promise.all([dataQuery, countQuery]);
  const total = countResult.rows[0]?.total || 0;

  return {
    data: dataResult.rows.map(mapEmployee),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.ceil(total / filters.limit),
    },
  };
}

async function getEmployeeById(id) {
  const employeeResult = await pool.query(
    `
    SELECT ${employeeSelect}
    FROM hr_employees e
    LEFT JOIN hr_departments d ON d.id = e.department_id
    LEFT JOIN hr_employees m ON m.id = e.manager_id
    WHERE e.id = $1
    `,
    [id]
  );

  const salaryResult = await pool.query(
    `
    SELECT base_salary AS "baseSalary", housing_allowance AS "housingAllowance",
      transport_allowance AS "transportAllowance", bonus, tax_deduction AS "taxDeduction",
      effective_from AS "effectiveFrom"
    FROM hr_salary_structures
    WHERE employee_id = $1
    `,
    [id]
  );

  return {
    employee: mapEmployee(employeeResult.rows[0]),
    salary: salaryResult.rows[0] || null,
  };
}

async function createEmployee(payload) {
  const result = await pool.query(
    `
    INSERT INTO hr_employees
      (employee_code, first_name, last_name, email, phone, job_title, employment_status, department_id, manager_id, hire_date)
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id
    `,
    [
      payload.employeeCode,
      payload.firstName,
      payload.lastName,
      payload.email,
      payload.phone,
      payload.jobTitle,
      payload.employmentStatus,
      payload.departmentId,
      payload.managerId,
      payload.hireDate,
    ]
  );

  return getEmployeeById(result.rows[0].id);
}

async function updateEmployee(id, payload) {
  await pool.query(
    `
    UPDATE hr_employees
    SET employee_code = $1,
        first_name = $2,
        last_name = $3,
        email = $4,
        phone = $5,
        job_title = $6,
        employment_status = $7,
        department_id = $8,
        manager_id = $9,
        hire_date = $10,
        updated_at = NOW()
    WHERE id = $11
    `,
    [
      payload.employeeCode,
      payload.firstName,
      payload.lastName,
      payload.email,
      payload.phone,
      payload.jobTitle,
      payload.employmentStatus,
      payload.departmentId,
      payload.managerId,
      payload.hireDate,
      id,
    ]
  );

  return getEmployeeById(id);
}

async function deleteEmployee(id) {
  await pool.query(
    `
    UPDATE hr_employees
    SET employment_status = 'TERMINATED', updated_at = NOW()
    WHERE id = $1
    `,
    [id]
  );
}

async function checkIn(employeeId) {
  const result = await pool.query(
    `
    INSERT INTO hr_attendance (employee_id, attendance_date, check_in, status)
    VALUES ($1, CURRENT_DATE, NOW(), 'PRESENT')
    ON CONFLICT (employee_id, attendance_date)
    DO UPDATE SET check_in = COALESCE(hr_attendance.check_in, NOW()), status = 'PRESENT', updated_at = NOW()
    RETURNING id, employee_id AS "employeeId", attendance_date AS "attendanceDate", check_in AS "checkIn", check_out AS "checkOut", status
    `,
    [employeeId]
  );

  return result.rows[0];
}

async function checkOut(employeeId) {
  const result = await pool.query(
    `
    UPDATE hr_attendance
    SET check_out = NOW(), updated_at = NOW()
    WHERE employee_id = $1 AND attendance_date = CURRENT_DATE
    RETURNING id, employee_id AS "employeeId", attendance_date AS "attendanceDate", check_in AS "checkIn", check_out AS "checkOut", status
    `,
    [employeeId]
  );

  return result.rows[0];
}

async function getMonthlyAttendance(month) {
  const targetMonth = month || new Date().toISOString().slice(0, 7);
  const result = await pool.query(
    `
    SELECT
      a.id,
      a.attendance_date AS "attendanceDate",
      a.check_in AS "checkIn",
      a.check_out AS "checkOut",
      a.status,
      e.id AS "employeeId",
      CONCAT(e.first_name, ' ', e.last_name) AS "employeeName"
    FROM hr_attendance a
    JOIN hr_employees e ON e.id = a.employee_id
    WHERE TO_CHAR(a.attendance_date, 'YYYY-MM') = $1
    ORDER BY a.attendance_date DESC, e.first_name
    `,
    [targetMonth]
  );

  return result.rows;
}

async function getAttendanceSummary(month) {
  const targetMonth = month || new Date().toISOString().slice(0, 7);
  const result = await pool.query(
    `
    SELECT status, COUNT(*)::INTEGER AS count
    FROM hr_attendance
    WHERE TO_CHAR(attendance_date, 'YYYY-MM') = $1
    GROUP BY status
    ORDER BY status
    `,
    [targetMonth]
  );

  return result.rows;
}

async function listLeaves() {
  const result = await pool.query(`
    SELECT
      l.id,
      l.leave_type AS "leaveType",
      l.start_date AS "startDate",
      l.end_date AS "endDate",
      l.reason,
      l.status,
      l.created_at AS "createdAt",
      e.id AS "employeeId",
      CONCAT(e.first_name, ' ', e.last_name) AS "employeeName"
    FROM hr_leave_requests l
    JOIN hr_employees e ON e.id = l.employee_id
    ORDER BY l.created_at DESC
  `);

  return result.rows;
}

async function createLeave(payload) {
  const result = await pool.query(
    `
    INSERT INTO hr_leave_requests (employee_id, leave_type, start_date, end_date, reason)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
    `,
    [
      payload.employeeId,
      payload.leaveType,
      payload.startDate,
      payload.endDate,
      payload.reason,
    ]
  );

  return result.rows[0];
}

async function reviewLeave(id, status, reviewerId) {
  const result = await pool.query(
    `
    UPDATE hr_leave_requests
    SET status = $1, reviewed_by = $2, reviewed_at = NOW(), updated_at = NOW()
    WHERE id = $3
    RETURNING id, status
    `,
    [status, reviewerId || null, id]
  );

  return result.rows[0];
}

async function upsertSalary(payload) {
  const result = await pool.query(
    `
    INSERT INTO hr_salary_structures
      (employee_id, base_salary, housing_allowance, transport_allowance, bonus, tax_deduction, effective_from)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (employee_id)
    DO UPDATE SET
      base_salary = EXCLUDED.base_salary,
      housing_allowance = EXCLUDED.housing_allowance,
      transport_allowance = EXCLUDED.transport_allowance,
      bonus = EXCLUDED.bonus,
      tax_deduction = EXCLUDED.tax_deduction,
      effective_from = EXCLUDED.effective_from,
      updated_at = NOW()
    RETURNING id
    `,
    [
      payload.employeeId,
      payload.baseSalary,
      payload.housingAllowance,
      payload.transportAllowance,
      payload.bonus,
      payload.taxDeduction,
      payload.effectiveFrom,
    ]
  );

  return result.rows[0];
}

async function getMonthlyPayroll(month) {
  const targetMonth = month
    ? `${month}-01`
    : new Date().toISOString().slice(0, 7) + "-01";
  const result = await pool.query(
    `
    SELECT
      p.id,
      p.payroll_month AS "payrollMonth",
      p.gross_pay AS "grossPay",
      p.deductions,
      p.net_pay AS "netPay",
      p.status,
      p.paid_at AS "paidAt",
      e.id AS "employeeId",
      CONCAT(e.first_name, ' ', e.last_name) AS "employeeName",
      e.job_title AS "jobTitle"
    FROM hr_payroll_runs p
    JOIN hr_employees e ON e.id = p.employee_id
    WHERE p.payroll_month = $1
    ORDER BY e.first_name
    `,
    [targetMonth]
  );

  return result.rows.map((row) => ({
    ...row,
    grossPay: Number(row.grossPay || 0),
    deductions: Number(row.deductions || 0),
    netPay: Number(row.netPay || 0),
  }));
}

async function getPayrollHistory(employeeId) {
  const result = await pool.query(
    `
    SELECT id, payroll_month AS "payrollMonth", gross_pay AS "grossPay",
      deductions, net_pay AS "netPay", status, paid_at AS "paidAt"
    FROM hr_payroll_runs
    WHERE employee_id = $1
    ORDER BY payroll_month DESC
    `,
    [employeeId]
  );

  return result.rows;
}

async function getPayslip(payrollId) {
  const result = await pool.query(
    `
    SELECT
      p.id,
      p.payroll_month AS "payrollMonth",
      p.gross_pay AS "grossPay",
      p.deductions,
      p.net_pay AS "netPay",
      p.status,
      e.employee_code AS "employeeCode",
      CONCAT(e.first_name, ' ', e.last_name) AS "employeeName",
      e.job_title AS "jobTitle",
      d.name AS "departmentName"
    FROM hr_payroll_runs p
    JOIN hr_employees e ON e.id = p.employee_id
    LEFT JOIN hr_departments d ON d.id = e.department_id
    WHERE p.id = $1
    `,
    [payrollId]
  );

  return result.rows[0] || null;
}

module.exports = {
  checkIn,
  checkOut,
  createEmployee,
  createLeave,
  deleteEmployee,
  getAttendanceSummary,
  getDashboardData,
  getEmployeeById,
  getMonthlyAttendance,
  getMonthlyPayroll,
  getPayrollHistory,
  getPayslip,
  listDepartments,
  listEmployees,
  listLeaves,
  reviewLeave,
  updateEmployee,
  upsertSalary,
};
