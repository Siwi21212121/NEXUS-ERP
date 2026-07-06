-- HR module schema and seed data for ClarioNex ERP.
-- Run after the base auth/users schema exists.

CREATE TABLE IF NOT EXISTS hr_departments (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  location VARCHAR(120),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_employees (
  id BIGSERIAL PRIMARY KEY,
  employee_code VARCHAR(40) UNIQUE NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  phone VARCHAR(40),
  job_title VARCHAR(120) NOT NULL,
  employment_status VARCHAR(30) NOT NULL CHECK (
    employment_status IN ('ACTIVE', 'REMOTE', 'ON_LEAVE', 'TERMINATED')
  ) DEFAULT 'ACTIVE',
  department_id BIGINT REFERENCES hr_departments(id) ON DELETE SET NULL,
  manager_id BIGINT REFERENCES hr_employees(id) ON DELETE SET NULL,
  hire_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_attendance (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL CHECK (
    status IN ('PRESENT', 'ABSENT', 'REMOTE', 'ON_LEAVE', 'HALF_DAY')
  ) DEFAULT 'PRESENT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS hr_leave_requests (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  leave_type VARCHAR(40) NOT NULL CHECK (
    leave_type IN ('ANNUAL', 'SICK', 'CASUAL', 'UNPAID')
  ),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL CHECK (
    status IN ('PENDING', 'APPROVED', 'REJECTED')
  ) DEFAULT 'PENDING',
  reviewed_by BIGINT REFERENCES hr_employees(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS hr_salary_structures (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT UNIQUE NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  base_salary NUMERIC(14, 2) NOT NULL CHECK (base_salary >= 0),
  housing_allowance NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (housing_allowance >= 0),
  transport_allowance NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (transport_allowance >= 0),
  bonus NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (bonus >= 0),
  tax_deduction NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (tax_deduction >= 0),
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_payroll_runs (
  id BIGSERIAL PRIMARY KEY,
  employee_id BIGINT NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  payroll_month DATE NOT NULL,
  gross_pay NUMERIC(14, 2) NOT NULL CHECK (gross_pay >= 0),
  deductions NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (deductions >= 0),
  net_pay NUMERIC(14, 2) NOT NULL CHECK (net_pay >= 0),
  status VARCHAR(20) NOT NULL CHECK (
    status IN ('DRAFT', 'PROCESSED', 'PAID')
  ) DEFAULT 'PROCESSED',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(employee_id, payroll_month)
);

CREATE INDEX IF NOT EXISTS idx_hr_employees_department
  ON hr_employees(department_id);

CREATE INDEX IF NOT EXISTS idx_hr_employees_manager
  ON hr_employees(manager_id);

CREATE INDEX IF NOT EXISTS idx_hr_attendance_date
  ON hr_attendance(attendance_date);

CREATE INDEX IF NOT EXISTS idx_hr_leave_status
  ON hr_leave_requests(status);

CREATE INDEX IF NOT EXISTS idx_hr_payroll_month
  ON hr_payroll_runs(payroll_month);

INSERT INTO hr_departments (name, code, location)
VALUES
  ('Human Resources', 'HR', 'Bengaluru'),
  ('Finance', 'FIN', 'Mumbai'),
  ('Engineering', 'ENG', 'Hyderabad'),
  ('Supply Chain', 'SCM', 'Pune'),
  ('Sales Operations', 'SALES', 'Delhi')
ON CONFLICT (code) DO NOTHING;

INSERT INTO hr_employees
  (employee_code, first_name, last_name, email, phone, job_title, employment_status, department_id, hire_date)
SELECT 'EMP-1001', 'Sophia', 'Turner', 'sophia.turner@clarionex.com', '+91-90000-1001', 'HR Manager', 'ACTIVE', id, '2024-01-15'
FROM hr_departments WHERE code = 'HR'
ON CONFLICT (employee_code) DO NOTHING;

INSERT INTO hr_employees
  (employee_code, first_name, last_name, email, phone, job_title, employment_status, department_id, manager_id, hire_date)
SELECT 'EMP-1002', 'Michael', 'Chen', 'michael.chen@clarionex.com', '+91-90000-1002', 'Software Engineer', 'REMOTE', d.id, m.id, '2024-04-03'
FROM hr_departments d
CROSS JOIN hr_employees m
WHERE d.code = 'ENG' AND m.employee_code = 'EMP-1001'
ON CONFLICT (employee_code) DO NOTHING;

INSERT INTO hr_employees
  (employee_code, first_name, last_name, email, phone, job_title, employment_status, department_id, manager_id, hire_date)
SELECT 'EMP-1003', 'Emma', 'Wilson', 'emma.wilson@clarionex.com', '+91-90000-1003', 'Finance Executive', 'ON_LEAVE', d.id, m.id, '2025-02-12'
FROM hr_departments d
CROSS JOIN hr_employees m
WHERE d.code = 'FIN' AND m.employee_code = 'EMP-1001'
ON CONFLICT (employee_code) DO NOTHING;

INSERT INTO hr_employees
  (employee_code, first_name, last_name, email, phone, job_title, employment_status, department_id, manager_id, hire_date)
SELECT 'EMP-1004', 'David', 'Johnson', 'david.johnson@clarionex.com', '+91-90000-1004', 'Operations Lead', 'ACTIVE', d.id, m.id, '2025-06-20'
FROM hr_departments d
CROSS JOIN hr_employees m
WHERE d.code = 'SCM' AND m.employee_code = 'EMP-1001'
ON CONFLICT (employee_code) DO NOTHING;

INSERT INTO hr_employees
  (employee_code, first_name, last_name, email, phone, job_title, employment_status, department_id, manager_id, hire_date)
SELECT 'EMP-1005', 'Aarav', 'Mehta', 'aarav.mehta@clarionex.com', '+91-90000-1005', 'Sales Analyst', 'ACTIVE', d.id, m.id, '2026-01-10'
FROM hr_departments d
CROSS JOIN hr_employees m
WHERE d.code = 'SALES' AND m.employee_code = 'EMP-1001'
ON CONFLICT (employee_code) DO NOTHING;

INSERT INTO hr_attendance (employee_id, attendance_date, check_in, check_out, status)
SELECT id, CURRENT_DATE, NOW() - INTERVAL '8 hours', NOW() - INTERVAL '30 minutes', 'PRESENT'
FROM hr_employees
WHERE employee_code IN ('EMP-1001', 'EMP-1002', 'EMP-1004', 'EMP-1005')
ON CONFLICT (employee_id, attendance_date) DO NOTHING;

INSERT INTO hr_attendance (employee_id, attendance_date, check_in, check_out, status)
SELECT id, CURRENT_DATE - INTERVAL '1 day', NOW() - INTERVAL '1 day 8 hours', NOW() - INTERVAL '1 day 1 hour', 'PRESENT'
FROM hr_employees
ON CONFLICT (employee_id, attendance_date) DO NOTHING;

INSERT INTO hr_leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
SELECT id, 'ANNUAL', CURRENT_DATE + INTERVAL '3 days', CURRENT_DATE + INTERVAL '5 days', 'Family travel', 'PENDING'
FROM hr_employees WHERE employee_code = 'EMP-1002'
ON CONFLICT DO NOTHING;

INSERT INTO hr_leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
SELECT id, 'SICK', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '1 day', 'Medical recovery', 'APPROVED'
FROM hr_employees WHERE employee_code = 'EMP-1003'
ON CONFLICT DO NOTHING;

INSERT INTO hr_salary_structures
  (employee_id, base_salary, housing_allowance, transport_allowance, bonus, tax_deduction, effective_from)
SELECT id, 1200000.00, 240000.00, 60000.00, 100000.00, 180000.00, '2026-01-01'
FROM hr_employees WHERE employee_code = 'EMP-1001'
ON CONFLICT (employee_id) DO NOTHING;

INSERT INTO hr_salary_structures
  (employee_id, base_salary, housing_allowance, transport_allowance, bonus, tax_deduction, effective_from)
SELECT id, 950000.00, 180000.00, 50000.00, 80000.00, 135000.00, '2026-01-01'
FROM hr_employees WHERE employee_code = 'EMP-1002'
ON CONFLICT (employee_id) DO NOTHING;

INSERT INTO hr_salary_structures
  (employee_id, base_salary, housing_allowance, transport_allowance, bonus, tax_deduction, effective_from)
SELECT id, 840000.00, 160000.00, 45000.00, 60000.00, 110000.00, '2026-01-01'
FROM hr_employees WHERE employee_code = 'EMP-1003'
ON CONFLICT (employee_id) DO NOTHING;

INSERT INTO hr_salary_structures
  (employee_id, base_salary, housing_allowance, transport_allowance, bonus, tax_deduction, effective_from)
SELECT id, 1020000.00, 210000.00, 55000.00, 90000.00, 150000.00, '2026-01-01'
FROM hr_employees WHERE employee_code = 'EMP-1004'
ON CONFLICT (employee_id) DO NOTHING;

INSERT INTO hr_payroll_runs
  (employee_id, payroll_month, gross_pay, deductions, net_pay, status, paid_at)
SELECT
  e.id,
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  (s.base_salary + s.housing_allowance + s.transport_allowance + s.bonus) / 12,
  s.tax_deduction / 12,
  ((s.base_salary + s.housing_allowance + s.transport_allowance + s.bonus) - s.tax_deduction) / 12,
  'PAID',
  NOW() - INTERVAL '2 days'
FROM hr_employees e
JOIN hr_salary_structures s ON s.employee_id = e.id
ON CONFLICT (employee_id, payroll_month) DO NOTHING;
