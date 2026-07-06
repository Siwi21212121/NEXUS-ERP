# HR Module API

Base path: `/api/hr`

Authentication: `Authorization: Bearer <JWT>`

Allowed roles: `OWNER`, `HR_MANAGER`

## Database Migration

Run:

```sql
\i backend/src/migrations/002_hr_module.sql
```

The migration creates normalized HR tables:

- `hr_departments`
- `hr_employees`
- `hr_attendance`
- `hr_leave_requests`
- `hr_salary_structures`
- `hr_payroll_runs`

It inserts seed departments, employees, attendance, leave requests, salary structures, and payroll runs.

## Dashboard

- `GET /dashboard`

Returns real database metrics for total employees, department distribution, today's attendance, pending leaves, monthly payroll, attendance trend, and joining trend.

## Employee Management

- `GET /departments`
- `GET /employees?page=1&limit=10&search=&departmentId=&status=`
- `POST /employees`
- `GET /employees/:id`
- `PUT /employees/:id`
- `DELETE /employees/:id`

Employee body:

```json
{
  "employeeCode": "EMP-1100",
  "firstName": "Riya",
  "lastName": "Kapoor",
  "email": "riya.kapoor@clarionex.com",
  "phone": "+91-90000-1100",
  "jobTitle": "People Operations Analyst",
  "employmentStatus": "ACTIVE",
  "departmentId": 1,
  "managerId": 1,
  "hireDate": "2026-06-27"
}
```

## Attendance

- `POST /attendance/check-in`
- `POST /attendance/check-out`
- `GET /attendance/monthly?month=2026-06`
- `GET /attendance/summary?month=2026-06`

Attendance body:

```json
{
  "employeeId": 1
}
```

## Leave Management

- `GET /leaves`
- `POST /leaves`
- `PATCH /leaves/:id/approve`
- `PATCH /leaves/:id/reject`

Leave body:

```json
{
  "employeeId": 1,
  "leaveType": "ANNUAL",
  "startDate": "2026-07-01",
  "endDate": "2026-07-03",
  "reason": "Family travel"
}
```

## Payroll

- `POST /salary-structures`
- `GET /payroll/monthly?month=2026-06`
- `GET /payroll/history/:employeeId`
- `GET /payroll/:payrollId/payslip`

Salary body:

```json
{
  "employeeId": 1,
  "baseSalary": 1200000,
  "housingAllowance": 240000,
  "transportAllowance": 60000,
  "bonus": 100000,
  "taxDeduction": 180000,
  "effectiveFrom": "2026-01-01"
}
```

## Docs

- `GET /docs`
