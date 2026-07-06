const hrService = require("../services/hrService");
const {
  parseEmployeeFilters,
  validateEmployee,
  validateLeave,
  validateSalary,
} = require("../validators/hrValidator");

function handleError(res, label, error) {
  if (error.code === "23505") {
    return res.status(409).json({
      success: false,
      message: "Duplicate record detected",
    });
  }

  console.error(label, error);

  return res.status(500).json({
    success: false,
    message: "HR service request failed",
  });
}

const getHRDashboard = async (req, res) => {
  try {
    const data = await hrService.getDashboardData();

    return res.json({
      success: true,
      dashboard: "HR Dashboard",
      accessBy: req.user.role,
      data,
    });
  } catch (error) {
    return handleError(res, "HR Dashboard Error:", error);
  }
};

const getDepartments = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: await hrService.listDepartments(),
    });
  } catch (error) {
    return handleError(res, "HR Departments Error:", error);
  }
};

const getEmployees = async (req, res) => {
  try {
    const filters = parseEmployeeFilters(req.query);
    const result = await hrService.listEmployees(filters);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return handleError(res, "HR Employees Error:", error);
  }
};

const getEmployeeProfile = async (req, res) => {
  try {
    const data = await hrService.getEmployeeById(req.params.id);

    if (!data.employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(res, "HR Employee Profile Error:", error);
  }
};

const postEmployee = async (req, res) => {
  try {
    const validation = validateEmployee(req.body);

    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const data = await hrService.createEmployee(validation.payload);

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data,
    });
  } catch (error) {
    return handleError(res, "HR Create Employee Error:", error);
  }
};

const putEmployee = async (req, res) => {
  try {
    const validation = validateEmployee(req.body);

    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const data = await hrService.updateEmployee(req.params.id, validation.payload);

    return res.json({
      success: true,
      message: "Employee updated successfully",
      data,
    });
  } catch (error) {
    return handleError(res, "HR Update Employee Error:", error);
  }
};

const deleteEmployee = async (req, res) => {
  try {
    await hrService.deleteEmployee(req.params.id);

    return res.json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    return handleError(res, "HR Delete Employee Error:", error);
  }
};

const postCheckIn = async (req, res) => {
  try {
    const data = await hrService.checkIn(Number(req.body.employeeId));

    return res.status(201).json({
      success: true,
      message: "Check-in recorded",
      data,
    });
  } catch (error) {
    return handleError(res, "HR Check In Error:", error);
  }
};

const postCheckOut = async (req, res) => {
  try {
    const data = await hrService.checkOut(Number(req.body.employeeId));

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "No check-in found for today",
      });
    }

    return res.json({
      success: true,
      message: "Check-out recorded",
      data,
    });
  } catch (error) {
    return handleError(res, "HR Check Out Error:", error);
  }
};

const getMonthlyAttendance = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: await hrService.getMonthlyAttendance(req.query.month),
    });
  } catch (error) {
    return handleError(res, "HR Monthly Attendance Error:", error);
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: await hrService.getAttendanceSummary(req.query.month),
    });
  } catch (error) {
    return handleError(res, "HR Attendance Summary Error:", error);
  }
};

const getLeaves = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: await hrService.listLeaves(),
    });
  } catch (error) {
    return handleError(res, "HR Leaves Error:", error);
  }
};

const postLeave = async (req, res) => {
  try {
    const validation = validateLeave(req.body);

    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Leave request submitted",
      data: await hrService.createLeave(validation.payload),
    });
  } catch (error) {
    return handleError(res, "HR Create Leave Error:", error);
  }
};

const approveLeave = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "Leave approved",
      data: await hrService.reviewLeave(req.params.id, "APPROVED", req.user.id),
    });
  } catch (error) {
    return handleError(res, "HR Approve Leave Error:", error);
  }
};

const rejectLeave = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "Leave rejected",
      data: await hrService.reviewLeave(req.params.id, "REJECTED", req.user.id),
    });
  } catch (error) {
    return handleError(res, "HR Reject Leave Error:", error);
  }
};

const postSalary = async (req, res) => {
  try {
    const validation = validateSalary(req.body);

    if (!validation.ok) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    return res.json({
      success: true,
      message: "Salary structure saved",
      data: await hrService.upsertSalary(validation.payload),
    });
  } catch (error) {
    return handleError(res, "HR Salary Error:", error);
  }
};

const getMonthlyPayroll = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: await hrService.getMonthlyPayroll(req.query.month),
    });
  } catch (error) {
    return handleError(res, "HR Payroll Error:", error);
  }
};

const getPayrollHistory = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: await hrService.getPayrollHistory(req.params.employeeId),
    });
  } catch (error) {
    return handleError(res, "HR Payroll History Error:", error);
  }
};

const getPayslip = async (req, res) => {
  try {
    const data = await hrService.getPayslip(req.params.payrollId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Payslip not found",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return handleError(res, "HR Payslip Error:", error);
  }
};

const getHRApiDocs = (req, res) => {
  return res.json({
    module: "HR",
    basePath: "/api/hr",
    authentication: "Bearer JWT token required",
    roles: ["OWNER", "HR_MANAGER"],
    endpoints: [
      "GET /dashboard",
      "GET /departments",
      "GET /employees",
      "POST /employees",
      "GET /employees/:id",
      "PUT /employees/:id",
      "DELETE /employees/:id",
      "POST /attendance/check-in",
      "POST /attendance/check-out",
      "GET /attendance/monthly",
      "GET /attendance/summary",
      "GET /leaves",
      "POST /leaves",
      "PATCH /leaves/:id/approve",
      "PATCH /leaves/:id/reject",
      "POST /salary-structures",
      "GET /payroll/monthly",
      "GET /payroll/history/:employeeId",
      "GET /payroll/:payrollId/payslip",
    ],
  });
};

module.exports = {
  approveLeave,
  deleteEmployee,
  getAttendanceSummary,
  getDepartments,
  getEmployeeProfile,
  getEmployees,
  getHRApiDocs,
  getHRDashboard,
  getLeaves,
  getMonthlyAttendance,
  getMonthlyPayroll,
  getPayrollHistory,
  getPayslip,
  postCheckIn,
  postCheckOut,
  postEmployee,
  postLeave,
  postSalary,
  putEmployee,
  rejectLeave,
};
