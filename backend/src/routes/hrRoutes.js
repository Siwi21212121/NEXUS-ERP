const express = require("express");

const verifyToken =
  require("../middleware/authMiddleware");

const authorize =
  require("../middleware/roleMiddleware");

const {
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
} = require("../controllers/hrController");

const router = express.Router();
const hrAccess = [
  "HR_MANAGER",
  "OWNER"
];

router.get(
  "/dashboard",
  verifyToken,
  authorize(...hrAccess),
  getHRDashboard
);

router.get("/departments", verifyToken, authorize(...hrAccess), getDepartments);
router.get("/employees", verifyToken, authorize(...hrAccess), getEmployees);
router.post("/employees", verifyToken, authorize(...hrAccess), postEmployee);
router.get("/employees/:id", verifyToken, authorize(...hrAccess), getEmployeeProfile);
router.put("/employees/:id", verifyToken, authorize(...hrAccess), putEmployee);
router.delete("/employees/:id", verifyToken, authorize(...hrAccess), deleteEmployee);

router.post("/attendance/check-in", verifyToken, authorize(...hrAccess), postCheckIn);
router.post("/attendance/check-out", verifyToken, authorize(...hrAccess), postCheckOut);
router.get("/attendance/monthly", verifyToken, authorize(...hrAccess), getMonthlyAttendance);
router.get("/attendance/summary", verifyToken, authorize(...hrAccess), getAttendanceSummary);

router.get("/leaves", verifyToken, authorize(...hrAccess), getLeaves);
router.post("/leaves", verifyToken, authorize(...hrAccess), postLeave);
router.patch("/leaves/:id/approve", verifyToken, authorize(...hrAccess), approveLeave);
router.patch("/leaves/:id/reject", verifyToken, authorize(...hrAccess), rejectLeave);

router.post("/salary-structures", verifyToken, authorize(...hrAccess), postSalary);
router.get("/payroll/monthly", verifyToken, authorize(...hrAccess), getMonthlyPayroll);
router.get("/payroll/history/:employeeId", verifyToken, authorize(...hrAccess), getPayrollHistory);
router.get("/payroll/:payrollId/payslip", verifyToken, authorize(...hrAccess), getPayslip);
router.get("/docs", verifyToken, authorize(...hrAccess), getHRApiDocs);

module.exports = router;
